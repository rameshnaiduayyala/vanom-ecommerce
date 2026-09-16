import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

async function ensureProduct(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "PRODUCT_NOT_FOUND");
}
async function ensureCountry(countryId) {
  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) throw new AppError(MESSAGES.COUNTRY_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "COUNTRY_NOT_FOUND");
}
function data(input) { return { countryId: input.countryId, isAvailable: input.isAvailable ?? true, oldPrice: input.oldPrice ?? null, price: input.price ?? null, stock: input.stock ?? 0 }; }

export async function listProductPricing(productId) { await ensureProduct(productId); return prisma.productCountry.findMany({ where: { productId }, include: { country: { include: { currency: true } } }, orderBy: { country: { code: "asc" } } }); }
export async function upsertProductPricing(productId, input) { await ensureProduct(productId); await ensureCountry(input.countryId); return prisma.productCountry.upsert({ where: { productId_countryId: { productId, countryId: input.countryId } }, update: data(input), create: { productId, ...data(input) }, include: { country: { include: { currency: true } } } }); }
export async function deleteProductPricing(productId, countryId) { await ensureProduct(productId); try { return await prisma.productCountry.delete({ where: { productId_countryId: { productId, countryId } } }); } catch (error) { if (error.code === "P2025") throw new AppError(MESSAGES.PRICING_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "PRICING_NOT_FOUND"); throw error; } }

async function ensureVariant(productId, variantId) {
  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
  if (!variant) throw new AppError(MESSAGES.VARIANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "VARIANT_NOT_FOUND");
}
export async function listVariantPricing(productId, variantId) { await ensureVariant(productId, variantId); return prisma.productVariantCountry.findMany({ where: { variantId }, include: { country: { include: { currency: true } } }, orderBy: { country: { code: "asc" } } }); }
export async function upsertVariantPricing(productId, variantId, input) { await ensureVariant(productId, variantId); await ensureCountry(input.countryId); return prisma.productVariantCountry.upsert({ where: { variantId_countryId: { variantId, countryId: input.countryId } }, update: { countryId: input.countryId, isAvailable: input.isAvailable ?? true, oldPrice: input.oldPrice ?? null, price: input.price ?? null, stock: input.stock ?? 0 }, create: { variantId, countryId: input.countryId, isAvailable: input.isAvailable ?? true, oldPrice: input.oldPrice ?? null, price: input.price ?? null, stock: input.stock ?? 0 }, include: { country: { include: { currency: true } } } }); }
export async function deleteVariantPricing(productId, variantId, countryId) { await ensureVariant(productId, variantId); try { return await prisma.productVariantCountry.delete({ where: { variantId_countryId: { variantId, countryId } } }); } catch (error) { if (error.code === "P2025") throw new AppError(MESSAGES.PRICING_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "PRICING_NOT_FOUND"); throw error; } }
