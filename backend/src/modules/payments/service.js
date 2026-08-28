import { PaymentRepository } from "./repository.js";
import { StripeProvider, RazorpayProvider } from "./providers/index.js";
import { OrderRepository } from "../orders/repository.js";
import { OutboxService } from "../../infrastructure/outbox/outbox.service.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { Money } from "../../common/utils/money.js";
import { NotFoundError, BusinessRuleError, ConflictError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class PaymentService {
  constructor() {
    this.providers = {
      STRIPE: new StripeProvider(),
      RAZORPAY: new RazorpayProvider(),
    };
  }

  _getProvider(providerName = "STRIPE") {
    const provider = this.providers[providerName.toUpperCase()];
    if (!provider) {
      throw new BusinessRuleError(`Payment provider '${providerName}' is not supported`);
    }
    return provider;
  }

  async createPaymentIntent(user, { orderId, provider = "RAZORPAY" }) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found", ERROR_CODES.ORDER_NOT_FOUND);

    const paymentProvider = this._getProvider(provider);
    const intent = await paymentProvider.createIntent({
      amount: order.totalAmount,
      currency: order.currency.code,
      orderId: order.id,
      metadata: { orderNumber: order.orderNumber, userId: user.id },
    });

    const payment = await PaymentRepository.createPayment({
      orderId: order.id,
      currencyId: order.currencyId,
      provider: provider.toUpperCase(),
      providerPaymentId: intent.providerPaymentId,
      amount: order.totalAmount,
      status: "PENDING",
      metadata: intent,
    });

    return {
      paymentId: payment.id,
      providerPaymentId: intent.providerPaymentId,
      clientSecret: intent.clientSecret,
      amount: order.totalAmount,
      currency: order.currency.code,
    };
  }

  async capturePayment(paymentId, amount = null) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new NotFoundError("Payment not found");

    const captureAmount = amount ? Money.toDecimal(amount) : payment.amount;
    const paymentProvider = this._getProvider(payment.provider);

    const result = await paymentProvider.capturePayment(payment.providerPaymentId, captureAmount);

    return prisma.$transaction(async tx => {
      await PaymentRepository.updatePaymentStatus(payment.id, "CAPTURED", captureAmount, tx);
      await PaymentRepository.recordTransaction(
        {
          paymentId: payment.id,
          type: "CAPTURE",
          amount: captureAmount,
          status: "CAPTURED",
          providerReference: payment.providerPaymentId,
          response: result,
        },
        tx
      );

      // Update Order Status to PAID
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });

      // Create Outbox Event
      await OutboxService.recordEvent(
        {
          aggregateType: "PAYMENT",
          aggregateId: payment.id,
          eventType: "PAYMENT_CAPTURED",
          payload: {
            paymentId: payment.id,
            orderId: payment.orderId,
            amount: captureAmount,
            currency: payment.currency.code,
          },
        },
        tx
      );

      return { status: "CAPTURED", capturedAmount: captureAmount };
    });
  }

  async refundPayment(paymentId, user, { amount = null, reason = "Customer request" }) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new NotFoundError("Payment not found");

    const refundAmount = amount ? Money.toDecimal(amount) : payment.amount;
    const paymentProvider = this._getProvider(payment.provider);

    const result = await paymentProvider.refundPayment(payment.providerPaymentId, refundAmount, reason);

    return prisma.$transaction(async tx => {
      const refund = await PaymentRepository.recordRefund(
        {
          paymentId: payment.id,
          amount: refundAmount,
          reason,
          providerRefundId: result.providerRefundId,
          status: "REFUNDED",
        },
        tx
      );

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "REFUNDED" },
      });

      await OutboxService.recordEvent(
        {
          aggregateType: "PAYMENT",
          aggregateId: payment.id,
          eventType: "PAYMENT_REFUNDED",
          payload: { paymentId: payment.id, refundId: refund.id, amount: refundAmount },
        },
        tx
      );

      return refund;
    });
  }

  async processWebhook({ provider = "RAZORPAY", externalEventId, eventType, payload }) {
    if (!externalEventId) {
      throw new BusinessRuleError("externalEventId is required for webhook processing");
    }

    // Idempotent webhook check
    const existing = await PaymentRepository.findWebhookEvent(externalEventId);
    if (existing) {
      return { status: "ALREADY_PROCESSED", duplicate: true };
    }

    const providerPaymentId = payload.providerPaymentId || payload.id;
    const payment = await PaymentRepository.findByProviderPaymentId(providerPaymentId);

    await prisma.$transaction(async tx => {
      await PaymentRepository.recordWebhookEvent(
        {
          provider,
          externalEventId,
          status: "PROCESSED",
          payload,
        },
        tx
      );

      if (payment && (eventType === "payment.captured" || eventType === "charge.succeeded")) {
        await PaymentRepository.updatePaymentStatus(payment.id, "CAPTURED", payment.amount, tx);
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        });
      }
    });

    return { status: "PROCESSED", success: true };
  }
}
