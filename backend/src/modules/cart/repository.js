import { prisma } from "../../infrastructure/database/prisma.js";

export class CartRepository {
  static async getOrCreateCart({ userId, companyId = null, countryId, currencyId }) {
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        companyId: companyId || null,
        active: true,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: { include: { unit: true, type: true, pallet: true } },
              },
            },
          },
        },
        country: true,
        currency: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          companyId,
          countryId,
          currencyId,
        },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true, packaging: true },
              },
            },
          },
          country: true,
          currency: true,
        },
      });
    }

    return cart;
  }

  static async findActiveCart(userId, companyId = null) {
    return prisma.cart.findFirst({
      where: {
        userId,
        companyId: companyId || null,
        active: true,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: { include: { unit: true, type: true, pallet: true } },
              },
            },
          },
        },
        country: true,
        currency: true,
      },
    });
  }

  static async addItem({ cartId, variantId, quantity, unitPrice }) {
    return prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId, variantId },
      },
      create: {
        cartId,
        variantId,
        quantity,
        unitPrice,
      },
      update: {
        quantity: { increment: quantity },
        unitPrice,
      },
    });
  }

  static async updateItemQuantity(itemId, quantity) {
    if (quantity <= 0) {
      return prisma.cartItem.delete({ where: { id: itemId } });
    }
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  static async removeItem(itemId) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  static async clearCart(cartId) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
