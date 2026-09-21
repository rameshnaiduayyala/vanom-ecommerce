import { prisma } from "../../../config/prisma.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
import { productInclude } from "./db-includes.js";
import { fail } from "./errors.js";
import { money } from "./money.js";
import { assert } from "../validator.js";

/**
 * Selects the best-matching pricing tier for a given quantity.
 * Tiers are matched by minQuantity ≤ quantity ≤ maxQuantity (null = no upper bound).
 * Among multiple matches, the tier with the highest minQuantity wins.
 *
 * @param {Array<{ minQuantity: number; maxQuantity: number | null; price: unknown }>} tiers
 * @param {number} quantity
 * @returns {typeof tiers[number] | null}
 */
export function selectTier(tiers, quantity) {
  const matches = tiers.filter(
    (t) => quantity >= t.minQuantity && (t.maxQuantity == null || quantity <= t.maxQuantity)
  );
  return matches.sort((a, b) => b.minQuantity - a.minQuantity)[0] ?? null;
}

/**
 * Resolves pricing for a cart / order line item.
 * Validates that:
 *  - the product exists and is active
 *  - the correct variant is present for VARIABLE products
 *  - the product is available in the requested country
 *  - the quantity meets the MOQ and does not exceed stock
 *  - a matching price tier exists
 *
 * @param {string} productId
 * @param {string | null | undefined} variantId
 * @param {string} countryCode
 * @param {number} quantity
 */
export async function resolvePrice(productId, variantId, countryCode, quantity) {
  const product = await prisma.bulkProduct.findFirst({
    where: { id: productId, deletedAt: null, isActive: true },
    include: productInclude
  });

  if (!product) {
    fail("Bulk product not found", "BULK_PRODUCT_NOT_FOUND");
  }

  let target = variantId
    ? product.variants.find((v) => v.id === variantId && v.isActive)
    : null;

  if (product.type === "VARIABLE" && !target) {
    fail("Active product variant is required", "BULK_VARIANT_REQUIRED", HTTP_STATUS.BAD_REQUEST);
  }
  if (product.type === "SIMPLE" && variantId) {
    fail("Simple bulk products cannot have variants", "INVALID_BULK_VARIANT", HTTP_STATUS.BAD_REQUEST);
  }

  const prices = target ? target.countryPrices : product.countryPrices;
  const price = prices.find(
    (p) => p.countryCode.toUpperCase() === countryCode.toUpperCase() && p.isAvailable
  );

  if (!price) {
    fail("Product is not available in the requested country", "BULK_PRODUCT_UNAVAILABLE", HTTP_STATUS.BAD_REQUEST);
  }

  assert(quantity >= price.moq, `Minimum order quantity is ${price.moq}`, "BULK_MOQ_NOT_MET");
  assert(quantity <= price.stock, "Insufficient bulk stock", "BULK_INSUFFICIENT_STOCK");

  const tier = selectTier(price.tiers, quantity);
  if (!tier) {
    fail("No pricing tier applies to this quantity", "BULK_TIER_NOT_FOUND", HTTP_STATUS.BAD_REQUEST);
  }

  return {
    product,
    variant: target,
    price,
    tier,
    unitPrice: money(tier.price),
    total: money(tier.price) * quantity
  };
}
