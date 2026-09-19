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

export async function createOrder(userId, { countryId, currencyCode, shippingAddress, billingAddress, items: directItems }) {
  if (!shippingAddress) {
    throw new AppError(MESSAGES.SHIPPING_ADDRESS_REQUIRED, HTTP_STATUS.BAD_REQUEST, "SHIPPING_ADDRESS_REQUIRED");
  }

  // Resolve country by ID or code
  const targetCountry = await prisma.country.findFirst({
    where: {
      OR: [
        { id: countryId },
        { code: countryId?.toUpperCase?.() || "" },
        ...(shippingAddress.countryCode ? [{ code: shippingAddress.countryCode.toUpperCase() }] : [])
      ]
    }
  });

  const resolvedCountryId = targetCountry?.id || countryId;
  const resolvedCurrencyCode = currencyCode || (targetCountry?.code === "IN" ? "INR" : targetCountry?.code === "CA" ? "CAD" : "USD");

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
    countryCode: address.countryCode || targetCountry?.code || "US"
  });

  return prisma.$transaction(async (tx) => {
    let cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: { include: { countries: true } }, variant: { include: { countries: true } } } }
      }
    });

    // If server-side cart is empty but client passed items in the request, automatically populate cart items
    if ((!cart || !cart.items.length) && Array.isArray(directItems) && directItems.length > 0) {
      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }
      for (const it of directItems) {
        const pId = it.productId || it.id;
        const vId = it.variantId || null;
        const qty = Number(it.quantity) || 1;
        if (pId) {
          // Verify product existence
          const prod = await tx.product.findUnique({ where: { id: pId } });
          if (prod) {
            await tx.cartItem.create({
              data: {
                cartId: cart.id,
                productId: prod.id,
                variantId: vId,
                quantity: qty,
              }
            });
          }
        }
      }

      // Re-fetch populated cart
      cart = await tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: { include: { product: { include: { countries: true } }, variant: { include: { countries: true } } } }
        }
      });
    }

    if (!cart?.items.length) throw new AppError(MESSAGES.CART_EMPTY, HTTP_STATUS.UNPROCESSABLE_ENTITY, "CART_EMPTY");

    let subtotal = new Prisma.Decimal(0);
    const items = [];

    for (const item of cart.items) {
      const source = item.variant ?? item.product;
      const countryPrice = source.countries.find(({ countryId: id, isAvailable }) => (id === resolvedCountryId || id === countryId) && isAvailable) || source.countries.find(({ isAvailable }) => isAvailable);
      if (!countryPrice || countryPrice.price === null) {
        throw new AppError(MESSAGES.PRICE_NOT_AVAILABLE, HTTP_STATUS.UNPROCESSABLE_ENTITY, "PRICE_NOT_AVAILABLE");
      }

      const effectiveCountryId = countryPrice.countryId;

      const stockUpdated = item.variant
        ? await tx.productVariantCountry.updateMany({ where: { variantId: item.variant.id, countryId: effectiveCountryId, stock: { gte: item.quantity }, isAvailable: true }, data: { stock: { decrement: item.quantity } } })
        : await tx.productCountry.updateMany({ where: { productId: item.product.id, countryId: effectiveCountryId, stock: { gte: item.quantity }, isAvailable: true }, data: { stock: { decrement: item.quantity } } });
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
        currencyCode: resolvedCurrencyCode,
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
