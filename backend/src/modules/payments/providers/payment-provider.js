export class PaymentProvider {
  async createPayment() {
    throw new Error("PaymentProvider.createPayment must be implemented");
  }

  async refundPayment() {
    throw new Error("PaymentProvider.refundPayment must be implemented");
  }
}
