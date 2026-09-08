import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { NotFoundError } from "../../common/errors/index.js";

/**
 * CatalogService
 * Direct Prisma queries, search, filtering, and contextual pricing
 */
export class CatalogService {
  async listProducts({ search, categoryId, brandId, isFeatured, isBestSeller, status = "ACTIVE", page = 1, limit = 20 } = {}) {
    const where = {};
    if (status) where.status = status;
    if (brandId) where.brandId = brandId;
    if (categoryId) {
      where.categories = { some: { categoryId } };
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === true || isFeatured === "true";
    }
    if (isBestSeller !== undefined) {
      where.isBestSeller = isBestSeller === true || isBestSeller === "true";
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          categories: { include: { category: true } },
          images: { include: { file: true } },
          variants: {
            where: { status: "ACTIVE" },
            include: {
              packaging: {
                include: { unit: true, type: true, pallet: true },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { total, items };
  }

  async getFeaturedProducts({ limit = 10 } = {}) {
    return prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            packaging: {
              include: { unit: true, type: true, pallet: true },
            },
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async getBestSellers({ limit = 10 } = {}) {
    return prisma.product.findMany({
      where: { status: "ACTIVE", isBestSeller: true },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            packaging: {
              include: { unit: true, type: true, pallet: true },
            },
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductById(id, context = {}) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { slug: id };

    const product = await prisma.product.findFirst({
      where,
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        attributes: { include: { attribute: true, value: true } },
        bundles: { include: { component: true } },
        variants: {
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            packaging: {
              include: { unit: true, type: true, pallet: true },
            },
            prices: {
              include: {
                priceList: { include: { currency: true, country: true, customerGroup: true } },
                currency: true,
              },
            },
          },
        },
        prices: {
          include: {
            priceList: { include: { currency: true, country: true, customerGroup: true } },
            currency: true,
          },
        },
        reviews: {
          where: { approved: true },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product '${id}' not found`);
    }

    // Attach real-time contextual price preview if countryCode is available
    let pricePreview = null;
    try {
      pricePreview = await PriceResolver.resolvePrice({
        productId: product.id,
        quantity: 1,
        countryCode: context.countryCode || "IN",
        currencyCode: context.currencyCode || "INR",
        user: context.user || null,
      });
    } catch (e) {
      // Non-blocking if price resolution fails for preview
    }

    return {
      ...product,
      resolvedPrice: pricePreview,
    };
  }

  async createProduct(data, tx = null) {
    const db = tx || prisma;
    const {
      name,
      slug,
      sku,
      description,
      status = "ACTIVE",
      isFeatured = false,
      isBestSeller = false,
      isNewProduct = false,
      isNew = false,
      bestseller,
      featured,
      newproduct,
      brandId,
      categoryId,
      categories,
      image,
      images,
      oldPrice,
      comparePrice,
      price,
      priceUS,
      priceCA,
      pricing,
      stock = 100,
      ...rest
    } = data;

    const generatedSlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}` : `prod-${Date.now()}`);
    const generatedSku = sku || `SKU-${Date.now().toString().slice(-6)}`;
    const finalIsBestSeller = Boolean(isBestSeller || bestseller);
    const finalIsFeatured = Boolean(isFeatured || featured);
    const finalIsNew = Boolean(isNewProduct || isNew || newproduct);

    // Resolve category relation
    let categoryConnect = undefined;
    if (categoryId) {
      categoryConnect = { create: { categoryId } };
    } else if (categories && Array.isArray(categories) && categories.length > 0) {
      const firstCat = categories[0];
      const catId = typeof firstCat === "string" ? firstCat : firstCat.categoryId || firstCat.id;
      if (catId) categoryConnect = { create: { categoryId: catId } };
    }

    // Prepare variants to create
    const variantsToCreate = (data.variants && Array.isArray(data.variants) && data.variants.length > 0)
      ? data.variants.map((v, i) => ({
          name: v.name || `${name || "Product"} Variant ${i + 1}`,
          sku: v.sku || `${generatedSku}-V${i + 1}`,
          status: v.status || "ACTIVE",
          weight: parseFloat(v.weight) || 1.0,
        }))
      : [
          {
            name: `${name || "Product"} Standard`,
            sku: `${generatedSku}-VAR`,
            status: "ACTIVE",
            weight: 1.0,
          },
        ];

    const created = await db.product.create({
      data: {
        name: name || "New Product",
        slug: generatedSlug,
        sku: generatedSku,
        description: description || "",
        status: status || "ACTIVE",
        isFeatured: finalIsFeatured,
        isBestSeller: finalIsBestSeller,
        brandId: brandId || undefined,
        categories: categoryConnect,
        variants: {
          create: variantsToCreate,
        },
      },
      include: {
        variants: true,
        categories: { include: { category: true } },
      },
    });

    // Attach inventory items to default warehouse for all created variants
    if (created.variants && created.variants.length > 0) {
      try {
        const defaultWarehouse = await db.warehouse.findFirst();
        if (defaultWarehouse) {
          for (let i = 0; i < created.variants.length; i++) {
            const vRecord = created.variants[i];
            const vInput = data.variants?.[i] || {};
            const vStock = Number(vInput.stock ?? stock ?? 100);

            await db.inventoryItem.create({
              data: {
                warehouseId: defaultWarehouse.id,
                productId: created.id,
                variantId: vRecord.id,
                onHand: vStock,
              },
            });
          }
        }
      } catch (e) {
        // non-blocking
      }
    }

    // Save Image
    const mainImageUrl = image || (images && images[0]?.url) || (typeof images?.[0] === "string" ? images[0] : null);
    if (mainImageUrl) {
      try {
        const fileAsset = await db.fileAsset.create({
          data: {
            originalName: `${name || "product"}.jpg`,
            storageKey: mainImageUrl,
            mimeType: "image/jpeg",
            sizeBytes: 1024,
            url: mainImageUrl,
          },
        });
        await db.productImage.create({
          data: {
            productId: created.id,
            fileAssetId: fileAsset.id,
            sortOrder: 0,
          },
        });
      } catch (e) {
        // non-blocking
      }
    }

    // Save Attributes (Old Price, Is New)
    const effectiveOldPrice = oldPrice || comparePrice || pricing?.oldPrice;
    if (effectiveOldPrice) {
      try {
        const attr = await db.attribute.upsert({
          where: { code: "old_price" },
          update: {},
          create: { name: "Old Price", code: "old_price", dataType: "STRING" },
        });
        await db.productAttribute.create({
          data: {
            productId: created.id,
            attributeId: attr.id,
            customValue: String(effectiveOldPrice),
          },
        });
      } catch (e) {}
    }

    if (finalIsNew) {
      try {
        const attr = await db.attribute.upsert({
          where: { code: "is_new" },
          update: {},
          create: { name: "New Product", code: "is_new", dataType: "BOOLEAN" },
        });
        await db.productAttribute.create({
          data: {
            productId: created.id,
            attributeId: attr.id,
            customValue: "true",
          },
        });
      } catch (e) {}
    }

    // Save Prices for USA (USD) and Canada (CAD)
    const effectiveUsPrice = priceUS || price || pricing?.US?.retailPrice || pricing?.retailPrice;
    if (effectiveUsPrice) {
      try {
        const usdCurrency = await db.currency.findUnique({ where: { code: "USD" } });
        const usPriceList = await db.priceList.findFirst({ where: { currencyId: usdCurrency?.id } });
        if (usdCurrency && usPriceList) {
          await db.productPrice.create({
            data: {
              productId: created.id,
              currencyId: usdCurrency.id,
              priceListId: usPriceList.id,
              amount: parseFloat(effectiveUsPrice) || 0,
            },
          });
        }
      } catch (e) {}
    }

    const effectiveCaPrice = priceCA || pricing?.CA?.retailPrice;
    if (effectiveCaPrice) {
      try {
        let cadCurrency = await db.currency.findUnique({ where: { code: "CAD" } });
        if (!cadCurrency) {
          cadCurrency = await db.currency.create({
            data: { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimals: 2 },
          });
        }
        let caPriceList = await db.priceList.findFirst({ where: { currencyId: cadCurrency.id } });
        if (!caPriceList) {
          const usCountry = await db.country.findFirst();
          const b2cGroup = await db.customerGroup.findFirst();
          if (usCountry && b2cGroup) {
            caPriceList = await db.priceList.create({
              data: {
                code: "PL-CAD-RETAIL",
                name: "CAD Retail Price List",
                countryId: usCountry.id,
                currencyId: cadCurrency.id,
                customerGroupId: b2cGroup.id,
              },
            });
          }
        }
        if (cadCurrency && caPriceList) {
          await db.productPrice.create({
            data: {
              productId: created.id,
              currencyId: cadCurrency.id,
              priceListId: caPriceList.id,
              amount: parseFloat(effectiveCaPrice) || 0,
            },
          });
        }
      } catch (e) {}
    }

    return created;
  }

  async updateProduct(id, data, tx = null) {
    const db = tx || prisma;
    const {
      name,
      description,
      status,
      isFeatured,
      isBestSeller,
      isNewProduct,
      isNew,
      bestseller,
      featured,
      newproduct,
      brandId,
      categoryId,
      categories,
      image,
      images,
      oldPrice,
      comparePrice,
      price,
      priceUS,
      priceCA,
      pricing,
      stock,
      ...rest
    } = data;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined || featured !== undefined) updateData.isFeatured = Boolean(isFeatured ?? featured);
    if (isBestSeller !== undefined || bestseller !== undefined) updateData.isBestSeller = Boolean(isBestSeller ?? bestseller);

    if (categoryId) {
      await db.productCategory.deleteMany({ where: { productId: id } });
      await db.productCategory.create({ data: { productId: id, categoryId } });
    }

    return db.product.update({
      where: { id },
      data: updateData,
      include: {
        variants: true,
        categories: { include: { category: true } },
      },
    });
  }

  async deleteProduct(id, tx = null) {
    const db = tx || prisma;
    return db.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }
}
