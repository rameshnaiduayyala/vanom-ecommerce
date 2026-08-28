import { PaymentProvider } from "./payment-provider.js";

export class StripeProvider extends PaymentProvider {
  async createPayment(input) {
    // TODO: integrate Stripe SDK.
    return { provider: "stripe", status: "PENDING", ...input };
  }
}
