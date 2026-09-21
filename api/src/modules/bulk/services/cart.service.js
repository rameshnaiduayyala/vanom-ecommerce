import { prisma } from "../../../config/prisma.js";
import { getBusinessForUser, findOrCreateCart } from "../lib/business.repository.js";
import { resolvePrice } from "../lib/pricing.js";
import { money } from "../lib/money.js";
import { fail } from "../lib/errors.js";

export async function get(userId, countryCode) {
  const business = await getBusinessForUser(userId, { approved: true });
  const cart = await findOrCreateCart(business.id);
  const items = [];

  for (const item of cart.items) {
    const resolved = countryCode
      ? await resolvePrice(item.productId, item.variantId, countryCode, item.quantity)
      : null;

    items.push({
      ...item,
      ...(resolved
        ? {
            unitPrice: resolved.unitPrice,
            total: resolved.total,
            currencyCode: resolved.price.currencyCode,
            tier: resolved.tier
          }
        : {})
    });
  }

  return {
    ...cart,
    items,
    subtotal: items.reduce((sum, i) => sum + money(i.total), 0)
  };
}

export async function add(userId, input) {
  const business = await getBusinessForUser(userId, { approved: true });

  // Validate individual item price first
  await resolvePrice(input.productId, input.variantId, input.countryCode, input.quantity);

  const cart = await findOrCreateCart(business.id);
  const existing = cart.items.find(
    (i) => i.productId === input.productId && i.variantId === (input.variantId ?? null)
  );

  // Validate combined quantity against MOQ / stock
  const quantity = (existing?.quantity ?? 0) + input.quantity;
  await resolvePrice(input.productId, input.variantId, input.countryCode, quantity);

  const item = existing
    ? await prisma.bulkCartItem.update({ where: { id: existing.id }, data: { quantity } })
    : await prisma.bulkCartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          variantId: input.variantId ?? null,
          quantity
        }
      });

  const updatedCart = await get(userId, input.countryCode);
  return { ...updatedCart, item };
}

export async function update(userId, id, input) {
  const business = await getBusinessForUser(userId, { approved: true });
  const item = await prisma.bulkCartItem.findFirst({
    where: { id, cart: { businessId: business.id } }
  });

  if (!item) fail("Bulk cart item not found", "BULK_CART_ITEM_NOT_FOUND");

  await resolvePrice(item.productId, item.variantId, input.countryCode, input.quantity);
  await prisma.bulkCartItem.update({ where: { id }, data: { quantity: input.quantity } });

  return get(userId, input.countryCode);
}

export async function remove(userId, id) {
  const business = await getBusinessForUser(userId, { approved: true });
  const item = await prisma.bulkCartItem.findFirst({
    where: { id, cart: { businessId: business.id } }
  });

  if (!item) fail("Bulk cart item not found", "BULK_CART_ITEM_NOT_FOUND");

  await prisma.bulkCartItem.delete({ where: { id } });
  return get(userId);
}
