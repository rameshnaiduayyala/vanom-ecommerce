import { prisma } from "../../infrastructure/database/prisma.js";
import { NotFoundError, BadRequestError } from "../../common/errors/index.js";

/**
 * BulkProductsService
 * Dedicated B2B Wholesale Bulk Products engine powered by dedicated tables:
 * - prisma.bulkProduct
 * - prisma.bulkProductCategory (linked to shared Category table)
 * - prisma.bulkTierPrice
 */
export class BulkProductsService {
  _formatBulkProduct(bp) {
    if (!bp) return null;

    const primaryCategory = bp.categories?.[0]?.category;

    const wholesaleTiers = (bp.tiers || [])
      .sort((a, b) => a.minQuantity - b.minQuantity)
      .map((t) => ({
        id: t.id,
        tierNumber: t.tierNumber,
        name: t.name,
        minQuantity: t.minQuantity,
        maxQuantity: t.maxQuantity,
        discountPercent: Number(t.discountPercent || 0),
        unitPriceUSD: Number(t.unitPriceUSD || 0),
        unitPriceCAD: Number(t.unitPriceCAD || 0),
        unitPriceINR: Number(t.unitPriceINR || 0),
      }));

    return {
      id: bp.id,
      name: bp.name,
      slug: bp.slug,
      sku: bp.sku,
      description: bp.description || "",
      status: bp.status,
      categoryId: primaryCategory?.id || null,
      categoryName: primaryCategory?.name || "Bulk Commodities",
      categories: (bp.categories || []).map((c) => ({
        id: c.category?.id || c.categoryId,
        name: c.category?.name || "Category",
      })),
      moq: bp.moq,
      packaging: {
        type: bp.packagingType,
        unitsPerPackage: bp.unitsPerPackage,
        packagesPerPallet: bp.packagesPerPallet,
        palletCapacityUnits: bp.palletCapacityUnits || (bp.unitsPerPackage * bp.packagesPerPallet),
      },
      leadTimeDays: bp.leadTimeDays,
      originCountry: bp.originCountry,
      basePriceUSD: Number(bp.basePriceUSD),
      basePriceCAD: Number(bp.basePriceCAD),
      basePriceINR: Number(bp.basePriceINR),
      stockQuantity: bp.stockQuantity,
      images: Array.isArray(bp.images) && bp.images.length > 0
        ? bp.images
        : ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
      wholesaleTiers,
      createdAt: bp.createdAt,
      updatedAt: bp.updatedAt,
    };
  }

