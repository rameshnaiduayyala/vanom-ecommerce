import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { slugify } from "../../common/utils/slug.js";
import { deleteStoredFile } from "../../common/utils/file-upload.js";

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
    weight: variant.weight !== undefined && variant.weight !== null && variant.weight !== "" ? Number(variant.weight) : null,
    weightUnit: variant.weightUnit ?? "lb",
    length: variant.length !== undefined && variant.length !== null && variant.length !== "" ? Number(variant.length) : null,
    width: variant.width !== undefined && variant.width !== null && variant.width !== "" ? Number(variant.width) : null,
    height: variant.height !== undefined && variant.height !== null && variant.height !== "" ? Number(variant.height) : null,
    dimensionUnit: variant.dimensionUnit ?? "in",
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
        weight: input.weight !== undefined && input.weight !== null && input.weight !== "" ? Number(input.weight) : null,
        weightUnit: input.weightUnit ?? "lb",
        length: input.length !== undefined && input.length !== null && input.length !== "" ? Number(input.length) : null,
        width: input.width !== undefined && input.width !== null && input.width !== "" ? Number(input.width) : null,
        height: input.height !== undefined && input.height !== null && input.height !== "" ? Number(input.height) : null,
        dimensionUnit: input.dimensionUnit ?? "in",
        ...(input.countries ? { countries: { create: countryData(input.countries) } } : {}),
        ...(input.images ? { images: { create: imageData(input.images) } } : {}),
        ...(input.variants ? { variants: { create: input.variants.map(variantCreateData) } } : {})
      },
      include: productInclude
    });

    // Automatically initialize inventory in selected or default warehouse
    try {
      let targetWarehouse = null;
      const requestedWarehouseId = input.warehouseId || input.warehouse_id;
      if (requestedWarehouseId) {
        targetWarehouse = await prisma.warehouse.findFirst({
          where: { id: requestedWarehouseId, isActive: true }
        });
      }

      if (!targetWarehouse) {
        targetWarehouse = await prisma.warehouse.findFirst({
          where: { isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
        });
      }

      if (targetWarehouse) {
        if (product.type === "VARIABLE" && product.variants?.length) {
          for (const variant of product.variants) {
            const initialQty = Math.max(0, Number(variant.stock) || 0);
            const inv = await prisma.inventory.create({
              data: {
                organizationId: targetWarehouse.organizationId,
                warehouseId: targetWarehouse.id,
                variantId: variant.id,
                quantity: initialQty,
                reservedQuantity: 0,
                reorderLevel: 10,
                reorderQuantity: 20
              }
            });
            if (initialQty > 0) {
              await prisma.inventoryTransaction.create({
                data: {
                  organizationId: targetWarehouse.organizationId,
                  inventoryId: inv.id,
                  type: "RESTOCK",
                  quantity: initialQty,
                  previousQuantity: 0,
                  newQuantity: initialQty,
                  previousReservedQuantity: 0,
                  newReservedQuantity: 0,
                  referenceType: "MANUAL",
                  reason: "Initial stock upon product creation"
                }
              });
            }
          }
        } else {
          const initialQty = Math.max(0, Number(product.stock) || 0);
          const inv = await prisma.inventory.create({
            data: {
              organizationId: targetWarehouse.organizationId,
              warehouseId: targetWarehouse.id,
              productId: product.id,
              quantity: initialQty,
              reservedQuantity: 0,
              reorderLevel: 10,
              reorderQuantity: 20
            }
          });
          if (initialQty > 0) {
            await prisma.inventoryTransaction.create({
              data: {
                organizationId: targetWarehouse.organizationId,
                inventoryId: inv.id,
                type: "RESTOCK",
                quantity: initialQty,
                previousQuantity: 0,
                newQuantity: initialQty,
                previousReservedQuantity: 0,
                newReservedQuantity: 0,
                referenceType: "MANUAL",
                reason: "Initial stock upon product creation"
              }
            });
          }
        }
      }
    } catch (invErr) {
      console.warn("Auto inventory initialization note:", invErr.message);
    }

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
    deletedAt: null,
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
        { category: { slug: categoryId } },
        { category: { parentId: categoryId } },
        { category: { parent: { slug: categoryId } } }
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
          ...(input.weight !== undefined && { weight: input.weight !== null && input.weight !== "" ? Number(input.weight) : null }),
          ...(input.weightUnit !== undefined && { weightUnit: input.weightUnit }),
          ...(input.length !== undefined && { length: input.length !== null && input.length !== "" ? Number(input.length) : null }),
          ...(input.width !== undefined && { width: input.width !== null && input.width !== "" ? Number(input.width) : null }),
          ...(input.height !== undefined && { height: input.height !== null && input.height !== "" ? Number(input.height) : null }),
          ...(input.dimensionUnit !== undefined && { dimensionUnit: input.dimensionUnit }),
          ...(input.countries ? { countries: { deleteMany: {}, create: countryData(input.countries) } } : {}),
          ...(input.images ? { images: { deleteMany: {}, create: imageData(input.images) } } : {}),
          ...(input.variants ? { variants: { deleteMany: {}, create: input.variants.map(variantCreateData) } } : {})
        },
        include: productInclude
      });

      // Synchronize warehouse inventory for updated product / variants
      try {
        const defaultWarehouse = await tx.warehouse.findFirst({
          where: { isActive: true },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
        });

        if (defaultWarehouse) {
          if (product.type === "VARIABLE" && product.variants?.length) {
            // Clean up any stale simple-product inventory records for this product
            await tx.inventory.deleteMany({
              where: { productId: product.id, variantId: null }
            });

            // Ensure every active variant has a corresponding inventory row in the warehouse
            for (const v of product.variants) {
              const existingInv = await tx.inventory.findFirst({
                where: { warehouseId: defaultWarehouse.id, variantId: v.id }
              });

              if (!existingInv) {
                const initialQty = Math.max(0, Number(v.stock) || 0);
                const newInv = await tx.inventory.create({
                  data: {
                    organizationId: defaultWarehouse.organizationId,
                    warehouseId: defaultWarehouse.id,
                    variantId: v.id,
                    productId: null,
                    quantity: initialQty,
                    reservedQuantity: 0,
                    reorderLevel: 10,
                    reorderQuantity: 20
                  }
                });

                if (initialQty > 0) {
                  await tx.inventoryTransaction.create({
                    data: {
                      organizationId: defaultWarehouse.organizationId,
                      inventoryId: newInv.id,
                      type: "RESTOCK",
                      quantity: initialQty,
                      previousQuantity: 0,
                      newQuantity: initialQty,
                      previousReservedQuantity: 0,
                      newReservedQuantity: 0,
                      referenceId: product.id,
                      referenceType: "MANUAL",
                      reason: `Initial stock for variant "${v.name || v.sku || "Variant"}" via Edit Product`
                    }
                  });
                }
              } else if (v.stock !== undefined && v.stock !== null) {
                const newQty = Math.max(0, Number(v.stock) || 0);
                const prevQty = existingInv.quantity;
                const diff = newQty - prevQty;

                if (diff !== 0) {
                  await tx.inventory.update({
                    where: { id: existingInv.id },
                    data: { quantity: newQty }
                  });

                  await tx.inventoryTransaction.create({
                    data: {
                      organizationId: defaultWarehouse.organizationId,
                      inventoryId: existingInv.id,
                      type: diff > 0 ? "RESTOCK" : "ADJUSTMENT",
                      quantity: Math.abs(diff),
                      previousQuantity: prevQty,
                      newQuantity: newQty,
                      previousReservedQuantity: existingInv.reservedQuantity,
                      newReservedQuantity: existingInv.reservedQuantity,
                      referenceId: product.id,
                      referenceType: "MANUAL",
                      reason: `Stock changed from ${prevQty} to ${newQty} via Edit Product`
                    }
                  });
                }
              }
            }
          } else if (product.type === "SIMPLE") {
            // If switched from VARIABLE to SIMPLE, clean up variant inventory records
            if (current.type === "VARIABLE") {
              await tx.inventory.deleteMany({
                where: { variant: { productId: product.id } }
              });
            }

            const existingInv = await tx.inventory.findFirst({
              where: { warehouseId: defaultWarehouse.id, productId: product.id, variantId: null }
            });

            if (!existingInv) {
              const initialQty = Math.max(0, Number(product.stock) || 0);
              const newInv = await tx.inventory.create({
                data: {
                  organizationId: defaultWarehouse.organizationId,
                  warehouseId: defaultWarehouse.id,
                  productId: product.id,
                  variantId: null,
                  quantity: initialQty,
                  reservedQuantity: 0,
                  reorderLevel: 10,
                  reorderQuantity: 20
                }
              });

              if (initialQty > 0) {
                await tx.inventoryTransaction.create({
                  data: {
                    organizationId: defaultWarehouse.organizationId,
                    inventoryId: newInv.id,
                    type: "RESTOCK",
                    quantity: initialQty,
                    previousQuantity: 0,
                    newQuantity: initialQty,
                    previousReservedQuantity: 0,
                    newReservedQuantity: 0,
                    referenceId: product.id,
                    referenceType: "MANUAL",
                    reason: `Initial stock for product "${product.name}" via Edit Product`
                  }
                });
              }
            } else if (input.stock !== undefined) {
              const newQty = Math.max(0, Number(input.stock) || 0);
              const prevQty = existingInv.quantity;
              const diff = newQty - prevQty;

              if (diff !== 0) {
                await tx.inventory.update({
                  where: { id: existingInv.id },
                  data: { quantity: newQty }
                });

                await tx.inventoryTransaction.create({
                  data: {
                    organizationId: defaultWarehouse.organizationId,
                    inventoryId: existingInv.id,
                    type: diff > 0 ? "RESTOCK" : "ADJUSTMENT",
                    quantity: Math.abs(diff),
                    previousQuantity: prevQty,
                    newQuantity: newQty,
                    previousReservedQuantity: existingInv.reservedQuantity,
                    newReservedQuantity: existingInv.reservedQuantity,
                    referenceId: product.id,
                    referenceType: "MANUAL",
                    reason: `Stock changed from ${prevQty} to ${newQty} via Edit Product`
                  }
                });
              }
            }
          }
        }
      } catch (invErr) {
        console.warn("[Inventory Sync] Failed to sync inventory on updateProduct:", invErr.message);
      }

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
  // Find product by id or slug
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }]
    }
  });

  if (!product) {
    throw new AppError(
      MESSAGES.PRODUCT_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      "PRODUCT_NOT_FOUND"
    );
  }

  const productId = product.id;

  // Soft-delete: Keep all records, images, and history intact,
  // while deactivating the product and variants so they are removed from catalog & storefront.
  return await prisma.$transaction(async (tx) => {
    // Clear active cart items for this product
    await tx.cartItem.deleteMany({ where: { productId } });

    // Deactivate all product variants
    await tx.productVariant.updateMany({
      where: { productId },
      data: {
        isActive: false
      }
    });

    // Mark product as inactive and archived
    return await tx.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });
  });
}

