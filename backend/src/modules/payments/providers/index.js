export class PaymentProvider {
  async createIntent({ amount, currency, orderId, metadata }) {
    throw new Error("createIntent must be implemented by payment provider");
  }

  async capturePayment(paymentId, amount) {
    throw new Error("capturePayment must be implemented by payment provider");
  }

  async refundPayment(paymentId, amount, reason) {
    throw new Error("refundPayment must be implemented by payment provider");
  }

  async verifyWebhookSignature(payload, signature) {
    throw new Error("verifyWebhookSignature must be implemented by payment provider");
  }
}

export class StripeProvider extends PaymentProvider {
  async createIntent({ amount, currency, orderId, metadata }) {
    return {
      provider: "STRIPE",
      providerPaymentId: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      clientSecret: `seti_secret_${Date.now()}`,
      status: "AUTHORIZED",
      amount,
      currency,
    };
  }

  async capturePayment(providerPaymentId, amount) {
    return {
      provider: "STRIPE",
      providerPaymentId,
      status: "CAPTURED",
      capturedAmount: amount,
    };
  }

  async refundPayment(providerPaymentId, amount, reason) {
    return {
      provider: "STRIPE",
      providerRefundId: `re_mock_${Date.now()}`,
      status: "REFUNDED",
      refundedAmount: amount,
      reason,
    };
  }

  async verifyWebhookSignature(payload, signature) {
    return true;
  }
}

export class RazorpayProvider extends PaymentProvider {
  async createIntent({ amount, currency, orderId, metadata }) {
    return {
      provider: "RAZORPAY",
      providerPaymentId: `order_rzp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      clientSecret: `rzp_key_${Date.now()}`,
      status: "AUTHORIZED",
      amount,
      currency,
    };
  }

  async capturePayment(providerPaymentId, amount) {
    return {
      provider: "RAZORPAY",
      providerPaymentId,
      status: "CAPTURED",
      capturedAmount: amount,
    };
  }

  async refundPayment(providerPaymentId, amount, reason) {
    return {
      provider: "RAZORPAY",
      providerRefundId: `rfnd_rzp_${Date.now()}`,
      status: "REFUNDED",
      refundedAmount: amount,
      reason,
    };
  }

  async verifyWebhookSignature(payload, signature) {
    return true;
  }
}
