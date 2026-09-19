import { prisma } from "../../../config/prisma.js";
import { getBusinessForUser, findOrCreateCart, resolvePrice, fail, money } from "./bulk.helper.js";

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
      ...(resolved ? {
        unitPrice: resolved.unitPrice,
        total: resolved.total,
        currencyCode: resolved.price.currencyCode,
        tier: resolved.tier
      } : {})
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
  await resolvePrice(input.productId, input.variantId, input.countryCode, input.quantity);
  const cart = await findOrCreateCart(business.id);

  const existing = cart.items.find(
    (i) => i.productId === input.productId && i.variantId === (input.variantId ?? null)
  );

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

  return get(userId, input.countryCode).then((c) => ({ ...c, item }));
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
