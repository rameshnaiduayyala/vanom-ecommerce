/**
 * DEPRECATED: Do not use custom tax-rate databases, datasets, or local tax calculation engines.
 * Sales tax calculation is exclusively handled by Stripe Tax via the backend:
 * POST /api/v1/checkout/calculate-tax (checkoutService.calculateStripeTax)
 */
export const TAX_DATASET = {};
export function calculateCheckoutTax() {
  console.warn("calculateCheckoutTax is deprecated. Use Api.checkout.calculateStripeTax instead.");
  return { totalTax: 0, effectiveRate: 0, itemsBreakdown: [] };
}