export async function createVariant(productId, input) {
  const product = await getProductById(productId);
  if (product.type !== "VARIABLE") {
    throw new AppError(MESSAGES.SIMPLE_PRODUCT_CANNOT_HAVE_VARIANTS, HTTP_STATUS.BAD_REQUEST, "INVALID_PRODUCT_VARIANTS");
  }
  const variant = await prisma.productVariant.create({ data: { productId, ...variantCreateData(input) }, include: variantInclude });

  try {
    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
    });
    if (defaultWarehouse) {
      await prisma.inventory.create({
        data: {
          organizationId: defaultWarehouse.organizationId,
          warehouseId: defaultWarehouse.id,
          variantId: variant.id,
          productId: null,
          quantity: Math.max(0, Number(variant.stock) || 0),
          reservedQuantity: 0,
          reorderLevel: 10,
          reorderQuantity: 20
        }
      });
    }
  } catch (err) {
    console.warn("[Inventory Sync] Failed to create inventory for new variant:", err.message);
  }

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
      ...(input.weight !== undefined && { weight: input.weight !== null && input.weight !== "" ? Number(input.weight) : null }),
      ...(input.weightUnit !== undefined && { weightUnit: input.weightUnit }),
      ...(input.length !== undefined && { length: input.length !== null && input.length !== "" ? Number(input.length) : null }),
      ...(input.width !== undefined && { width: input.width !== null && input.width !== "" ? Number(input.width) : null }),
      ...(input.height !== undefined && { height: input.height !== null && input.height !== "" ? Number(input.height) : null }),
      ...(input.dimensionUnit !== undefined && { dimensionUnit: input.dimensionUnit }),
      ...(input.countries ? { countries: { deleteMany: {}, create: countryData(input.countries) } } : {})
    },
    include: variantInclude
  });

  try {
    if (input.stock !== undefined) {
      const invs = await prisma.inventory.findMany({ where: { variantId: id } });
      const newQty = Math.max(0, Number(input.stock) || 0);

      for (const inv of invs) {
        const prevQty = inv.quantity;
        const diff = newQty - prevQty;

        if (diff !== 0) {
          await prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty }
          });

          await prisma.inventoryTransaction.create({
            data: {
              organizationId: inv.organizationId,
              inventoryId: inv.id,
              type: diff > 0 ? "RESTOCK" : "ADJUSTMENT",
              quantity: Math.abs(diff),
              previousQuantity: prevQty,
              newQuantity: newQty,
              previousReservedQuantity: inv.reservedQuantity,
              newReservedQuantity: inv.reservedQuantity,
              referenceId: productId,
              referenceType: "MANUAL",
              reason: `Variant stock adjusted from ${prevQty} to ${newQty} via Edit Variant`
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Inventory Sync] Failed to sync inventory for variant:", err.message);
  }

  return { ...variant, countries: variant.countries.map(serializeCountryPricing) };
}

export async function deleteVariant(productId, id) {
  await getVariantById(productId, id);
  try {
    await prisma.inventory.deleteMany({ where: { variantId: id } });
  } catch (err) {
    console.warn("[Inventory Sync] Failed to remove inventory for deleted variant:", err.message);
  }
  return prisma.productVariant.delete({ where: { id } });
}

export async function searchProducts({ query = "", categoryId = null, limit = 10, countryCode = "US" }) {
  const trimmed = (query || "").trim().slice(0, 100);
  if (!trimmed || trimmed.length < 2) {
    return { products: [], categories: [], total: 0 };
  }

  const takeLimit = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));
  const contains = `%${trimmed}%`;
  const prefix = `${trimmed}%`;

  const country = await prisma.country.findFirst({
    where: {
      OR: [
        { code: countryCode.toUpperCase() },
        { id: countryCode }
      ]
    },
    include: { currency: true }
  });

  const countryId = country?.id || null;

  const products = await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.sku,
      p.type,
      p."basePrice",
      p.stock,
      p."isNew",
      p."isFeatured",
      p."isTrending",
      p."isBestSeller",
      c.id AS "categoryId",
      c.name AS "categoryName",
      c.slug AS "categorySlug",
      b.id AS "brandId",
      b.name AS "brandName",
      b.slug AS "brandSlug",
      (
        SELECT url FROM "ProductImage" pi 
        WHERE pi."productId" = p.id 
        ORDER BY pi."sortOrder" ASC 
        LIMIT 1
      ) AS "imageUrl",
      (
        SELECT pc.price FROM "ProductCountry" pc 
        WHERE pc."productId" = p.id AND (${countryId}::text IS NULL OR pc."countryId" = ${countryId}) AND pc."isAvailable" = true
        LIMIT 1
      ) AS "countryPrice",
      (
        SELECT pc."oldPrice" FROM "ProductCountry" pc 
        WHERE pc."productId" = p.id AND (${countryId}::text IS NULL OR pc."countryId" = ${countryId})
        LIMIT 1
      ) AS "countryOldPrice",
      (
        SELECT pc.stock FROM "ProductCountry" pc 
        WHERE pc."productId" = p.id AND (${countryId}::text IS NULL OR pc."countryId" = ${countryId})
        LIMIT 1
      ) AS "countryStock",
      (
        CASE
          WHEN LOWER(p.name) = LOWER(${trimmed}) THEN 100
          WHEN LOWER(p.name) LIKE LOWER(${prefix}) THEN 85
          WHEN LOWER(COALESCE(p.sku, '')) = LOWER(${trimmed}) THEN 75
          WHEN LOWER(COALESCE(b.name, '')) = LOWER(${trimmed}) OR LOWER(COALESCE(b.name, '')) LIKE LOWER(${prefix}) THEN 65
          WHEN LOWER(COALESCE(c.name, '')) = LOWER(${trimmed}) OR LOWER(COALESCE(c.name, '')) LIKE LOWER(${prefix}) THEN 55
          WHEN LOWER(p.name) LIKE LOWER(${contains}) THEN 45
          WHEN LOWER(COALESCE(p.description, '')) LIKE LOWER(${contains}) THEN 30
          ELSE 10
        END
        + GREATEST(
            word_similarity(LOWER(${trimmed}), LOWER(p.name)),
            word_similarity(LOWER(${trimmed}), LOWER(COALESCE(b.name, ''))),
            word_similarity(LOWER(${trimmed}), LOWER(COALESCE(c.name, '')))
          ) * 20
      ) AS rank_score
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    WHERE p."isActive" = true 
      AND p."deletedAt" IS NULL
      AND (
        ${categoryId}::text IS NULL 
        OR p."categoryId" = ${categoryId} 
        OR c.slug = ${categoryId}
      )
      AND (
        LOWER(p.name) LIKE LOWER(${contains})
        OR LOWER(COALESCE(p.sku, '')) LIKE LOWER(${contains})
        OR LOWER(COALESCE(b.name, '')) LIKE LOWER(${contains})
        OR LOWER(COALESCE(c.name, '')) LIKE LOWER(${contains})
        OR LOWER(COALESCE(p.description, '')) LIKE LOWER(${contains})
        OR word_similarity(LOWER(${trimmed}), LOWER(p.name)) > 0.35
        OR word_similarity(LOWER(${trimmed}), LOWER(COALESCE(b.name, ''))) > 0.35
        OR word_similarity(LOWER(${trimmed}), LOWER(COALESCE(c.name, ''))) > 0.35
        OR EXISTS (
          SELECT 1 FROM "ProductVariant" pv 
          WHERE pv."productId" = p.id 
            AND pv."isActive" = true 
            AND (
              LOWER(pv.sku) LIKE LOWER(${contains}) 
              OR LOWER(COALESCE(pv.name, '')) LIKE LOWER(${contains})
            )
        )
      )
    ORDER BY rank_score DESC, p."isFeatured" DESC, p."createdAt" DESC
    LIMIT ${takeLimit};
  `;

  const categories = await prisma.$queryRaw`
    SELECT 
      c.id, 
      c.name, 
      c.slug,
      (
        SELECT COUNT(*)::int 
        FROM "Product" p 
        WHERE p."categoryId" = c.id AND p."isActive" = true AND p."deletedAt" IS NULL
      ) AS "productCount"
    FROM "Category" c
    WHERE c."isActive" = true
      AND (
        LOWER(c.name) LIKE LOWER(${contains})
        OR word_similarity(LOWER(${trimmed}), LOWER(c.name)) > 0.35
      )
    ORDER BY 
      CASE 
        WHEN LOWER(c.name) = LOWER(${trimmed}) THEN 100
        WHEN LOWER(c.name) LIKE LOWER(${prefix}) THEN 80
        ELSE 50
      END + word_similarity(LOWER(${trimmed}), LOWER(c.name)) * 20 DESC
    LIMIT 4;
  `;

  const formattedProducts = products.map((p) => {
    const rawPrice = p.countryPrice !== null ? p.countryPrice : p.basePrice;
    const price = rawPrice !== null ? Number(rawPrice) : 0;
    const originalPrice = p.countryOldPrice !== null ? Number(p.countryOldPrice) : 0;
    const discount = originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const stock = p.countryStock !== null ? Number(p.countryStock) : Number(p.stock || 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      type: p.type,
      price,
      originalPrice: originalPrice > price ? originalPrice : null,
      discount,
      currency: country?.currency?.code || "USD",
      symbol: country?.currency?.symbol || "$",
      stock,
      inStock: stock > 0,
      imageUrl: p.imageUrl || null,
      category: p.categoryId ? {
        id: p.categoryId,
        name: p.categoryName,
        slug: p.categorySlug
      } : null,
      brand: p.brandId ? {
        id: p.brandId,
        name: p.brandName,
        slug: p.brandSlug
      } : null,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
    };
  });

  return {
    products: formattedProducts,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: Number(c.productCount || 0)
    })),
    total: formattedProducts.length
  };
}
