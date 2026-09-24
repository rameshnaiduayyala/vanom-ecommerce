import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

const orderInclude = {
  items: {
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
  },
  addresses: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  invoices: true
};

function formatOrder(order) {
  if (!order) return order;
  const orderNumber = order.invoices?.[0]?.invoiceNumber 
    ? `ORD-${order.invoices[0].invoiceNumber.replace(/^INV-/, "")}`
    : `ORD-${order.id.slice(0, 8).toUpperCase()}`;
  return {
    ...order,
    orderNumber
  };
}

export async function createOrder(userId, {
  countryId,
  currencyCode,
  shippingAddress,
  billingAddress,
  items: directItems,
  shippingCharges = 0,
  tax = 0,
  discount = 0
}) {
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

  const result = await prisma.$transaction(async (tx) => {
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
        if (!pId) continue;
        const existing = await tx.cartItem.findFirst({ where: { cartId: cart.id, productId: pId, variantId: vId } });
        if (existing) {
          await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + (it.quantity || 1) } });
        } else {
          await tx.cartItem.create({ data: { cartId: cart.id, productId: pId, variantId: vId, quantity: it.quantity || 1 } });
        }
      }
      cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: { include: { product: { include: { countries: true } }, variant: { include: { countries: true } } } }
        }
      });
    }

    if (!cart || !cart.items.length) {
      throw new AppError(MESSAGES.CART_EMPTY, HTTP_STATUS.BAD_REQUEST, "CART_EMPTY");
    }

    let subtotal = new Prisma.Decimal(0);
    const items = [];

    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;

      // Price resolution priority:
      // 1. Variant country pricing (for variable products in target country)
      // 2. Product country pricing (for simple products in target country)
      // 3. Fallback to product basePrice
      let unitPrice = null;

      if (variant) {
        const variantCountry = await tx.productVariantCountry.findUnique({
          where: { variantId_countryId: { variantId: variant.id, countryId: resolvedCountryId } }
        });
        if (variantCountry?.isAvailable && variantCountry?.price !== null) {
          unitPrice = variantCountry.price;
        }
      }

      if (unitPrice === null) {
        const productCountry = await tx.productCountry.findUnique({
          where: { productId_countryId: { productId: product.id, countryId: resolvedCountryId } }
        });
        if (productCountry?.isAvailable && productCountry?.price !== null) {
          unitPrice = productCountry.price;
        }
      }

      if (unitPrice === null) {
        unitPrice = product.basePrice || new Prisma.Decimal(0);
      }

      const itemTotal = new Prisma.Decimal(unitPrice).mul(item.quantity);
      subtotal = subtotal.add(itemTotal);

      const productName = variant?.name
        ? `${product?.name || "Product"} - ${variant.name}`
        : product?.name || "Product";
      const sku = variant?.sku || product?.sku || null;

      items.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        productName,
        sku,
        unitPrice,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    const numDiscount = new Prisma.Decimal(discount || 0);
    const numShipping = new Prisma.Decimal(shippingCharges || 0);
    const numTax = new Prisma.Decimal(tax || 0);
    const total = subtotal.sub(numDiscount).add(numShipping).add(numTax);

    const order = await tx.order.create({
      data: {
        userId,
        currencyCode: resolvedCurrencyCode,
        subtotal,
        discount: numDiscount,
        shippingCharges: numShipping,
        tax: numTax,
        total,
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

  try {
    const { issueInvoiceForOrder } = await import("../invoice/invoice.service.js");
    await issueInvoiceForOrder({ orderId: result.id });
  } catch (err) {
    console.warn("Auto-invoice generation on order creation deferred:", err.message);
  }

  return formatOrder(result);
}

export async function listOrders({ userId, page, limit, skip, status }) {
  const where = { ...(userId ? { userId } : {}), ...(status ? { status } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: orderInclude }),
    prisma.order.count({ where })
  ]);
  return { items: items.map(formatOrder), total };
}

export async function getOrderById(id, userId = null) {
  const order = await prisma.order.findFirst({ where: { id, ...(userId ? { userId } : {}) }, include: orderInclude });
  if (!order) throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND");
  return formatOrder(order);
}

export async function updateStatus(id, status) {
  await getOrderById(id);
  const updated = await prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
  return formatOrder(updated);
}

export async function deleteOrder(id) {
  await getOrderById(id);
  return prisma.order.delete({ where: { id } });
}
