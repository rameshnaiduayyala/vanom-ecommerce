import { StripeProvider, RazorpayProvider, PayPalProvider } from "./providers/index.js";
import { OutboxService } from "../../infrastructure/outbox/outbox.service.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { Money } from "../../common/utils/money.js";
import { NotFoundError, BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * PaymentService
 * Direct Prisma queries, payment provider integrations (Stripe, Razorpay), webhooks, and ledger transactions
 */
export class PaymentService {
  constructor() {
    this.providers = {
      STRIPE: new StripeProvider(),
      RAZORPAY: new RazorpayProvider(),
      PAYPAL: new PayPalProvider(),
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
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { currency: true },
    });
    if (!order) throw new NotFoundError("Order not found", ERROR_CODES.ORDER_NOT_FOUND);

    const paymentProvider = this._getProvider(provider);
    
    let intent;
    try {
      intent = await paymentProvider.createIntent({
        amount: order.totalAmount,
        currency: order.currency.code,
        orderId: order.id,
        metadata: { orderNumber: order.orderNumber, userId: user.id },
      });
    } catch (err) {
      console.error(`Payment intent creation failed for ${provider}:`, err);
      throw new BusinessRuleError(`Failed to create payment intent with ${provider}: ${err.message}`);
    }

    if (!intent || !intent.providerPaymentId) {
      throw new BusinessRuleError("Payment provider returned invalid response");
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        currencyId: order.currencyId,
        provider: provider.toUpperCase(),
        providerPaymentId: intent.providerPaymentId,
        amount: order.totalAmount,
        status: "PENDING",
        metadata: intent || {},
        transactions: {
          create: {
            type: "AUTHORIZE",
            providerReference: intent.providerPaymentId,
            amount: order.totalAmount,
            status: "PENDING",
          },
        },
      },
      include: { transactions: true, order: true },
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
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        transactions: true,
        refunds: true,
        currency: true,
      },
    });
    if (!payment) throw new NotFoundError("Payment not found");

    const captureAmount = amount ? Money.toDecimal(amount) : payment.amount;
    const paymentProvider = this._getProvider(payment.provider);

    let result;
    try {
      result = await paymentProvider.capturePayment(payment.providerPaymentId, captureAmount);
    } catch (err) {
      console.error(`Payment capture failed for ${payment.provider}:`, err);
      throw new BusinessRuleError(`Failed to capture payment: ${err.message}`);
    }

    if (!result || !result.providerPaymentId) {
      throw new BusinessRuleError("Payment provider returned invalid response for capture");
    }

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "CAPTURED",
          capturedAmount: captureAmount,
        },
      });

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: "CAPTURE",
          amount: captureAmount,
          status: "CAPTURED",
          providerReference: payment.providerPaymentId,
          response: result || {},
        },
      });

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
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        transactions: true,
        refunds: true,
        currency: true,
      },
    });
    if (!payment) throw new NotFoundError("Payment not found");

    const refundAmount = amount ? Money.toDecimal(amount) : payment.amount;
    const paymentProvider = this._getProvider(payment.provider);

    let result;
    try {
      result = await paymentProvider.refundPayment(payment.providerPaymentId, refundAmount, reason);
    } catch (err) {
      console.error(`Payment refund failed for ${payment.provider}:`, err);
      throw new BusinessRuleError(`Failed to refund payment: ${err.message}`);
    }

    if (!result || !result.providerRefundId) {
      throw new BusinessRuleError("Payment provider returned invalid response for refund");
    }

    return prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          amount: refundAmount,
          reason,
          providerRefundId: result.providerRefundId,
          status: "REFUNDED",
        },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          refundedAmount: { increment: refundAmount },
          status: "REFUNDED",
        },
      });

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

    const existing = await prisma.paymentWebhook.findUnique({
      where: { externalEventId },
    });
    if (existing) {
      return { status: "ALREADY_PROCESSED", duplicate: true };
    }

    const providerPaymentId = payload.providerPaymentId || payload.id;
    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId },
      include: { order: true, transactions: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.paymentWebhook.create({
        data: {
          provider,
          externalEventId,
          status: "PROCESSED",
          payload,
        },
      });

      if (payment && (eventType === "payment.captured" || eventType === "charge.succeeded")) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "CAPTURED",
            capturedAmount: payment.amount,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        });
      }
    });

    return { status: "PROCESSED", success: true };
  }
}
