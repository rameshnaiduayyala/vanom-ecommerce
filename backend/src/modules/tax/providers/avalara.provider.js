import { TaxProvider } from "./tax-provider.js";

export class AvalaraProvider extends TaxProvider {
  async calculateTax(input) {
    // TODO: integrate Avalara AvaTax.
    return { provider: "avalara", ...input, taxAmount: 0 };
  }
}
