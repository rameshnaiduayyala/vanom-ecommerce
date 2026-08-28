import { TaxProvider } from "./tax-provider.js";

export class StripeTaxProvider extends TaxProvider {
  async calculateTax(input) {
    // TODO: integrate Stripe Tax.
    return { provider: "stripe-tax", ...input, taxAmount: 0 };
  }
}
