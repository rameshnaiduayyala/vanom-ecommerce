import { prisma } from "../../../config/prisma.js";
import { getPagination } from "../../../common/utils/pagination.js";
import { slugify } from "../../../common/utils/slug.js";
import { assert } from "../validator.js";
import { productInclude } from "../lib/db-includes.js";
import { fail } from "../lib/errors.js";

// ─── Internal Builders ────────────────────────────────────────────────────────

function buildTiers(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return undefined;
  return {
    create: tiers.map((t) => ({
      minQuantity: t.minQuantity,
      maxQuantity: t.maxQuantity ?? null,
      price: t.price
    }))
  };
}

function buildCountryPrice(price) {
  const tiersCreate = buildTiers(price.tiers);
  return {
    countryCode: price.countryCode.toUpperCase(),
    currencyCode: price.currencyCode.toUpperCase(),
    unitPrice: price.unitPrice !== undefined && price.unitPrice !== null ? price.unitPrice : 0,
    moq: price.moq ?? 1,
    stock: price.stock ?? 0,
    isAvailable: price.isAvailable ?? true,
    ...(tiersCreate ? { tiers: tiersCreate } : {})
  };
}

function buildVariant(variant, idx = 0) {
  return {
    name: variant.name ?? (variant.weight ? `${variant.weight}${variant.weightUnit || "kg"}` : null),
    sku: variant.sku,
    weight: variant.weight ?? null,
    weightUnit: variant.weightUnit ?? "kg",
    sortOrder: variant.sortOrder ?? idx,
    attributes: variant.attributes ?? (variant.weight ? { weight: variant.weight, unit: variant.weightUnit || "kg" } : null),
    isActive: variant.isActive ?? true,
    ...(variant.countryPrices
      ? { countryPrices: { create: variant.countryPrices.map(buildCountryPrice) } }
      : {})
  };
}

function buildImages(images) {
  if (!images || !Array.isArray(images)) return undefined;
  const items = images.map((img, idx) => {
    if (typeof img === "string") {
      return {
        mediaAssetId: img,
        sortOrder: idx,
        isPrimary: idx === 0
      };
    }
    return {
      mediaAssetId: img.mediaAssetId || img.url || `img_${idx}`,
      sortOrder: img.sortOrder ?? idx,
      isPrimary: img.isPrimary ?? (idx === 0)
    };
  });
  return { create: items };
}

function buildProductData(input) {
  const hasVariants = Array.isArray(input.variants) && input.variants.length > 0;
  const productType = input.type || (hasVariants ? "VARIABLE" : "SIMPLE");

  return {
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    sku: input.sku ?? null,
    description: input.description ?? null,
    category: input.category ?? null,
    brand: input.brand ?? null,
    type: productType,
    isActive: input.isActive ?? true,
    ...(input.images ? { images: buildImages(input.images) } : {}),
    ...(input.countryPrices
      ? { countryPrices: { create: input.countryPrices.map(buildCountryPrice) } }
      : {}),
    ...(hasVariants
      ? { variants: { create: input.variants.map((v, idx) => buildVariant(v, idx)) } }
      : {})
  };
}

// ─── Public Service Functions ─────────────────────────────────────────────────

export async function list(query = {}) {
  const { page, limit, skip } = getPagination(query);

  const where = {
    deletedAt: null,
    ...(query.isActive === undefined ? { isActive: true } : { isActive: query.isActive }),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { sku: { contains: query.search, mode: "insensitive" } },
            { slug: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.category ? { category: { equals: query.category, mode: "insensitive" } } : {}),
    ...(query.brand ? { brand: { equals: query.brand, mode: "insensitive" } } : {}),
    ...(query.countryCode
      ? {
          countryPrices: {
            some: { countryCode: query.countryCode.toUpperCase(), isAvailable: true }
          }
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.bulkProduct.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: productInclude
    }),
    prisma.bulkProduct.count({ where })
  ]);

  return { items, total, page, limit };
}

export async function getById(idOrSlug) {
  const item = await prisma.bulkProduct.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      deletedAt: null
    },
    include: productInclude
  });
  return item ?? fail("Bulk product not found", "BULK_PRODUCT_NOT_FOUND");
}

export async function create(input) {
  const hasVariants = Array.isArray(input.variants) && input.variants.length > 0;
  if (!input.type) {
    input.type = hasVariants ? "VARIABLE" : "SIMPLE";
  }

  assert(
    input.type !== "SIMPLE" || !hasVariants,
    "Simple bulk products cannot have variants",
    "INVALID_BULK_PRODUCT_VARIANTS"
  );
  assert(
    input.type !== "VARIABLE" || hasVariants,
    "Variable bulk products require variants",
    "VARIABLE_BULK_PRODUCT_REQUIRES_VARIANTS"
  );

  return prisma.bulkProduct.create({
    data: buildProductData(input),
    include: productInclude
  });
}

export async function update(id, input) {
  await getById(id);

  const data = { ...input };
  delete data.images;
  delete data.countryPrices;
  delete data.variants;

  if (input.slug === undefined && input.name) data.slug = slugify(input.name);
  if (input.images) {
    const built = buildImages(input.images);
    data.images = { deleteMany: {}, ...(built || { create: [] }) };
  }
  if (input.countryPrices) {
    data.countryPrices = { deleteMany: {}, create: input.countryPrices.map(buildCountryPrice) };
  }
  if (input.variants) {
    data.type = "VARIABLE";
    data.variants = { deleteMany: {}, create: input.variants.map((v, idx) => buildVariant(v, idx)) };
  }

  return prisma.bulkProduct.update({ where: { id }, data, include: productInclude });
}

export async function remove(id) {
  await getById(id);
  return prisma.bulkProduct.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() }
  });
}
