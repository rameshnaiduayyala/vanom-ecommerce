import { PaymentProvider } from "./payment-provider.js";

export class RazorpayProvider extends PaymentProvider {
  async createPayment(input) {
    // TODO: integrate Razorpay SDK.
    return { provider: "razorpay", status: "PENDING", ...input };
  }
}
