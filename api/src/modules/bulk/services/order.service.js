import { prisma } from "../../../config/prisma.js";
import { getPagination } from "../../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
import { getBusinessForUser, resolvePrice, orderInclude, fail } from "./bulk.helper.js";

export async function create(userId, input) {
  const business = await getBusinessForUser(userId, { approved: true });
  const cart = await prisma.bulkCart.findUnique({
    where: { businessId: business.id },
    include: { items: true }
  });

  if (!cart?.items.length) {
    fail("Bulk cart is empty", "BULK_CART_EMPTY", HTTP_STATUS.BAD_REQUEST);
  }

  const resolved = [];
  for (const item of cart.items) {
    resolved.push({
      item,
      ...(await resolvePrice(item.productId, item.variantId, input.countryCode, item.quantity))
    });
  }

  const subtotal = resolved.reduce((sum, r) => sum + r.total, 0);
  const discount = 0;
  const shippingCharges = Number(input.shippingCharges ?? 0);
  const tax = Number(input.tax ?? 0);
  const total = subtotal - discount + shippingCharges + tax;

  const order = await prisma.$transaction(async (tx) => {
    for (const r of resolved) {
      const current = r.variant
        ? await tx.bulkVariantCountryPrice.findUnique({
            where: {
              variantId_countryCode: {
                variantId: r.variant.id,
                countryCode: input.countryCode.toUpperCase()
              }
            }
          })
        : await tx.bulkProductCountryPrice.findUnique({
            where: {
              productId_countryCode: {
                productId: r.product.id,
                countryCode: input.countryCode.toUpperCase()
              }
            }
          });

      if (!current || current.stock < r.item.quantity) {
        fail("Stock changed; please review your cart", "BULK_STOCK_CHANGED", HTTP_STATUS.CONFLICT);
      }

      await (r.variant ? tx.bulkVariantCountryPrice : tx.bulkProductCountryPrice).update({
        where: { id: current.id },
        data: { stock: { decrement: r.item.quantity } }
      });
    }

    return tx.bulkOrder.create({
      data: {
        orderNumber: `BULK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId: business.id,
        countryCode: input.countryCode.toUpperCase(),
        currencyCode: resolved[0].price.currencyCode,
        subtotal,
        discount,
        shippingCharges,
        tax,
        total,
        shippingAddress: input.shippingAddress,
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

  await prisma.bulkCartItem.deleteMany({ where: { cartId: cart.id } });
  return order;
}

export async function list(userId, query = {}, admin = false) {
  const business = admin ? null : await getBusinessForUser(userId, { approved: true });
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...(business ? { businessId: business.id } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.countryCode ? { countryCode: query.countryCode.toUpperCase() } : {}),
    ...(query.search ? {
      OR: [
        { orderNumber: { contains: query.search, mode: "insensitive" } },
        { business: { businessName: { contains: query.search, mode: "insensitive" } } }
      ]
    } : {})
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
