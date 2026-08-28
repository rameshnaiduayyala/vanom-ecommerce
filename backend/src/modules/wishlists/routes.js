import { prisma } from "../../infrastructure/database/prisma.js";

export class WishlistRepository {
  static async getOrCreateWishlist(userId) {
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { include: { file: true } } },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return wishlist;
  }

  static async addItem(userId, productId) {
    const wishlist = await WishlistRepository.getOrCreateWishlist(userId);
    return prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: { wishlistId: wishlist.id, productId },
      },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });
  }

  static async removeItem(userId, productId) {
    const wishlist = await WishlistRepository.getOrCreateWishlist(userId);
    return prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });
  }
}

export default async function wishlistRoutes(fastify, options) {
  fastify.get("/wishlists", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const data = await WishlistRepository.getOrCreateWishlist(request.user.id);
      return reply.send({ success: true, data });
    },
  });

  fastify.post("/wishlists/items", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const data = await WishlistRepository.addItem(request.user.id, request.body?.productId);
      return reply.status(201).send({ success: true, data });
    },
  });

  fastify.delete("/wishlists/items/:productId", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      await WishlistRepository.removeItem(request.user.id, request.params.productId);
      return reply.send({ success: true, message: "Item removed from wishlist" });
    },
  });
}
