export class PaymentProvider {
  async createIntent({ amount, currency, orderId, metadata }) {
    throw new Error("PaymentProvider.createIntent must be implemented");
  }

  async capturePayment(paymentId, amount) {
    throw new Error("PaymentProvider.capturePayment must be implemented");
  }

  async refundPayment(paymentId, amount, reason) {
    throw new Error("PaymentProvider.refundPayment must be implemented");
  }

  async verifyWebhookSignature(payload, signature) {
    throw new Error("PaymentProvider.verifyWebhookSignature must be implemented");
  }
}
