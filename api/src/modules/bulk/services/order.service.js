import { prisma } from "../../../config/prisma.js";
import { getPagination } from "../../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
import { getBusinessForUser } from "../lib/business.repository.js";
import { resolvePrice } from "../lib/pricing.js";
import { money } from "../lib/money.js";
import { orderInclude } from "../lib/db-includes.js";
import { fail } from "../lib/errors.js";

/** Generates a unique bulk order number based on timestamp + random suffix. */
function generateOrderNumber() {
  return `BULK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function create(userId, input) {
  const business = await getBusinessForUser(userId, { approved: true });

  // Resolve line items — from explicit input or from the business cart
  let orderItems = [];
  if (Array.isArray(input.items) && input.items.length > 0) {
    orderItems = input.items;
  } else {
    const cart = await prisma.bulkCart.findUnique({
      where: { businessId: business.id },
      include: { items: true }
    });
    if (!cart?.items.length) {
      fail("Bulk cart or order items is empty", "BULK_CART_EMPTY", HTTP_STATUS.BAD_REQUEST);
    }
    orderItems = cart.items;
  }

  // Resolve pricing for every line item
  const resolved = [];
  for (const item of orderItems) {
    resolved.push({
      item,
      ...(await resolvePrice(item.productId, item.variantId, input.countryCode, item.quantity))
    });
  }

  // Calculate totals
  const subtotal = resolved.reduce((sum, r) => sum + r.total, 0);
  const discount = 0;
  const shippingCharges = money(input.shippingCharges);
  const tax = money(input.tax);
  const total = subtotal - discount + shippingCharges + tax;

  const order = await prisma.$transaction(async (tx) => {
    // Verify and decrement stock inside a serialised transaction
    for (const r of resolved) {
      const countryCode = input.countryCode.toUpperCase();

      const current = r.variant
        ? await tx.bulkVariantCountryPrice.findUnique({
            where: { variantId_countryCode: { variantId: r.variant.id, countryCode } }
          })
        : await tx.bulkProductCountryPrice.findUnique({
            where: { productId_countryCode: { productId: r.product.id, countryCode } }
          });

      if (!current || current.stock < r.item.quantity) {
        fail("Stock changed; please review your cart", "BULK_STOCK_CHANGED", HTTP_STATUS.CONFLICT);
      }

      await (r.variant
        ? tx.bulkVariantCountryPrice
        : tx.bulkProductCountryPrice
      ).update({
        where: { id: current.id },
        data: { stock: { decrement: r.item.quantity } }
      });
    }

    const shippingAddress = input.shippingAddress || {
      contactName: business.contactPersonName || business.businessName || "Bulk Procurement",
      phone: business.businessPhone || "+1-000-000-0000",
      addressLine1: business.address || "Corporate Office HQ",
      city: "Commercial Hub",
      postalCode: "00000",
      countryCode: input.countryCode.toUpperCase()
    };

    return tx.bulkOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        businessId: business.id,
        countryCode: input.countryCode.toUpperCase(),
        currencyCode: resolved[0].price.currencyCode,
        subtotal,
        discount,
        shippingCharges,
        tax,
        total,
        shippingAddress,
        items: {
          create: resolved.map((r) => ({
            productId: r.product.id,
            variantId: r.variant?.id ?? null,
            productName: r.product.name,
            sku: r.variant?.sku ?? r.product.sku,
            quantity: r.item.quantity,
            unitPrice: r.unitPrice,
            appliedTier: {
              minQuantity: r.tier.minQuantity,
              maxQuantity: r.tier.maxQuantity,
              price: r.unitPrice
            },
            currencyCode: r.price.currencyCode,
            countryCode: input.countryCode.toUpperCase(),
            total: r.total
          }))
        }
      },
      include: orderInclude
    });
  });

  // Non-fatal cart cleanup after successful checkout
  try {
    const existingCart = await prisma.bulkCart.findUnique({
      where: { businessId: business.id }
    });
    if (existingCart?.id) {
      await prisma.bulkCartItem.deleteMany({ where: { cartId: existingCart.id } });
    }
  } catch {
    // Cart cleanup is best-effort — do not fail the order
  }

  return order;
}

export async function list(userId, query = {}, admin = false) {
  const business = admin ? null : await getBusinessForUser(userId, { approved: true });
  const { page, limit, skip } = getPagination(query);

  const where = {
    ...(business ? { businessId: business.id } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.countryCode ? { countryCode: query.countryCode.toUpperCase() } : {}),
    ...(query.search
      ? {
          OR: [
            { orderNumber: { contains: query.search, mode: "insensitive" } },
            { business: { businessName: { contains: query.search, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.bulkOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: orderInclude
    }),
    prisma.bulkOrder.count({ where })
  ]);

  return { items, total, page, limit };
}

export async function getById(userId, id, admin = false) {
  const business = admin ? null : await getBusinessForUser(userId, { approved: true });
  const order = await prisma.bulkOrder.findFirst({
    where: { id, ...(business ? { businessId: business.id } : {}) },
    include: orderInclude
  });
  return order ?? fail("Bulk order not found", "BULK_ORDER_NOT_FOUND");
}
