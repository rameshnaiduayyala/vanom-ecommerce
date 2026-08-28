import { prisma } from "../../infrastructure/database/prisma.js";

export class CatalogRepository {
  static async listProducts({ search, categoryId, brandId, status = "ACTIVE", page = 1, limit = 20 }) {
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

  static async findById(id) {
    return prisma.product.findUnique({
      where: { id },
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
  }

  static async findBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { include: { file: true } },
        variants: {
          include: {
            packaging: {
              include: { unit: true, type: true, pallet: true },
            },
          },
        },
      },
    });
  }

  static async createProduct(data, tx = null) {
    const db = tx || prisma;
    return db.product.create({
      data,
      include: {
        variants: true,
      },
    });
  }

  static async updateProduct(id, data, tx = null) {
    const db = tx || prisma;
    return db.product.update({
      where: { id },
      data,
    });
  }

  static async deleteProduct(id, tx = null) {
    const db = tx || prisma;
    return db.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }
}
