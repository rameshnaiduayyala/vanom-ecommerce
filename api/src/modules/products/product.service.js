import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { slugify } from "../../common/utils/slug.js";

const variantInclude = { countries: { include: { country: { include: { currency: true } } } } };

const productInclude = {
  brand: true,
  category: true,
  variants: { include: variantInclude },
  countries: {
    include: {
      country: {
        include: { currency: true }
      }
    }
  },
  images: true
};

function serializeCountryPricing(entry) {
  return {
    id: entry.id,
    countryId: entry.countryId,
    country: entry.country.name,
    currency: entry.country.currency.code,
    oldPrice: entry.oldPrice,
    price: entry.price,
    stock: entry.stock,
    isAvailable: entry.isAvailable
  };
}

function serializeProduct(product) {
  return {
    ...product,
    countries: product.countries?.map(serializeCountryPricing) ?? [],
    variants: product.variants?.map((variant) => ({
      ...variant,
      countries: variant.countries?.map(serializeCountryPricing) ?? []
    })) ?? []
  };
}

function countryData(countries = []) {
  return countries.map(({ countryId, isAvailable = true, oldPrice = null, price = null, stock = 0 }) => ({
    countryId, isAvailable, oldPrice, price, stock
  }));
}

function imageData(images = []) {
  return images.map((img, idx) => {
    if (typeof img === "string") {
      return { url: img, sortOrder: idx };
    }
    return {
      url: img.url,
      fileId: img.fileId ?? null,
      sortOrder: img.sortOrder ?? idx
    };
  });
}

function variantCreateData(variant) {
  return {
    sku: variant.sku,
    name: variant.name ?? null,
    attributes: variant.attributes ?? null,
    stock: variant.stock ?? 0,
    isActive: variant.isActive ?? true,
    ...(variant.countries ? { countries: { create: countryData(variant.countries) } } : {})
  };
}

export async function createProduct(input) {
  try {
    const productType = input.type ?? "SIMPLE";
    if (productType === "SIMPLE" && input.variants?.length) {
      throw new AppError(MESSAGES.SIMPLE_PRODUCT_CANNOT_HAVE_VARIANTS, HTTP_STATUS.BAD_REQUEST, "INVALID_PRODUCT_VARIANTS");
    }
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug ?? slugify(input.name),
        description: input.description ?? null,
        type: productType,
        basePrice: input.basePrice ?? null,
        sku: input.sku ?? null,
        stock: input.stock ?? 0,
        brandId: input.brandId ?? null,
        categoryId: input.categoryId ?? null,
        isActive: input.isActive ?? true,
        isNew: input.isNew ?? false,
        isFeatured: input.isFeatured ?? false,
        isTrending: input.isTrending ?? false,
        isBestSeller: input.isBestSeller ?? false,
        deliveryInfo: input.deliveryInfo ?? null,
        returnPolicy: input.returnPolicy ?? null,
        warrantyInfo: input.warrantyInfo ?? null,
        keyHighlights: input.keyHighlights ?? null,
        ...(input.countries ? { countries: { create: countryData(input.countries) } } : {}),
        ...(input.images ? { images: { create: imageData(input.images) } } : {}),
        ...(input.variants ? { variants: { create: input.variants.map(variantCreateData) } } : {})
      },
      include: productInclude
    });
    return serializeProduct(product);
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      throw new AppError(
        MESSAGES.SLUG_ALREADY_EXISTS,
        HTTP_STATUS.CONFLICT,
        "PRODUCT_SLUG_EXISTS"
      );
    }
    throw error;
  }
}

export async function listProducts({ page, limit, skip, search, categoryId, type, isActive, isNew, isFeatured, isTrending, isBestSeller }) {
  const where = {
    isActive: isActive !== undefined ? isActive : true,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(categoryId ? {
      OR: [
        { categoryId: categoryId },
        { category: { slug: categoryId } }
      ]
    } : {}),
    ...(type ? { type } : {}),
    ...(isNew !== undefined ? { isNew } : {}),
    ...(isFeatured !== undefined ? { isFeatured } : {}),
    ...(isTrending !== undefined ? { isTrending } : {}),
    ...(isBestSeller !== undefined ? { isBestSeller } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: productInclude
    }),
    prisma.product.count({ where })
  ]);

  return { items: items.map(serializeProduct), total };
}

export async function getProductById(idOrSlug) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug }
      ],
      isActive: true,
      deletedAt: null,
    },
    include: productInclude
  });

  if (!product) {
    throw new AppError(
      MESSAGES.PRODUCT_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      "PRODUCT_NOT_FOUND"
    );
  }

  return serializeProduct(product);
}

