import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          brand: {
            select: { id: true, name: true, slug: true, imageUrl: true }
          }
        }
      },
      variant: true
    }
  }
};

async function getOrCreateCart(userId, tx = prisma) {
  return tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: cartInclude
  });
}

async function validateItem(productId, variantId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true }
  });
  if (!product || !product.isActive) {
    throw new AppError(MESSAGES.PRODUCT_NOT_AVAILABLE, HTTP_STATUS.UNPROCESSABLE_ENTITY, "PRODUCT_NOT_AVAILABLE");
  }

  if (product.type === "VARIABLE") {
    if (!variantId) throw new AppError(MESSAGES.INVALID_PRODUCT_VARIANT, HTTP_STATUS.BAD_REQUEST, "VARIANT_REQUIRED");
    const variant = product.variants.find(({ id }) => id === variantId);
    if (!variant || !variant.isActive) {
      throw new AppError(MESSAGES.VARIANT_NOT_AVAILABLE, HTTP_STATUS.UNPROCESSABLE_ENTITY, "VARIANT_NOT_AVAILABLE");
    }
  } else if (variantId && variantId !== productId) {
    throw new AppError(MESSAGES.INVALID_PRODUCT_VARIANT, HTTP_STATUS.BAD_REQUEST, "INVALID_PRODUCT_VARIANT");
  }
}

export async function getCart(userId) {
  return getOrCreateCart(userId);
}

export async function addItem(userId, { productId, variantId = null, quantity = 1 }) {
  const cleanVariantId = (variantId && variantId !== productId) ? variantId : null;
  await validateItem(productId, cleanVariantId);
  return prisma.$transaction(async (tx) => {
    const cart = await getOrCreateCart(userId, tx);
    const existing = await tx.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId: cleanVariantId } });
    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (existing) {
      await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
    } else {
      await tx.cartItem.create({ data: { cartId: cart.id, productId, variantId: cleanVariantId, quantity } });
    }
    return tx.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
  });
}

async function getOwnedItem(userId, itemId) {
  const item = await prisma.cartItem.findFirst({
    where: {
      cart: { userId },
      OR: [
        { id: itemId },
        { productId: itemId },
        { variantId: itemId }
      ]
    }
  });
  if (!item) throw new AppError(MESSAGES.CART_ITEM_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "CART_ITEM_NOT_FOUND");
  return item;
}

export async function updateItem(userId, itemId, quantity) {
  const item = await getOwnedItem(userId, itemId);
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return getCart(userId);
  }
  const cleanVariantId = (item.variantId && item.variantId !== item.productId) ? item.variantId : null;
  await validateItem(item.productId, cleanVariantId);
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  return getCart(userId);
}

export async function removeItem(userId, itemId) {
  const item = await getOwnedItem(userId, itemId);
  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(userId);
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
}
