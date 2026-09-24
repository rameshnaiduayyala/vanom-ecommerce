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

function formatCart(cart) {
  if (!cart) return null;
  const items = (cart.items || []).map((item) => {
    const product = item.product;
    const variant = item.variant;
    const name = variant?.name
      ? `${product?.name || ""} - ${variant.name}`
      : product?.name || "Product";
    const image = product?.images?.[0]?.url || null;
    const sku = variant?.sku || product?.sku || null;
    const price = Number(variant?.price || product?.basePrice || 0);

    return {
      ...item,
      name,
      productName: product?.name,
      variantName: variant?.name,
      slug: product?.slug,
      price,
      unitPrice: price,
      image,
      imageUrl: image,
      sku,
    };
  });

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price || 0) * (it.quantity || 1),
    0
  );
  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return {
    ...cart,
    items,
    subtotal,
    itemCount,
  };
}

export async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  return formatCart(cart);
}

export async function addItem(userId, { productId, variantId = null, quantity = 1 }) {
  let targetProductId = productId;
  let targetVariantId = variantId;

  if (!targetProductId && targetVariantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: targetVariantId } });
    if (variant) {
      targetProductId = variant.productId;
    }
  } else if (targetProductId) {
    const isVariant = await prisma.productVariant.findUnique({ where: { id: targetProductId } });
    if (isVariant) {
      targetVariantId = isVariant.id;
      targetProductId = isVariant.productId;
    }
  }

  const cleanVariantId = (targetVariantId && targetVariantId !== targetProductId) ? targetVariantId : null;
  await validateItem(targetProductId, cleanVariantId);

  const cart = await prisma.$transaction(async (tx) => {
    const userCart = await getOrCreateCart(userId, tx);
    const existing = await tx.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: targetProductId,
        variantId: cleanVariantId
      }
    });
    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (existing) {
      await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: targetProductId,
          variantId: cleanVariantId,
          quantity: Math.max(1, quantity)
        }
      });
    }
    return tx.cart.findUnique({ where: { id: userCart.id }, include: cartInclude });
  });

  return formatCart(cart);
}

export async function updateItem(userId, itemId, quantity) {
  if (quantity <= 0) {
    return removeItem(userId, itemId);
  }

  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      OR: [
        { id: itemId },
        { productId: itemId },
        { variantId: itemId }
      ]
    }
  });

  if (!item) {
    // If not found in user's cart, try to find matching product or variant to add
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: itemId },
          { variants: { some: { id: itemId } } }
        ]
      },
      include: { variants: true }
    });

    if (product) {
      const isVariant = product.variants.some((v) => v.id === itemId);
      return addItem(userId, {
        productId: product.id,
        variantId: isVariant ? itemId : null,
        quantity,
      });
    }

    return getCart(userId);
  }

  const cleanVariantId = (item.variantId && item.variantId !== item.productId) ? item.variantId : null;
  await validateItem(item.productId, cleanVariantId);
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  return getCart(userId);
}

export async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      OR: [
        { id: itemId },
        { productId: itemId },
        { variantId: itemId }
      ]
    }
  });

  if (item) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  }
  return getCart(userId);
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
}
