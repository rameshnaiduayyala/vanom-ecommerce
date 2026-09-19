import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

const orderInclude = {
  items: { include: { product: true, variant: true } },
  addresses: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } }
};

export async function createOrder(userId, { countryId, currencyCode, shippingAddress, billingAddress }) {
  if (!shippingAddress) {
    throw new AppError(MESSAGES.SHIPPING_ADDRESS_REQUIRED, HTTP_STATUS.BAD_REQUEST, "SHIPPING_ADDRESS_REQUIRED");
  }

  const billing = billingAddress ?? shippingAddress;
  const addressData = (address, type) => ({
    type,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? null,
    city: address.city,
    state: address.state ?? null,
    postalCode: address.postalCode,
    countryCode: address.countryCode
  });

  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: { include: { countries: true } }, variant: { include: { countries: true } } } } }
    });
    if (!cart?.items.length) throw new AppError(MESSAGES.CART_EMPTY, HTTP_STATUS.UNPROCESSABLE_ENTITY, "CART_EMPTY");

    let subtotal = new Prisma.Decimal(0);
    const items = [];

    for (const item of cart.items) {
      const source = item.variant ?? item.product;
      const countryPrice = source.countries.find(({ countryId: id, isAvailable }) => id === countryId && isAvailable);
      if (!countryPrice || countryPrice.price === null) {
        throw new AppError(MESSAGES.PRICE_NOT_AVAILABLE, HTTP_STATUS.UNPROCESSABLE_ENTITY, "PRICE_NOT_AVAILABLE");
      }

      const stockUpdated = item.variant
        ? await tx.productVariantCountry.updateMany({ where: { variantId: item.variant.id, countryId, stock: { gte: item.quantity }, isAvailable: true }, data: { stock: { decrement: item.quantity } } })
        : await tx.productCountry.updateMany({ where: { productId: item.product.id, countryId, stock: { gte: item.quantity }, isAvailable: true }, data: { stock: { decrement: item.quantity } } });
      if (stockUpdated.count !== 1) {
        throw new AppError(MESSAGES.INSUFFICIENT_STOCK, HTTP_STATUS.UNPROCESSABLE_ENTITY, "INSUFFICIENT_STOCK");
      }

      const unitPrice = new Prisma.Decimal(countryPrice.price);
      const total = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(total);
      items.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        sku: item.variant?.sku ?? item.product.sku,
        quantity: item.quantity,
        unitPrice,
        total
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        currencyCode,
        subtotal,
        total: subtotal,
        items: { create: items },
        addresses: {
          create: [addressData(shippingAddress, "SHIPPING"), addressData(billing, "BILLING")]
        }
      },
      include: orderInclude
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });
}

export async function listOrders({ userId, page, limit, skip, status }) {
  const where = { ...(userId ? { userId } : {}), ...(status ? { status } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: orderInclude }),
    prisma.order.count({ where })
  ]);
  return { items, total };
}

export async function getOrderById(id, userId = null) {
  const order = await prisma.order.findFirst({ where: { id, ...(userId ? { userId } : {}) }, include: orderInclude });
  if (!order) throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  return order;
}

export async function updateStatus(id, status) {
  await getOrderById(id);
  return prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
}

export async function deleteOrder(id) {
  await getOrderById(id);
  return prisma.order.delete({ where: { id } });
}
