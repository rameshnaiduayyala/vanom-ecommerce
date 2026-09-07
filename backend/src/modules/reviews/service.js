import { prisma } from "../../infrastructure/database/prisma.js";

/**
 * ReviewService
 * Direct Prisma queries for product customer reviews
 */
export class ReviewService {
  async listByProduct(productId, { page = 1, limit = 20 } = {}) {
    const where = { productId, approved: true };
    const [total, items] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true } },
          media: { include: { file: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  async createReview({ userId, productId, rating, title, body, mediaFileAssetIds = [] }) {
    return prisma.review.create({
      data: {
        userId,
        productId,
        rating: Number(rating),
        title,
        body,
        approved: true,
        media: {
          create: (mediaFileAssetIds || []).map((fileAssetId) => ({ fileAssetId })),
        },
      },
      include: {
        media: { include: { file: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }
}
