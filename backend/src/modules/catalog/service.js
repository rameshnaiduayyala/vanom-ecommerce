import { prisma } from "../../infrastructure/database/prisma.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { NotFoundError } from "../../common/errors/index.js";

/**
 * CatalogService
 * Direct Prisma queries, search, filtering, and contextual pricing
 */
export class CatalogService {
  async listProducts({ search, categoryId, brandId, status = "ACTIVE", page = 1, limit = 20 } = {}) {
    const where = {};
    if (status) where.status = status;
    if (brandId) where.brandId = brandId;
    if (categoryId) {
      where.categories = { some: { categoryId } };
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
    return db.product.create({
      data,
      include: {
        variants: true,
      },
    });
  }

  async updateProduct(id, data, tx = null) {
    const db = tx || prisma;
    return db.product.update({
      where: { id },
      data,
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
