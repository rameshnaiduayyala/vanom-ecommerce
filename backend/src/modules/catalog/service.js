import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { NotFoundError, BadRequestError } from "../../common/errors/index.js";

/**
 * CatalogService
 * Unified Product and Variant CRUD with multi-currency (USD, CAD), custom attributes,
 * stock calculations, category linkage, and image asset handling.
 */
export class CatalogService {
  /**
   * Helper to format a product into clean API output
   */
  _formatProduct(p) {
    if (!p) return null;

    // Resolve category info
    let catId = null;
    let catName = "General";
    if (p.categories && Array.isArray(p.categories) && p.categories.length > 0) {
      catId = p.categories[0]?.categoryId || p.categories[0]?.category?.id || null;
      catName = p.categories[0]?.category?.name || p.categories[0]?.name || "General";
    }

    // Resolve images
    const images = (p.images || []).map((img) => img.file?.url || img.url || "").filter(Boolean);

    // Resolve attributes
    const attrMap = {};
    if (p.attributes && Array.isArray(p.attributes)) {
      for (const pa of p.attributes) {
        const code = pa.attribute?.code || pa.attributeCode;
        if (code) {
          attrMap[code] = pa.customValue ?? pa.value?.value ?? true;
        }
      }
    }

    // Resolve product-level prices from b2cListing or first variant prices
    const b2cPrices = p.b2cListing?.prices || [];
    const firstVarB2c = p.variants?.[0]?.b2cPrices || [];
    const allB2cPrices = b2cPrices.length > 0 ? b2cPrices : firstVarB2c;

    const usdPriceObj = allB2cPrices.find((pr) => pr.currency === "USD");
    const cadPriceObj = allB2cPrices.find((pr) => pr.currency === "CAD");

    const priceUsd = usdPriceObj ? Number(usdPriceObj.price) : (p.price_usd ? Number(p.price_usd) : (p.priceUS ? Number(p.priceUS) : null));
    const oldPriceUsd = (usdPriceObj?.compareAt ? Number(usdPriceObj.compareAt) : null) || (attrMap["old_price_usd"] || attrMap["old_price"] ? Number(attrMap["old_price_usd"] || attrMap["old_price"]) : null);
    const priceCad = cadPriceObj ? Number(cadPriceObj.price) : (p.price_cad ? Number(p.price_cad) : (p.priceCA ? Number(p.priceCA) : null));
    const oldPriceCad = (cadPriceObj?.compareAt ? Number(cadPriceObj.compareAt) : null) || (attrMap["old_price_cad"] ? Number(attrMap["old_price_cad"]) : null);

    // Resolve formatted variants
    const variants = (p.variants || []).map((v) => {
      const vImages = (v.images || []).map((img) => img.file?.url || img.url || "").filter(Boolean);
      const vAttrMap = {};
      if (v.attributes && Array.isArray(v.attributes)) {
        for (const va of v.attributes) {
          const code = va.attribute?.code || va.attributeCode;
          if (code) {
            vAttrMap[code] = va.customValue ?? va.value?.value ?? true;
          }
        }
      }

      const vUsdPriceObj = (v.b2cPrices || []).find((pr) => pr.currency === "USD");
      const vCadPriceObj = (v.b2cPrices || []).find((pr) => pr.currency === "CAD");

      const vPriceUsd = vUsdPriceObj ? Number(vUsdPriceObj.price) : (vAttrMap["price_usd"] ? Number(vAttrMap["price_usd"]) : (v.price_usd ? Number(v.price_usd) : priceUsd));
      const vOldPriceUsd = (vUsdPriceObj?.compareAt ? Number(vUsdPriceObj.compareAt) : null) || (vAttrMap["old_price_usd"] || vAttrMap["old_price"] ? Number(vAttrMap["old_price_usd"] || vAttrMap["old_price"]) : oldPriceUsd);
      const vPriceCad = vCadPriceObj ? Number(vCadPriceObj.price) : (vAttrMap["price_cad"] ? Number(vAttrMap["price_cad"]) : (v.price_cad ? Number(v.price_cad) : priceCad));
      const vOldPriceCad = (vCadPriceObj?.compareAt ? Number(vCadPriceObj.compareAt) : null) || (vAttrMap["old_price_cad"] ? Number(vAttrMap["old_price_cad"]) : oldPriceCad);

      // Country-wise variant stock calculation
      const vStockByCountry = {};
      let vTotalStock = 0;
      if (v.inventoryItems && Array.isArray(v.inventoryItems)) {
        for (const item of v.inventoryItems) {
          const cCode = item.warehouse?.country?.code || (item.warehouseId?.includes("ca") ? "CA" : "US");
          vStockByCountry[cCode] = (vStockByCountry[cCode] || 0) + Number(item.onHand || 0);
          vTotalStock += Number(item.onHand || 0);
        }
      }
      if (vTotalStock === 0) {
        vTotalStock = Number(v.stock_quantity || v.stock || 100);
        vStockByCountry["US"] = vTotalStock;
      }

      // Check variant country availability based on pricing / inventory
      const availableCountries = [];
      if (vPriceUsd !== null && (vStockByCountry["US"] === undefined || vStockByCountry["US"] > 0)) availableCountries.push("US");
      if (vPriceCad !== null && (vStockByCountry["CA"] === undefined || vStockByCountry["CA"] > 0)) availableCountries.push("CA");

      return {
        id: v.id,
        product_id: v.productId || p.id,
        sku: v.sku,
        variant_name: v.name,
        name: v.name,
        weight: v.weight ? Number(v.weight) : 1.0,
        attributes: vAttrMap,
        images: vImages.length > 0 ? vImages : (images.length > 0 ? [images[0]] : []),
        price_usd: vPriceUsd,
        old_price_usd: vOldPriceUsd,
        price_cad: vPriceCad,
        old_price_cad: vOldPriceCad,
        price: vPriceUsd,
        old_price: vOldPriceUsd,
        mrp: vOldPriceUsd,
        stock_quantity: vTotalStock,
        stock: vTotalStock,
        stock_by_country: vStockByCountry,
        available_countries: availableCountries,
        pricing: {
          US: { currency: "USD", symbol: "$", price: vPriceUsd, old_price: vOldPriceUsd, stock: vStockByCountry["US"] || 0, isAvailable: availableCountries.includes("US") },
          CA: { currency: "CAD", symbol: "CA$", price: vPriceCad, old_price: vOldPriceCad, stock: vStockByCountry["CA"] || 0, isAvailable: availableCountries.includes("CA") },
        },
        status: v.status,
        created_at: v.createdAt,
        updated_at: v.updatedAt,
      };
    });

    const isVariableProduct = attrMap["product_type"] === "variable" || (variants.length > 1);
    const productType = attrMap["product_type"] || (isVariableProduct ? "variable" : "simple");

    // Total stock and country-wise stock aggregation across product/variants
    const productStockByCountry = { US: 0, CA: 0 };
    variants.forEach((v) => {
      if (v.stock_by_country) {
        Object.entries(v.stock_by_country).forEach(([c, q]) => {
          productStockByCountry[c] = (productStockByCountry[c] || 0) + Number(q || 0);
        });
      }
    });

    const totalStock = isVariableProduct && variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
      : (productStockByCountry.US + productStockByCountry.CA || 100);

    const isB2BOnly = Boolean(
      attrMap["is_b2b_only"] === "true" ||
      attrMap["is_b2b_only"] === true ||
      p.isB2BOnly === true
    );

    const moq = parseInt(attrMap["moq"] || "1", 10) || 1;

    // Calculate authoritative consumer retail prices & MRP
    const resolvedUsdPrice = priceUsd || 35.0;
    const resolvedCadPrice = priceCad || Number((resolvedUsdPrice * 1.35).toFixed(2));

    const resolvedUsdMrp = oldPriceUsd || Math.round(resolvedUsdPrice * 1.35);
    const resolvedCadMrp = oldPriceCad || Math.round(resolvedCadPrice * 1.35);

    const productAvailableCountries = [];
    if (productStockByCountry.US > 0 || (variants.length > 0 && variants.some((v) => v.available_countries?.includes("US")))) productAvailableCountries.push("US");
    if (productStockByCountry.CA > 0 || (variants.length > 0 && variants.some((v) => v.available_countries?.includes("CA")))) productAvailableCountries.push("CA");

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.variants?.[0]?.sku || p.slug,
      description: p.description || "",
      category_id: catId,
      category: catName,
      brand_id: p.brandId,
      brand: p.brand?.name || null,
      product_type: productType,
      is_featured: Boolean(p.isFeatured),
      is_new: Boolean(attrMap["is_new"] === "true" || attrMap["is_new"] === true),
      is_best_seller: Boolean(p.isBestSeller),
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
      image: images[0] || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      price_usd: resolvedUsdPrice,
      old_price_usd: resolvedUsdMrp,
      price_cad: resolvedCadPrice,
      old_price_cad: resolvedCadMrp,
      price: resolvedUsdPrice,
      old_price: resolvedUsdMrp,
      mrp: resolvedUsdMrp,
      stock_quantity: totalStock,
      stock: totalStock,
      stock_by_country: productStockByCountry,
      available_countries: productAvailableCountries.length > 0 ? productAvailableCountries : ["US", "CA"],
      status: p.status,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      variants: variants,
      varients: variants,
      pricing: {
        US: { currency: "USD", symbol: "$", retailPrice: resolvedUsdPrice, oldPrice: resolvedUsdMrp, stock: productStockByCountry.US, isAvailable: productAvailableCountries.includes("US") },
        CA: { currency: "CAD", symbol: "CA$", retailPrice: resolvedCadPrice, oldPrice: resolvedCadMrp, stock: productStockByCountry.CA, isAvailable: productAvailableCountries.includes("CA") },
      },
    };
  }

  async listProducts({ search, categoryId, category_id, brandId, brand_id, isFeatured, is_featured, isBestSeller, is_best_seller, isB2BOnly, is_b2b_only, user = null, status = "ACTIVE", page = 1, limit = 50 } = {}) {
    const where = {};
    if (status) where.status = status;
    const effBrandId = brandId || brand_id;
    if (effBrandId) where.brandId = effBrandId;

    const effCatId = categoryId || category_id;
    if (effCatId) {
      where.categories = { some: { categoryId: effCatId } };
    }

    const effFeatured = isFeatured !== undefined ? isFeatured : is_featured;
    if (effFeatured !== undefined) {
      where.isFeatured = effFeatured === true || effFeatured === "true";
    }

    const effBestSeller = isBestSeller !== undefined ? isBestSeller : is_best_seller;
    if (effBestSeller !== undefined) {
      where.isBestSeller = effBestSeller === true || effBestSeller === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, rawItems] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          categories: { include: { category: true } },
          images: { include: { file: true } },
          attributes: { include: { attribute: true, value: true } },
          b2cListing: { include: { prices: true } },
          b2bListings: { include: { prices: true, tiers: true } },
          variants: {
            where: { status: { not: "ARCHIVED" } },
            include: {
              images: { include: { file: true } },
              attributes: { include: { attribute: true, value: true } },
              b2cPrices: true,
              b2bPrices: true,
              inventoryItems: {
                include: {
                  warehouse: {
                    include: { country: true },
                  },
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    let formattedItems = rawItems.map((p) => this._formatProduct(p));

    const targetB2BOnly = isB2BOnly !== undefined ? isB2BOnly : is_b2b_only;
    if (targetB2BOnly !== undefined) {
      const wantB2B = targetB2BOnly === true || targetB2BOnly === "true";
      formattedItems = formattedItems.filter((p) => p.is_b2b_only === wantB2B);
    }

    return { total: formattedItems.length, items: formattedItems };
  }

  async getFeaturedProducts({ limit = 10 } = {}) {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        attributes: { include: { attribute: true, value: true } },
        b2cListing: { include: { prices: true } },
        b2bListings: { include: { prices: true, tiers: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            b2cPrices: true,
            b2bPrices: true,
            inventoryItems: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => this._formatProduct(p));
  }

  async getBestSellers({ limit = 10 } = {}) {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", isBestSeller: true },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        attributes: { include: { attribute: true, value: true } },
        b2cListing: { include: { prices: true } },
        b2bListings: { include: { prices: true, tiers: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            b2cPrices: true,
            b2bPrices: true,
            inventoryItems: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => this._formatProduct(p));
  }

  async getNewArrivals({ limit = 10 } = {}) {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        attributes: { include: { attribute: true, value: true } },
        b2cListing: { include: { prices: true } },
        b2bListings: { include: { prices: true, tiers: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            b2cPrices: true,
            b2bPrices: true,
            inventoryItems: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => this._formatProduct(p));
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
        b2cListing: { include: { prices: true } },
        b2bListings: { include: { prices: true, tiers: true } },
        variants: {
          where: { status: { not: "ARCHIVED" } },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            b2cPrices: true,
            b2bPrices: true,
            inventoryItems: {
              include: {
                warehouse: {
                  include: { country: true },
                },
              },
            },
            packaging: true,
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

    return this._formatProduct(product);
  }

  /**
   * CREATE Product with explicit handling for Simple vs Variable pricing and stock
   */
  async createProduct(data, tx = null) {
    const db = tx || prisma;
    const {
      name,
      slug,
      sku,
      description,
      category_id,
      categoryId = category_id,
      brand_id,
      brandId = brand_id,
      product_type = "simple",
      is_featured = false,
      isFeatured = is_featured,
      is_new = false,
      isNew = is_new,
      isNewProduct = is_new,
      is_best_seller = false,
      isBestSeller = is_best_seller,
      images = [],
      image,
      price_usd,
      priceUS = price_usd,
      old_price_usd,
      oldPrice = old_price_usd,
      price_cad,
      priceCA = price_cad,
      old_price_cad,
      stock_quantity,
      stock = stock_quantity,
      status = "ACTIVE",
      varients,
      variants = varients || [],
      ...rest
    } = data;

    if (!name || typeof name !== "string") {
      throw new BadRequestError("Product name is required");
    }

    const isVariable = product_type === "variable";
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;
    const generatedSku = sku || `VAN-${Date.now().toString().slice(-6)}`;

    // 1. Resolve Category Connection
    let categoryConnect = undefined;
    const resolvedCatId = categoryId || (Array.isArray(data.categories) && data.categories[0] ? (typeof data.categories[0] === "string" ? data.categories[0] : data.categories[0].categoryId || data.categories[0].id) : null);
    if (resolvedCatId) {
      categoryConnect = { create: { categoryId: resolvedCatId } };
    }

    // 2. Prepare Variant List:
    // If Variable: use the provided variants array with individual prices and stock.
    // If Simple: create a single default variant with the product's base prices and stock.
    const inputVariants = (isVariable && Array.isArray(variants) && variants.length > 0)
      ? variants
      : [
          {
            variant_name: `${name} Standard`,
            sku: `${generatedSku}-VAR`,
            weight: 1.0,
            price_usd: parseFloat(priceUS || price_usd) || 0,
            old_price_usd: old_price_usd || oldPrice ? parseFloat(old_price_usd || oldPrice) : null,
            price_cad: priceCA || price_cad ? parseFloat(priceCA || price_cad) : (parseFloat(priceUS || price_usd || 0) * 1.35),
            old_price_cad: old_price_cad ? parseFloat(old_price_cad) : null,
            stock_quantity: parseInt(stock_quantity ?? stock ?? 100, 10),
            status: status || "ACTIVE",
          },
        ];

    const variantsToCreate = inputVariants.map((v, i) => ({
      name: v.variant_name || v.name || `${name} Variant ${i + 1}`,
      sku: v.sku || `${generatedSku}-V${i + 1}`,
      status: v.status || "ACTIVE",
      weight: parseFloat(v.weight) || 1.0,
    }));

    // 3. Create Product & Variants in DB
    const created = await db.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || "",
        status: status || "ACTIVE",
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
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

    // 4. Attach inventory items & individual prices for each created variant
    const defaultWarehouse = await db.warehouse.findFirst();
    const effectiveUsd = priceUS || price_usd || (inputVariants[0]?.price_usd) || data.price || 35.0;
    const effectiveCad = priceCA || price_cad || (inputVariants[0]?.price_cad) || (Number(effectiveUsd) * 1.35);

    // Create B2CProductListing
    const b2cListing = await (db.b2CProductListing || db.b2cProductListing).create({
      data: {
        productId: created.id,
        status: "ACTIVE",
      },
    });

    if (created.variants) {
      for (let i = 0; i < created.variants.length; i++) {
        const vRecord = created.variants[i];
        const vInput = inputVariants[i] || {};
        const vStock = Number(vInput.stock_quantity ?? vInput.stock ?? (isVariable ? 50 : (stock_quantity ?? stock ?? 100)));

        // Warehouse Stock
        if (defaultWarehouse) {
          try {
            await db.inventoryItem.create({
              data: {
                warehouseId: defaultWarehouse.id,
                variantId: vRecord.id,
                onHand: vStock,
              },
            });
          } catch (e) {}
        }

        // Variant USD & CAD Prices in B2CPrice
        const vUsd = vInput.price_usd ? parseFloat(vInput.price_usd) : (parseFloat(effectiveUsd) || 35.0);
        const vCad = vInput.price_cad ? parseFloat(vInput.price_cad) : (parseFloat(effectiveCad) || (vUsd * 1.35));

        try {
          const b2cPriceModel = db.b2CPrice || db.b2cPrice;
          await b2cPriceModel.create({
            data: {
              listingId: b2cListing.id,
              variantId: vRecord.id,
              currency: "USD",
              price: vUsd,
              compareAt: vInput.old_price_usd ? parseFloat(vInput.old_price_usd) : (oldPrice || old_price_usd ? parseFloat(oldPrice || old_price_usd) : null),
              status: "ACTIVE",
            },
          });

          await b2cPriceModel.create({
            data: {
              listingId: b2cListing.id,
              variantId: vRecord.id,
              currency: "CAD",
              price: vCad,
              compareAt: vInput.old_price_cad ? parseFloat(vInput.old_price_cad) : (old_price_cad ? parseFloat(old_price_cad) : null),
              status: "ACTIVE",
            },
          });
        } catch (e) {
          console.error("B2CPrice create error:", e);
        }
      }
    }

    // 5. Save Product Images
    const imageList = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (typeof img === "string" && img.trim()) imageList.push(img.trim());
        else if (img?.url) imageList.push(img.url);
      }
    } else if (image && typeof image === "string") {
      imageList.push(image);
    }

    for (let idx = 0; idx < imageList.length; idx++) {
      try {
        const fileAsset = await db.fileAsset.create({
          data: {
            fileName: `${name}-img-${idx + 1}.jpg`,
            storageKey: `products/${created.id}-${idx + 1}.jpg`,
            mimeType: "image/jpeg",
            type: "PRODUCT_IMAGE",
            sizeBytes: BigInt(1024),
            url: imageList[idx],
          },
        });
        await db.productImage.create({
          data: {
            productId: created.id,
            fileAssetId: fileAsset.id,
            sortOrder: idx,
          },
        });
      } catch (e) {}
    }

    // 6. Save Product-Level Attributes
    const attributesToSave = [
      { code: "product_type", name: "Product Type", value: product_type },
      { code: "is_new", name: "Is New", value: Boolean(isNew || isNewProduct) ? "true" : "false" },
    ];
    if (oldPrice || old_price_usd) attributesToSave.push({ code: "old_price_usd", name: "Old Price USD", value: String(oldPrice || old_price_usd) });
    if (old_price_cad) attributesToSave.push({ code: "old_price_cad", name: "Old Price CAD", value: String(old_price_cad) });

    for (const attrItem of attributesToSave) {
      try {
        const attr = await db.attribute.upsert({
          where: { code: attrItem.code },
          update: {},
          create: { name: attrItem.name, code: attrItem.code, dataType: "STRING" },
        });
        await db.productAttribute.create({
          data: {
            productId: created.id,
            attributeId: attr.id,
            customValue: String(attrItem.value),
          },
        });
      } catch (e) {}
    }

    // 8. Return cleanly formatted product
    return this.getProductById(created.id);
  }

  /**
   * UPDATE Product & Variants
   */
  async updateProduct(idOrSlug, data, tx = null) {
    const db = tx || prisma;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const existing = await db.product.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: { variants: true, categories: true, images: true, attributes: true },
    });

    if (!existing) {
      throw new NotFoundError(`Product '${idOrSlug}' not found`);
    }

    const id = existing.id;

    const {
      name,
      description,
      status,
      category_id,
      categoryId = category_id,
      brand_id,
      brandId = brand_id,
      product_type,
      is_featured,
      isFeatured = is_featured,
      is_new,
      isNew = is_new,
      isNewProduct = is_new,
      is_best_seller,
      isBestSeller = is_best_seller,
      images,
      image,
      price_usd,
      priceUS = price_usd,
      old_price_usd,
      oldPrice = old_price_usd,
      price_cad,
      priceCA = price_cad,
      old_price_cad,
      stock_quantity,
      stock = stock_quantity,
      varients,
      variants = varients,
      ...rest
    } = data;

    const isVariable = (product_type !== undefined ? product_type === "variable" : (existing.attributes?.find((a) => a.attribute?.code === "product_type")?.customValue === "variable"));

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isBestSeller !== undefined) updateData.isBestSeller = Boolean(isBestSeller);
    if (brandId !== undefined) updateData.brandId = brandId || null;

    // Update Category Link
    if (categoryId !== undefined) {
      await db.productCategory.deleteMany({ where: { productId: id } });
      if (categoryId) {
        await db.productCategory.create({ data: { productId: id, categoryId } });
      }
    }

    // Update Product Record
    await db.product.update({
      where: { id },
      data: updateData,
    });

    // Update Images if provided
    if (images !== undefined || image !== undefined) {
      const imageList = [];
      if (Array.isArray(images)) {
        for (const img of images) {
          if (typeof img === "string" && img.trim()) imageList.push(img.trim());
          else if (img?.url) imageList.push(img.url);
        }
      } else if (image && typeof image === "string") {
        imageList.push(image);
      }

      if (imageList.length > 0) {
        await db.productImage.deleteMany({ where: { productId: id } });
        for (let idx = 0; idx < imageList.length; idx++) {
          try {
            const fileAsset = await db.fileAsset.create({
              data: {
                originalName: `${name || existing.name}-img-${idx + 1}.jpg`,
                storageKey: imageList[idx],
                mimeType: "image/jpeg",
                sizeBytes: 1024,
                url: imageList[idx],
              },
            });
            await db.productImage.create({
              data: {
                productId: id,
                fileAssetId: fileAsset.id,
                sortOrder: idx,
              },
            });
          } catch (e) {}
        }
      }
    }

    // Update Custom Attributes
    const updateAttrs = [];
    if (product_type !== undefined) updateAttrs.push({ code: "product_type", name: "Product Type", value: product_type });
    if (isNew !== undefined || isNewProduct !== undefined) updateAttrs.push({ code: "is_new", name: "Is New", value: Boolean(isNew || isNewProduct) ? "true" : "false" });
    if (oldPrice !== undefined || old_price_usd !== undefined) updateAttrs.push({ code: "old_price_usd", name: "Old Price USD", value: String(oldPrice ?? old_price_usd ?? "") });
    if (old_price_cad !== undefined) updateAttrs.push({ code: "old_price_cad", name: "Old Price CAD", value: String(old_price_cad ?? "") });

    for (const attrItem of updateAttrs) {
      try {
        const attr = await db.attribute.upsert({
          where: { code: attrItem.code },
          update: {},
          create: { name: attrItem.name, code: attrItem.code, dataType: "STRING" },
        });
        await db.productAttribute.deleteMany({ where: { productId: id, attributeId: attr.id } });
        if (attrItem.value) {
          await db.productAttribute.create({
            data: { productId: id, attributeId: attr.id, customValue: String(attrItem.value) },
          });
        }
      } catch (e) {}
    }

    // Update B2C Listing
    const b2cListingModel = db.b2CProductListing || db.b2cProductListing;
    const b2cPriceModel = db.b2CPrice || db.b2cPrice;

    let b2cListing = await b2cListingModel.findUnique({ where: { productId: id } });
    if (!b2cListing) {
      b2cListing = await b2cListingModel.create({ data: { productId: id, status: "ACTIVE" } });
    }

    // Update Variants and their specific prices/stock
    if (variants !== undefined && Array.isArray(variants)) {
      const existingVariants = await db.productVariant.findMany({ where: { productId: id }, select: { id: true } });
      const variantIds = existingVariants.map((v) => v.id);

      if (variantIds.length > 0) {
        await db.inventoryItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await b2cPriceModel.deleteMany({ where: { variantId: { in: variantIds } } });
        if (db.b2BPrice || db.b2bPrice) {
          await (db.b2BPrice || db.b2bPrice).deleteMany({ where: { variantId: { in: variantIds } } });
        }
        await db.productAttribute.deleteMany({ where: { variantId: { in: variantIds } } });
        await db.productImage.deleteMany({ where: { variantId: { in: variantIds } } });
        await db.productPackaging.deleteMany({ where: { variantId: { in: variantIds } } });
        await db.inventoryReservation.deleteMany({ where: { variantId: { in: variantIds } } });
      }

      await db.productVariant.deleteMany({ where: { productId: id } });
      const defaultWarehouse = await db.warehouse.findFirst();

      const inputVariants = (isVariable && variants.length > 0)
        ? variants
        : [
            {
              variant_name: `${name || existing.name} Standard`,
              sku: `${existing.slug || "SKU"}-VAR`,
              weight: 1.0,
              price_usd: priceUS || price_usd,
              old_price_usd: oldPrice || old_price_usd,
              price_cad: priceCA || price_cad,
              old_price_cad: old_price_cad,
              stock_quantity: stock_quantity ?? stock ?? 100,
              status: "ACTIVE",
            },
          ];

      for (let i = 0; i < inputVariants.length; i++) {
        const v = inputVariants[i];
        const createdV = await db.productVariant.create({
          data: {
            productId: id,
            name: v.variant_name || v.name || `Variant ${i + 1}`,
            sku: v.sku || `${existing.slug || "SKU"}-V${i + 1}`,
            status: v.status || "ACTIVE",
            weight: parseFloat(v.weight) || 1.0,
          },
        });

        // Warehouse Stock
        if (defaultWarehouse) {
          const vStock = Number(v.stock_quantity ?? v.stock ?? (isVariable ? 50 : (stock_quantity ?? stock ?? 100)));
          await db.inventoryItem.create({
            data: {
              warehouseId: defaultWarehouse.id,
              variantId: createdV.id,
              onHand: vStock,
            },
          });
        }

        // Variant USD & CAD Prices
        const vUsd = v.price_usd ? parseFloat(v.price_usd) : (price_usd || priceUS ? parseFloat(price_usd || priceUS) : 35.0);
        const vCad = v.price_cad ? parseFloat(v.price_cad) : (price_cad || priceCA ? parseFloat(price_cad || priceCA) : (vUsd * 1.35));

        try {
          await b2cPriceModel.create({
            data: {
              listingId: b2cListing.id,
              variantId: createdV.id,
              currency: "USD",
              price: vUsd,
              compareAt: v.old_price_usd ? parseFloat(v.old_price_usd) : (oldPrice || old_price_usd ? parseFloat(oldPrice || old_price_usd) : null),
              status: "ACTIVE",
            },
          });

          await b2cPriceModel.create({
            data: {
              listingId: b2cListing.id,
              variantId: createdV.id,
              currency: "CAD",
              price: vCad,
              compareAt: v.old_price_cad ? parseFloat(v.old_price_cad) : (old_price_cad ? parseFloat(old_price_cad) : null),
              status: "ACTIVE",
            },
          });
        } catch (e) {}
      }
    }

    return this.getProductById(id);
  }

  /**
   * DELETE (Archive) Product
   */
  async deleteProduct(id, tx = null) {
    const db = tx || prisma;
    return db.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }
}