  /**
   * List all Private B2B Bulk Products from dedicated bulkProduct table
   */
  async listBulkProducts({ search, categoryId, page = 1, limit = 50 } = {}) {
    const where = { status: "ACTIVE" };

    if (categoryId && categoryId !== "ALL") {
      where.categories = { some: { categoryId } };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let [total, rawItems] = await Promise.all([
      prisma.bulkProduct.count({ where }),
      prisma.bulkProduct.findMany({
        where,
        include: {
          categories: { include: { category: true } },
          tiers: true,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Seed default starter bulk products if empty
    if (total === 0 && !search && (!categoryId || categoryId === "ALL")) {
      await this._seedInitialBulkProducts();
      return this.listBulkProducts({ search, categoryId, page, limit });
    }

    const items = rawItems.map((p) => this._formatBulkProduct(p));
    return { total, items };
  }

  /**
   * Get single Bulk Product by ID or Slug
   */
  async getBulkProductById(id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { slug: id };

    const product = await prisma.bulkProduct.findFirst({
      where,
      include: {
        categories: { include: { category: true } },
        tiers: true,
      },
    });

    if (!product) throw new NotFoundError(`Bulk product ${id} not found`);
    return this._formatBulkProduct(product);
  }

  /**
   * CREATE a new dedicated Bulk Product in bulkProduct table
   */
  async createBulkProduct(data) {
    const {
      name,
      sku,
      description,
      categoryId,
      moq = 20,
      packagingType = "Master Carton / Sack",
      unitsPerPackage = 25,
      packagesPerPallet = 40,
      leadTimeDays = 3,
      originCountry = "India",
      basePriceUSD = 30.0,
      basePriceCAD = 40.5,
      basePriceINR = 1500,
      stockQuantity = 5000,
      images = [],
      wholesaleTiers = [],
    } = data;

    if (!name) throw new BadRequestError("Bulk product name is required");

    const generatedSlug = `blk-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString().slice(-4)}`;
    const generatedSku = sku || `BLK-${Date.now().toString().slice(-6)}`;

    // Prepare Tier Pricing
    const tiersToCreate = (wholesaleTiers.length > 0 ? wholesaleTiers : [
      {
        tierNumber: 1,
        name: "Tier 1 (Base MOQ)",
        minQuantity: parseInt(moq, 10) || 20,
        maxQuantity: (parseInt(moq, 10) || 20) * 4,
        discountPercent: 0,
        unitPriceUSD: parseFloat(basePriceUSD) || 30.0,
        unitPriceCAD: parseFloat(basePriceCAD) || 40.5,
        unitPriceINR: parseFloat(basePriceINR) || 1500,
      },
      {
        tierNumber: 2,
        name: "Tier 2 (Case Bulk)",
        minQuantity: (parseInt(moq, 10) || 20) * 4 + 1,
        maxQuantity: (parseInt(moq, 10) || 20) * 20,
        discountPercent: 12,
        unitPriceUSD: Number(((parseFloat(basePriceUSD) || 30.0) * 0.88).toFixed(2)),
        unitPriceCAD: Number(((parseFloat(basePriceCAD) || 40.5) * 0.88).toFixed(2)),
        unitPriceINR: Math.round((parseFloat(basePriceINR) || 1500) * 0.88),
      },
      {
        tierNumber: 3,
        name: "Tier 3 (Pallet / Container)",
        minQuantity: (parseInt(moq, 10) || 20) * 20 + 1,
        maxQuantity: null,
        discountPercent: 25,
        unitPriceUSD: Number(((parseFloat(basePriceUSD) || 30.0) * 0.75).toFixed(2)),
        unitPriceCAD: Number(((parseFloat(basePriceCAD) || 40.5) * 0.75).toFixed(2)),
        unitPriceINR: Math.round((parseFloat(basePriceINR) || 1500) * 0.75),
      },
    ]).map((t, idx) => ({
      tierNumber: t.tierNumber || idx + 1,
      name: t.name || `Tier ${idx + 1}`,
      minQuantity: parseInt(t.minQuantity, 10),
      maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity, 10) : null,
      discountPercent: parseFloat(t.discountPercent || 0),
      unitPriceUSD: parseFloat(t.unitPriceUSD || basePriceUSD),
      unitPriceCAD: parseFloat(t.unitPriceCAD || basePriceCAD),
      unitPriceINR: parseFloat(t.unitPriceINR || basePriceINR),
    }));

    // Create BulkProduct in dedicated table
    const product = await prisma.bulkProduct.create({
      data: {
        name,
        slug: generatedSlug,
        sku: generatedSku,
        description: description || `Enterprise B2B Wholesale ${name}`,
        status: "ACTIVE",
        moq: parseInt(moq, 10) || 20,
        packagingType,
        unitsPerPackage: parseInt(unitsPerPackage, 10) || 25,
        packagesPerPallet: parseInt(packagesPerPallet, 10) || 40,
        palletCapacityUnits: (parseInt(unitsPerPackage, 10) || 25) * (parseInt(packagesPerPallet, 10) || 40),
        leadTimeDays: parseInt(leadTimeDays, 10) || 3,
        originCountry,
        basePriceUSD: parseFloat(basePriceUSD) || 30.0,
        basePriceCAD: parseFloat(basePriceCAD) || 40.5,
        basePriceINR: parseFloat(basePriceINR) || 1500,
        stockQuantity: parseInt(stockQuantity, 10) || 5000,
        images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
        categories: categoryId ? { create: { categoryId } } : undefined,
        tiers: {
          create: tiersToCreate,
        },
      },
      include: {
        categories: { include: { category: true } },
        tiers: true,
      },
    });

    return this._formatBulkProduct(product);
  }

  /**
   * UPDATE Bulk Product
   */
  async updateBulkProduct(id, data) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const existing = await prisma.bulkProduct.findFirst({ where: isUuid ? { id } : { slug: id } });
    if (!existing) throw new NotFoundError(`Bulk product ${id} not found`);

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.moq !== undefined) updateData.moq = parseInt(data.moq, 10);
    if (data.packagingType !== undefined) updateData.packagingType = data.packagingType;
    if (data.unitsPerPackage !== undefined) updateData.unitsPerPackage = parseInt(data.unitsPerPackage, 10);
    if (data.packagesPerPallet !== undefined) updateData.packagesPerPallet = parseInt(data.packagesPerPallet, 10);
    if (data.leadTimeDays !== undefined) updateData.leadTimeDays = parseInt(data.leadTimeDays, 10);
    if (data.originCountry !== undefined) updateData.originCountry = data.originCountry;
    if (data.basePriceUSD !== undefined) updateData.basePriceUSD = parseFloat(data.basePriceUSD);
    if (data.basePriceCAD !== undefined) updateData.basePriceCAD = parseFloat(data.basePriceCAD);
    if (data.basePriceINR !== undefined) updateData.basePriceINR = parseFloat(data.basePriceINR);
    if (data.stockQuantity !== undefined) updateData.stockQuantity = parseInt(data.stockQuantity, 10);
    if (data.images !== undefined) updateData.images = data.images;

    // Update Category Link
    if (data.categoryId !== undefined) {
      await prisma.bulkProductCategory.deleteMany({ where: { bulkProductId: existing.id } });
      if (data.categoryId) {
        await prisma.bulkProductCategory.create({
          data: { bulkProductId: existing.id, categoryId: data.categoryId },
        });
      }
    }

    // Update Tier Pricing
    if (data.wholesaleTiers && Array.isArray(data.wholesaleTiers)) {
      await prisma.bulkTierPrice.deleteMany({ where: { bulkProductId: existing.id } });
      await prisma.bulkTierPrice.createMany({
        data: data.wholesaleTiers.map((t, idx) => ({
          bulkProductId: existing.id,
          tierNumber: t.tierNumber || idx + 1,
          name: t.name || `Tier ${idx + 1}`,
          minQuantity: parseInt(t.minQuantity, 10),
          maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity, 10) : null,
          discountPercent: parseFloat(t.discountPercent || 0),
          unitPriceUSD: parseFloat(t.unitPriceUSD || existing.basePriceUSD),
          unitPriceCAD: parseFloat(t.unitPriceCAD || existing.basePriceCAD),
          unitPriceINR: parseFloat(t.unitPriceINR || existing.basePriceINR),
        })),
      });
    }

    await prisma.bulkProduct.update({
      where: { id: existing.id },
      data: updateData,
    });

    return this.getBulkProductById(existing.id);
  }

  /**
   * DELETE Bulk Product
   */
  async deleteBulkProduct(id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const existing = await prisma.bulkProduct.findFirst({ where: isUuid ? { id } : { slug: id } });
    if (!existing) throw new NotFoundError(`Bulk product ${id} not found`);

    await prisma.bulkProduct.delete({ where: { id: existing.id } });
    return { success: true, message: `Bulk product ${id} deleted successfully` };
  }

  /**
   * Seed Starter Wholesale Bulk Products (linked to existing categories)
   */
  async _seedInitialBulkProducts() {
    const categories = await prisma.category.findMany({ take: 5 });
    const catId1 = categories[0]?.id;
    const catId2 = categories[1]?.id || catId1;

    const seeds = [
      {
        name: "Royal Heritage Aged Basmati Rice (25 KG Poly Sacks)",
        sku: "BLK-RICE-25KG",
        description: "Export-grade 1121 XXL Grain Aged Basmati Rice. Vacuum packed in 25 KG moisture-resistant woven poly sacks.",
        categoryId: catId1,
        moq: 20,
        packagingType: "25 KG Heavy Poly Sack",
        unitsPerPackage: 1,
        packagesPerPallet: 40,
        leadTimeDays: 2,
        originCountry: "India",
        basePriceUSD: 24.5,
        basePriceCAD: 33.0,
        basePriceINR: 1750,
        stockQuantity: 4000,
        images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
      },
      {
        name: "Heavy-Duty 5-Ply Corrugated Shipping Boxes (Master Bundle of 50)",
        sku: "BLK-BOX-50PK",
        description: "Industrial strength 200 lb burst-tested carton boxes. Strapped in flat-pack bundles of 50 units.",
        categoryId: catId2,
        moq: 10,
        packagingType: "Flat-Pack Strapped Bundle (50 Pcs)",
        unitsPerPackage: 50,
        packagesPerPallet: 20,
        leadTimeDays: 1,
        originCountry: "India / USA",
        basePriceUSD: 14.0,
        basePriceCAD: 18.9,
        basePriceINR: 950,
        stockQuantity: 2500,
        images: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"],
      },
      {
        name: "Virgin Cold-Pressed Mustard Oil (15 Liter Industrial Tin)",
        sku: "BLK-OIL-15L",
        description: "100% Pure Kachi Ghani Mustard Oil in heavy food-grade sealed metal tins with anti-tamper spout.",
        categoryId: catId1,
        moq: 15,
        packagingType: "15L Sealed Metal Tin",
        unitsPerPackage: 1,
        packagesPerPallet: 36,
        leadTimeDays: 3,
        originCountry: "India",
        basePriceUSD: 28.0,
        basePriceCAD: 37.8,
        basePriceINR: 2100,
        stockQuantity: 1800,
        images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"],
      },
    ];

    for (const item of seeds) {
      await this.createBulkProduct(item);
    }
  }
}
