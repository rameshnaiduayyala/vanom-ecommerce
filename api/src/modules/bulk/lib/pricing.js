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

  const minMoq = price.moq ?? 1;
  assert(quantity >= minMoq, `Minimum order quantity is ${minMoq}`, "BULK_MOQ_NOT_MET");
  if (price.stock > 0) {
    assert(quantity <= price.stock, "Insufficient bulk stock", "BULK_INSUFFICIENT_STOCK");
  }

  // Check if legacy tier applies, otherwise use country-specific unitPrice
  const tier = price.tiers?.length ? selectTier(price.tiers, quantity) : null;
  const rawUnitPrice = tier
    ? tier.price
    : price.unitPrice !== undefined && price.unitPrice !== null
    ? price.unitPrice
    : 0;

  const unitPrice = money(rawUnitPrice);
  const total = Math.round(unitPrice * quantity * 100) / 100;

  return {
    product,
    variant: target,
    price,
    tier: tier || { minQuantity: 1, maxQuantity: null, price: unitPrice },
    unitPrice,
    total
  };
}
