import { prisma } from "../../infrastructure/database/prisma.js";

export class ReviewRepository {
  static async createReview({ userId, productId, rating, title, body, mediaFileAssetIds = [] }) {
    return prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        body,
        approved: true, // auto-approve for demonstration or moderation pipeline
        media: {
          create: mediaFileAssetIds.map(fileAssetId => ({ fileAssetId })),
        },
      },
      include: { media: { include: { file: true } }, user: { select: { firstName: true, lastName: true } } },
    });
  }

  static async listByProduct(productId, { page = 1, limit = 20 }) {
    const where = { productId, approved: true };
    const [total, items] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true } },
          media: { include: { file: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }
}

export default async function reviewRoutes(fastify, options) {
  fastify.get("/reviews/product/:productId", async (request, reply) => {
    const data = await ReviewRepository.listByProduct(request.params.productId, request.query);
    return reply.send({ success: true, ...data });
  });

  fastify.post("/reviews", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const data = await ReviewRepository.createReview({
        ...request.body,
        userId: request.user.id,
      });
      return reply.status(201).send({ success: true, data });
    },
  });
}