export async function updateProduct(id, input) {
  const current = await getProductById(id);

  const productType = input.type ?? current.type;
  if (productType === "SIMPLE" && input.variants?.length) {
    throw new AppError(MESSAGES.SIMPLE_PRODUCT_CANNOT_HAVE_VARIANTS, HTTP_STATUS.BAD_REQUEST, "INVALID_PRODUCT_VARIANTS");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (productType === "SIMPLE" && current.type === "VARIABLE" && !input.variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
      }

      const product = await tx.product.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.type !== undefined && { type: input.type }),
          ...(input.basePrice !== undefined && { basePrice: input.basePrice }),
          ...(input.sku !== undefined && { sku: input.sku }),
          ...(input.stock !== undefined && { stock: input.stock }),
          ...(input.brandId !== undefined && { brandId: input.brandId }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.isActive === true && { deletedAt: null }),
          ...(input.isNew !== undefined && { isNew: input.isNew }),
          ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
          ...(input.isTrending !== undefined && { isTrending: input.isTrending }),
          ...(input.isBestSeller !== undefined && { isBestSeller: input.isBestSeller }),
          ...(input.deliveryInfo !== undefined && { deliveryInfo: input.deliveryInfo }),
          ...(input.returnPolicy !== undefined && { returnPolicy: input.returnPolicy }),
          ...(input.warrantyInfo !== undefined && { warrantyInfo: input.warrantyInfo }),
          ...(input.keyHighlights !== undefined && { keyHighlights: input.keyHighlights }),
          ...(input.countries ? { countries: { deleteMany: {}, create: countryData(input.countries) } } : {}),
          ...(input.images ? { images: { deleteMany: {}, create: imageData(input.images) } } : {}),
          ...(input.variants ? { variants: { deleteMany: {}, create: input.variants.map(variantCreateData) } } : {})
        },
        include: productInclude
      });
      return serializeProduct(product);
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError(
        MESSAGES.SLUG_ALREADY_EXISTS,
        HTTP_STATUS.CONFLICT,
        "PRODUCT_UNIQUE_VALUE_EXISTS"
      );
    }
    throw error;
  }
}

const highlightFlags = {
  new: "isNew",
  featured: "isFeatured",
  trending: "isTrending",
  "best-seller": "isBestSeller"
};

export async function listHighlightedProducts(type, { page, limit, skip }) {
  const flag = highlightFlags[type];
  if (!flag) {
    throw new AppError("Invalid product highlight type", HTTP_STATUS.BAD_REQUEST, "INVALID_HIGHLIGHT_TYPE");
  }

  const where = { isActive: true, [flag]: true };
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: productInclude }),
    prisma.product.count({ where })
  ]);
  return { items: items.map(serializeProduct), total };
}

export async function deleteProduct(id) {
  await getProductById(id);

  return prisma.product.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date()
    }
  });
}

export async function createVariant(productId, input) {
  const product = await getProductById(productId);
  if (product.type !== "VARIABLE") {
    throw new AppError(MESSAGES.SIMPLE_PRODUCT_CANNOT_HAVE_VARIANTS, HTTP_STATUS.BAD_REQUEST, "INVALID_PRODUCT_VARIANTS");
  }
  const variant = await prisma.productVariant.create({ data: { productId, ...variantCreateData(input) }, include: variantInclude });
  return { ...variant, countries: variant.countries.map(serializeCountryPricing) };
}

export async function getVariantById(productId, id) {
  const variant = await prisma.productVariant.findFirst({ where: { id, productId }, include: variantInclude });
  if (!variant) throw new AppError(MESSAGES.VARIANT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "VARIANT_NOT_FOUND");
  return { ...variant, countries: variant.countries.map(serializeCountryPricing) };
}

export async function listVariants(productId) {
  await getProductById(productId);
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: variantInclude
  });
  return variants.map((variant) => ({ ...variant, countries: variant.countries.map(serializeCountryPricing) }));
}

export async function updateVariant(productId, id, input) {
  await getVariantById(productId, id);
  const variant = await prisma.productVariant.update({
    where: { id },
    data: {
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.attributes !== undefined && { attributes: input.attributes }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.countries ? { countries: { deleteMany: {}, create: countryData(input.countries) } } : {})
    },
    include: variantInclude
  });
  return { ...variant, countries: variant.countries.map(serializeCountryPricing) };
}

export async function deleteVariant(productId, id) {
  await getVariantById(productId, id);
  return prisma.productVariant.delete({ where: { id } });
}
