import { prisma } from "../../infrastructure/database/prisma.js";

/**
 * WishlistService
 * Direct Prisma queries for Wishlists
 */
export class WishlistService {
  async getOrCreateWishlist(userId) {
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

  async addItem(userId, productId) {
    const wishlist = await this.getOrCreateWishlist(userId);
    return prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: { wishlistId: wishlist.id, productId },
      },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });
  }

  async removeItem(userId, productId) {
    const wishlist = await this.getOrCreateWishlist(userId);
    return prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });
  }
}
