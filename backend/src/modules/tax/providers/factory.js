import { AvalaraTaxProvider } from "./avalara.provider.js";
import { StripeTaxProvider } from "./stripe-tax.provider.js";
import { TaxProvider } from "./tax-provider.js";
import { DefaultTaxProvider } from "./index.js";

export { TaxProvider } from "./tax-provider.js";
export { DefaultTaxProvider } from "./index.js";
export { AvalaraTaxProvider, US_STATE_TAX_RATES, CA_PROVINCE_TAX_RATES } from "./avalara.provider.js";
export { StripeTaxProvider } from "./stripe-tax.provider.js";

/**
 * Enterprise Tax Engine Factory
 * Dynamically resolves Avalara AvaTax, Stripe Tax, or Enterprise Jurisdiction Matrix
 */
export class TaxEngineFactory {
  static getProvider(providerName = process.env.TAX_PROVIDER || "AVALARA") {
    const selected = String(providerName).toUpperCase().trim();

    switch (selected) {
      case "AVALARA":
      case "AVATAX":
      case "AVALARA_AVATAX":
        return new AvalaraTaxProvider();

      case "STRIPE":
      case "STRIPE_TAX":
        return new StripeTaxProvider();

      default:
        return new AvalaraTaxProvider();
    }
  }
}
