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

    // Resolve product-level prices from product or price lists
    const usdPriceObj = p.prices?.find((pr) => pr.currency?.code === "USD");
    const cadPriceObj = p.prices?.find((pr) => pr.currency?.code === "CAD");
    const inrPriceObj = p.prices?.find((pr) => pr.currency?.code === "INR");

    const priceUsd = usdPriceObj ? Number(usdPriceObj.amount) : (p.price_usd ? Number(p.price_usd) : (p.priceUS ? Number(p.priceUS) : null));
    const oldPriceUsd = attrMap["old_price_usd"] || attrMap["old_price"] ? Number(attrMap["old_price_usd"] || attrMap["old_price"]) : null;
    const priceCad = cadPriceObj ? Number(cadPriceObj.amount) : (p.price_cad ? Number(p.price_cad) : (p.priceCA ? Number(p.priceCA) : null));
    const oldPriceCad = attrMap["old_price_cad"] ? Number(attrMap["old_price_cad"]) : null;

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

      const vUsdPriceObj = v.prices?.find((pr) => pr.currency?.code === "USD");
      const vCadPriceObj = v.prices?.find((pr) => pr.currency?.code === "CAD");

      const vPriceUsd = vUsdPriceObj ? Number(vUsdPriceObj.amount) : (vAttrMap["price_usd"] ? Number(vAttrMap["price_usd"]) : (v.price_usd ? Number(v.price_usd) : priceUsd));
      const vOldPriceUsd = vAttrMap["old_price_usd"] || vAttrMap["old_price"] ? Number(vAttrMap["old_price_usd"] || vAttrMap["old_price"]) : oldPriceUsd;
      const vPriceCad = vCadPriceObj ? Number(vCadPriceObj.amount) : (vAttrMap["price_cad"] ? Number(vAttrMap["price_cad"]) : (v.price_cad ? Number(v.price_cad) : priceCad));
      const vOldPriceCad = vAttrMap["old_price_cad"] ? Number(vAttrMap["old_price_cad"]) : oldPriceCad;

      const vStock = v.inventoryItems && Array.isArray(v.inventoryItems)
        ? v.inventoryItems.reduce((acc, it) => acc + Number(it.onHand || 0), 0)
        : Number(v.stock_quantity ?? v.stock ?? 100);

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
        stock_quantity: vStock,
        status: v.status,
        created_at: v.createdAt,
        updated_at: v.updatedAt,
      };
    });

    const isVariableProduct = attrMap["product_type"] === "variable" || (variants.length > 1);
    const productType = attrMap["product_type"] || (isVariableProduct ? "variable" : "simple");

    // Total stock calculation: If variable product, sum up variant stocks; if simple, use simple stock quantity
    const totalStock = isVariableProduct && variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
      : (p.inventoryItems?.reduce((sum, it) => sum + (it.onHand || 0), 0) || variants[0]?.stock_quantity || 100);

    const isB2BOnly = Boolean(
      attrMap["is_b2b_only"] === "true" ||
      attrMap["is_b2b_only"] === true ||
      p.isB2BOnly === true
    );

    const moq = parseInt(attrMap["moq"] || "1", 10) || 1;
    const unitsPerPackage = parseInt(attrMap["units_per_package"] || "1", 10) || 1;
    const packagesPerPallet = parseInt(attrMap["packages_per_pallet"] || "20", 10) || 20;

    // Resolve Tiered B2B Wholesale Pricing
    let wholesaleTiers = [];
    if (attrMap["wholesale_tiers"]) {
      try {
        wholesaleTiers = typeof attrMap["wholesale_tiers"] === "string"
          ? JSON.parse(attrMap["wholesale_tiers"])
          : attrMap["wholesale_tiers"];
      } catch (e) {
        wholesaleTiers = [];
      }
    }

    if (!wholesaleTiers || wholesaleTiers.length === 0) {
      // Default standard 3-tier bulk volume discount structure
      const baseU = priceUsd || 35.0;
      wholesaleTiers = [
        {
          tierName: "Tier 1 (Base MOQ)",
          minQty: moq,
          maxQty: moq * 5,
          discountPercent: 0,
          priceUSD: baseU,
          priceCAD: priceCad || (baseU * 1.35),
          priceINR: inrPriceObj ? Number(inrPriceObj.amount) : 1499,
        },
        {
          tierName: "Tier 2 (Case / Volume)",
          minQty: moq * 5 + 1,
          maxQty: moq * 20,
          discountPercent: 12,
          priceUSD: Number((baseU * 0.88).toFixed(2)),
          priceCAD: Number(((priceCad || (baseU * 1.35)) * 0.88).toFixed(2)),
          priceINR: inrPriceObj ? Math.round(Number(inrPriceObj.amount) * 0.88) : 1319,
        },
        {
          tierName: "Tier 3 (Pallet / Container)",
          minQty: moq * 20 + 1,
          maxQty: null,
          discountPercent: 25,
          priceUSD: Number((baseU * 0.75).toFixed(2)),
          priceCAD: Number(((priceCad || (baseU * 1.35)) * 0.75).toFixed(2)),
          priceINR: inrPriceObj ? Math.round(Number(inrPriceObj.amount) * 0.75) : 1124,
        },
      ];
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description || "",
      category_id: catId,
      category: catName,
      brand_id: p.brandId,
      brand: p.brand?.name || null,
      product_type: productType,
      is_featured: Boolean(p.isFeatured),
      is_new: Boolean(attrMap["is_new"] === "true" || attrMap["is_new"] === true),
      is_best_seller: Boolean(p.isBestSeller),
      is_b2b_only: isB2BOnly,
      isB2BOnly: isB2BOnly,
      moq: moq,
      packaging: {
        unitsPerPackage,
        packagesPerPallet,
        palletQuantity: unitsPerPackage * packagesPerPallet,
        unitName: attrMap["packaging_type"] || "Cases / Cartons",
      },
      wholesale_tiers: wholesaleTiers,
      wholesaleTiers: wholesaleTiers,
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
      image: images[0] || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      price_usd: priceUsd,
      old_price_usd: oldPriceUsd,
      price_cad: priceCad,
      old_price_cad: oldPriceCad,
      price: priceUsd || (inrPriceObj ? Number(inrPriceObj.amount) : 35.0),
      mrp: oldPriceUsd || (priceUsd ? Math.round(priceUsd * 1.35) : 50.0),
      stock_quantity: totalStock,
      stock: totalStock,
      status: p.status,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      variants: variants,
      varients: variants, // Aliased for flexible compatibility
      pricing: {
        US: { currency: "USD", symbol: "$", retailPrice: priceUsd || 35.0, oldPrice: oldPriceUsd, moq },
        CA: { currency: "CAD", symbol: "CA$", retailPrice: priceCad || (priceUsd ? priceUsd * 1.35 : 45.0), oldPrice: oldPriceCad, moq },
        IN: { currency: "INR", symbol: "₹", retailPrice: inrPriceObj ? Number(inrPriceObj.amount) : 1499, moq },
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
        { sku: { contains: search, mode: "insensitive" } },
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
          prices: { include: { currency: true, priceList: true } },
          variants: {
            where: { status: { not: "ARCHIVED" } },
            include: {
              images: { include: { file: true } },
              attributes: { include: { attribute: true, value: true } },
              prices: { include: { currency: true, priceList: true } },
              inventoryItems: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    let formattedItems = rawItems.map((p) => this._formatProduct(p));

    // Privacy Guard: If query is explicitly filtering for public B2C vs B2B, or if public visitor
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
        prices: { include: { currency: true, priceList: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            prices: { include: { currency: true, priceList: true } },
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
        prices: { include: { currency: true, priceList: true } },
        variants: {
          where: { status: "ACTIVE" },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            prices: { include: { currency: true, priceList: true } },
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
        bundles: { include: { component: true } },
        prices: { include: { currency: true, priceList: true } },
        variants: {
          where: { status: { not: "ARCHIVED" } },
          include: {
            images: { include: { file: true } },
            attributes: { include: { attribute: true, value: true } },
            prices: { include: { currency: true, priceList: true } },
            inventoryItems: true,
            packaging: {
              include: { unit: true, type: true, pallet: true },
            },
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
        sku: generatedSku,
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

    // Currencies Setup
    let usdCurrency = await db.currency.findUnique({ where: { code: "USD" } });
    if (!usdCurrency) {
      usdCurrency = await db.currency.create({ data: { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 } });
    }
    let usPriceList = await db.priceList.findFirst({ where: { currencyId: usdCurrency.id } });
    if (!usPriceList) {
      const country = await db.country.findFirst();
      const grp = await db.customerGroup.findFirst();
      if (country && grp) {
        usPriceList = await db.priceList.create({
          data: { code: "PL-USD-RETAIL", name: "USD Retail Price List", countryId: country.id, currencyId: usdCurrency.id, customerGroupId: grp.id },
        });
      }
    }

    let cadCurrency = await db.currency.findUnique({ where: { code: "CAD" } });
    if (!cadCurrency) {
      cadCurrency = await db.currency.create({ data: { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimals: 2 } });
    }
    let caPriceList = await db.priceList.findFirst({ where: { currencyId: cadCurrency.id } });
    if (!caPriceList) {
      const country = await db.country.findFirst();
      const grp = await db.customerGroup.findFirst();
      if (country && grp) {
        caPriceList = await db.priceList.create({
          data: { code: "PL-CAD-RETAIL", name: "CAD Retail Price List", countryId: country.id, currencyId: cadCurrency.id, customerGroupId: grp.id },
        });
      }
    }

    // 4. Attach inventory items & individual prices for each created variant
    const defaultWarehouse = await db.warehouse.findFirst();
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
                productId: created.id,
                variantId: vRecord.id,
                onHand: vStock,
              },
            });
          } catch (e) {}
        }

        // Variant USD & CAD Prices
        const vUsd = vInput.price_usd ? parseFloat(vInput.price_usd) : (price_usd || priceUS ? parseFloat(price_usd || priceUS) : null);
        if (vUsd && usdCurrency && usPriceList) {
          try {
            await db.productPrice.create({
              data: {
                productId: created.id,
                variantId: vRecord.id,
                currencyId: usdCurrency.id,
                priceListId: usPriceList.id,
                amount: vUsd,
              },
            });
          } catch (e) {}
        }

        const vCad = vInput.price_cad ? parseFloat(vInput.price_cad) : (price_cad || priceCA ? parseFloat(price_cad || priceCA) : null);
        if (vCad && cadCurrency && caPriceList) {
          try {
            await db.productPrice.create({
              data: {
                productId: created.id,
                variantId: vRecord.id,
                currencyId: cadCurrency.id,
                priceListId: caPriceList.id,
                amount: vCad,
              },
            });
          } catch (e) {}
        }

        // Variant Old Prices as Attributes
        if (vInput.old_price_usd) {
          try {
            const attr = await db.attribute.upsert({
              where: { code: "old_price_usd" },
              update: {},
              create: { name: "Old Price USD", code: "old_price_usd", dataType: "STRING" },
            });
            await db.productAttribute.create({
              data: {
                productId: created.id,
                variantId: vRecord.id,
                attributeId: attr.id,
                customValue: String(vInput.old_price_usd),
              },
            });
          } catch (e) {}
        }

        if (vInput.old_price_cad) {
          try {
            const attr = await db.attribute.upsert({
              where: { code: "old_price_cad" },
              update: {},
              create: { name: "Old Price CAD", code: "old_price_cad", dataType: "STRING" },
            });
            await db.productAttribute.create({
              data: {
                productId: created.id,
                variantId: vRecord.id,
                attributeId: attr.id,
                customValue: String(vInput.old_price_cad),
              },
            });
          } catch (e) {}
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
            originalName: `${name}-img-${idx + 1}.jpg`,
            storageKey: imageList[idx],
            mimeType: "image/jpeg",
            sizeBytes: 1024,
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

    // 7. Product-Level Base Prices (USA USD & Canada CAD)
    const effectiveUsd = priceUS || price_usd || (inputVariants[0]?.price_usd) || data.price;
    if (effectiveUsd && usdCurrency && usPriceList) {
      try {
        await db.productPrice.create({
          data: {
            productId: created.id,
            currencyId: usdCurrency.id,
            priceListId: usPriceList.id,
            amount: parseFloat(effectiveUsd) || 0,
          },
        });
      } catch (e) {}
    }

    const effectiveCad = priceCA || price_cad || (inputVariants[0]?.price_cad);
    if (effectiveCad && cadCurrency && caPriceList) {
      try {
        await db.productPrice.create({
          data: {
            productId: created.id,
            currencyId: cadCurrency.id,
            priceListId: caPriceList.id,
            amount: parseFloat(effectiveCad) || 0,
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

    // Currencies Setup
    const usdCurrency = await db.currency.findUnique({ where: { code: "USD" } });
    const usPriceList = usdCurrency ? await db.priceList.findFirst({ where: { currencyId: usdCurrency.id } }) : null;
    const cadCurrency = await db.currency.findUnique({ where: { code: "CAD" } });
    const caPriceList = cadCurrency ? await db.priceList.findFirst({ where: { currencyId: cadCurrency.id } }) : null;

    // Update Product-Level Base Prices
    if (priceUS !== undefined || price_usd !== undefined) {
      const pVal = parseFloat(priceUS ?? price_usd) || 0;
      if (usdCurrency && usPriceList) {
        await db.productPrice.deleteMany({ where: { productId: id, variantId: null, currencyId: usdCurrency.id } });
        await db.productPrice.create({
          data: { productId: id, currencyId: usdCurrency.id, priceListId: usPriceList.id, amount: pVal },
        });
      }
    }

    if (priceCA !== undefined || price_cad !== undefined) {
      const pVal = parseFloat(priceCA ?? price_cad) || 0;
      if (cadCurrency && caPriceList) {
        await db.productPrice.deleteMany({ where: { productId: id, variantId: null, currencyId: cadCurrency.id } });
        await db.productPrice.create({
          data: { productId: id, currencyId: cadCurrency.id, priceListId: caPriceList.id, amount: pVal },
        });
      }
    }

    // Update Variants and their specific prices/stock
    if (variants !== undefined && Array.isArray(variants)) {
      // Clean up dependent child records of variants before deleting
      const existingVariants = await db.productVariant.findMany({ where: { productId: id }, select: { id: true } });
      const variantIds = existingVariants.map((v) => v.id);

      if (variantIds.length > 0) {
        await db.inventoryItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await db.productPrice.deleteMany({ where: { variantId: { in: variantIds } } });
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
              sku: `${existing.sku || "SKU"}-VAR`,
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
            sku: v.sku || `${existing.sku || "SKU"}-V${i + 1}`,
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
              productId: id,
              variantId: createdV.id,
              onHand: vStock,
            },
          });
        }

        // Variant USD & CAD Prices
        const vUsd = v.price_usd ? parseFloat(v.price_usd) : (price_usd || priceUS ? parseFloat(price_usd || priceUS) : null);
        if (vUsd && usdCurrency && usPriceList) {
          await db.productPrice.create({
            data: {
              productId: id,
              variantId: createdV.id,
              currencyId: usdCurrency.id,
              priceListId: usPriceList.id,
              amount: vUsd,
            },
          });
        }

        const vCad = v.price_cad ? parseFloat(v.price_cad) : (price_cad || priceCA ? parseFloat(price_cad || priceCA) : null);
        if (vCad && cadCurrency && caPriceList) {
          await db.productPrice.create({
            data: {
              productId: id,
              variantId: createdV.id,
              currencyId: cadCurrency.id,
              priceListId: caPriceList.id,
              amount: vCad,
            },
          });
        }
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
