import { prisma } from "../../infrastructure/database/prisma.js";

export class PaymentRepository {
  static async createPayment({ orderId, currencyId, provider, providerPaymentId, amount, status = "PENDING", metadata }, tx = null) {
    const db = tx || prisma;
    return db.payment.create({
      data: {
        orderId,
        currencyId,
        provider,
        providerPaymentId,
        amount,
        status,
        metadata: metadata || {},
        transactions: {
          create: {
            type: "AUTHORIZE",
            providerReference: providerPaymentId,
            amount,
            status,
          },
        },
      },
      include: { transactions: true, order: true },
    });
  }

  static async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
        transactions: true,
        refunds: true,
        currency: true,
      },
    });
  }

  static async findByProviderPaymentId(providerPaymentId) {
    return prisma.payment.findFirst({
      where: { providerPaymentId },
      include: { order: true, transactions: true },
    });
  }

  static async updatePaymentStatus(id, status, capturedAmount = null, tx = null) {
    const db = tx || prisma;
    const data = { status };
    if (capturedAmount) data.capturedAmount = capturedAmount;
    return db.payment.update({
      where: { id },
      data,
    });
  }

  static async recordTransaction({ paymentId, type, amount, status, providerReference, response }, tx = null) {
    const db = tx || prisma;
    return db.paymentTransaction.create({
      data: {
        paymentId,
        type,
        amount,
        status,
        providerReference,
        response: response || {},
      },
    });
  }

  static async recordRefund({ paymentId, amount, reason, providerRefundId, status = "REFUNDED" }, tx = null) {
    const db = tx || prisma;
    const refund = await db.refund.create({
      data: {
        paymentId,
        amount,
        reason,
        providerRefundId,
        status,
      },
    });

    await db.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: { increment: amount },
        status: "REFUNDED",
      },
    });

    return refund;
  }

  static async findWebhookEvent(externalEventId) {
    return prisma.paymentWebhook.findUnique({
      where: { externalEventId },
    });
  }

  static async recordWebhookEvent({ provider, externalEventId, status, payload, errorMessage }, tx = null) {
    const db = tx || prisma;
    return db.paymentWebhook.create({
      data: {
        provider,
        externalEventId,
        status,
        payload,
        errorMessage,
      },
    });
  }
}
