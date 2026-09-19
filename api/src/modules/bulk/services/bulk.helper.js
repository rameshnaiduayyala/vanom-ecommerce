import { prisma } from "../../../config/prisma.js";
import { AppError } from "../../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
import { assert, assertApproved, selectTier } from "../validator.js";

export const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  countryPrices: { include: { tiers: { orderBy: { minQuantity: "asc" } } } },
  variants: { include: { countryPrices: { include: { tiers: { orderBy: { minQuantity: "asc" } } } } } }
};

export const orderInclude = {
  items: true,
  business: { select: { id: true, businessName: true, businessEmail: true } }
};

export const fail = (message, code = "BULK_NOT_FOUND", status = HTTP_STATUS.NOT_FOUND) => {
  throw new AppError(message, status, code);
};

export const money = (value) => Number(value ?? 0);

export async function businessByUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bulkBusiness: true }
  });
  return user?.bulkBusiness;
}

export async function userEmail(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email;
}

export async function findOrCreateCart(businessId) {
  return prisma.bulkCart.upsert({
    where: { businessId },
    create: { businessId },
    update: {},
    include: { items: { include: { product: true, variant: true } } }
  });
}

export async function getBusinessForUser(userId, { approved = false } = {}) {
  let business = await businessByUser(userId);
  if (!business) {
    const email = await userEmail(userId);
    if (email) business = await prisma.bulkBusiness.findUnique({ where: { businessEmail: email } });
  }
  if (approved) assertApproved(business);
  return business;
}

export async function resolvePrice(productId, variantId, countryCode, quantity) {
  const product = await prisma.bulkProduct.findFirst({
    where: { id: productId, deletedAt: null, isActive: true },
    include: productInclude
  });
  if (!product) fail("Bulk product not found", "BULK_PRODUCT_NOT_FOUND");

  let target = variantId ? product.variants.find((v) => v.id === variantId && v.isActive) : null;
  if (product.type === "VARIABLE" && !target) {
    fail("Active product variant is required", "BULK_VARIANT_REQUIRED", HTTP_STATUS.BAD_REQUEST);
  }
  if (product.type === "SIMPLE" && variantId) {
    fail("Simple bulk products cannot have variants", "INVALID_BULK_VARIANT", HTTP_STATUS.BAD_REQUEST);
  }

  const prices = target ? target.countryPrices : product.countryPrices;
  const price = prices.find((p) => p.countryCode.toUpperCase() === countryCode.toUpperCase() && p.isAvailable);
  if (!price) {
    fail("Product is not available in the requested country", "BULK_PRODUCT_UNAVAILABLE", HTTP_STATUS.BAD_REQUEST);
  }

  assert(quantity >= price.moq, `Minimum order quantity is ${price.moq}`, "BULK_MOQ_NOT_MET");
  assert(quantity <= price.stock, "Insufficient bulk stock", "BULK_INSUFFICIENT_STOCK", HTTP_STATUS.BAD_REQUEST);

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
