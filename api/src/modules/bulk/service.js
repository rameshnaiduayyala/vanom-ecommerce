import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { getPagination } from "../../common/utils/pagination.js";
import { assert, assertApproved, selectTier } from "./validator.js";
import { slugify } from "../../common/utils/slug.js";

const productInclude = { images: { orderBy: { sortOrder: "asc" } }, countryPrices: { include: { tiers: { orderBy: { minQuantity: "asc" } } } }, variants: { include: { countryPrices: { include: { tiers: { orderBy: { minQuantity: "asc" } } } } } } };
const orderInclude = { items: true, business: { select: { id: true, businessName: true, businessEmail: true } } };
async function businessByUser(userId) { return prisma.bulkBusiness.findFirst({ where: { userId } }); }
async function userEmail(userId) { const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }); return user?.email; }
async function findOrCreateCart(businessId) { return prisma.bulkCart.upsert({ where: { businessId }, create: { businessId }, update: {}, include: { items: { include: { product: true, variant: true } } } }); }

const fail = (message, code = "BULK_NOT_FOUND", status = HTTP_STATUS.NOT_FOUND) => { throw new AppError(message, status, code); };
const money = (value) => Number(value ?? 0);

export async function getBusinessForUser(userId, { approved = false } = {}) {
  let business = await businessByUser(userId);
  if (!business) {
    const email = await userEmail(userId);
    if (email) business = await prisma.bulkBusiness.findUnique({ where: { businessEmail: email } });
  }
  if (approved) assertApproved(business);
  return business;
}

export async function registerBusiness(input, userId) {
  const data = { ...input, businessEmail: input.businessEmail.trim().toLowerCase(), ...(userId ? { userId } : {}) };
  const business = await prisma.bulkBusiness.create({ data });
  return business;
}

export async function getMyBusiness(userId) { return getBusinessForUser(userId); }

export async function updateMyBusiness(userId, input) {
  const current = await getBusinessForUser(userId);
  if (!current) fail("Bulk business not found");
  return prisma.bulkBusiness.update({ where: { id: current.id }, data: input });
}

export async function listBusinesses(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const where = { ...(query.status ? { status: query.status } : {}), ...(query.search ? { OR: [{ businessName: { contains: query.search, mode: "insensitive" } }, { businessEmail: { contains: query.search, mode: "insensitive" } }] } : {}), ...(query.countryCode ? { countryCode: query.countryCode } : {}), ...(query.from || query.to ? { createdAt: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } } : {}) };
  const [items, total] = await prisma.$transaction([prisma.bulkBusiness.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { user: true, addresses: true } }), prisma.bulkBusiness.count({ where })]);
  return { items, total, page, limit };
}

export async function getBusiness(id) { const item = await prisma.bulkBusiness.findUnique({ where: { id }, include: { user: true, addresses: true } }); return item ?? fail("Bulk business not found"); }
export async function updateBusiness(id, input) {
  await getBusiness(id);
  return prisma.bulkBusiness.update({
    where: { id },
    data: {
      ...(input.businessName && { businessName: input.businessName }),
      ...(input.businessEmail && { businessEmail: input.businessEmail.trim().toLowerCase() }),
      ...(input.businessPhone && { businessPhone: input.businessPhone }),
      ...(input.taxRegistrationNumber !== undefined && { taxRegistrationNumber: input.taxRegistrationNumber }),
      ...(input.registrationNumber !== undefined && { registrationNumber: input.registrationNumber }),
      ...(input.countryCode && { countryCode: input.countryCode.toUpperCase() }),
      ...(input.address && { address: input.address }),
      ...(input.contactPersonName && { contactPersonName: input.contactPersonName }),
      ...(input.status && { status: input.status }),
      ...(input.userId !== undefined && { userId: input.userId })
    },
    include: { user: true, addresses: true }
  });
}
export async function deleteBusiness(id) {
  await getBusiness(id);
  return prisma.bulkBusiness.delete({ where: { id } });
}
export async function changeBusinessStatus(id, status, approvedBy, rejectionReason) {
  await getBusiness(id);
  return prisma.bulkBusiness.update({ where: { id }, data: { status, approvedBy: status === "APPROVED" ? approvedBy : null, approvedAt: status === "APPROVED" ? new Date() : null, rejectionReason: status === "REJECTED" ? rejectionReason : null }, include: { user: true, addresses: true } });
}

function tierCreate(tiers) { return { create: tiers.map((t) => ({ minQuantity: t.minQuantity, maxQuantity: t.maxQuantity ?? null, price: t.price })) }; }
function priceCreate(price) { return { countryCode: price.countryCode.toUpperCase(), currencyCode: price.currencyCode.toUpperCase(), moq: price.moq, stock: price.stock ?? 0, isAvailable: price.isAvailable ?? true, tiers: tierCreate(price.tiers) }; }
function variantCreate(variant) { return { name: variant.name ?? null, sku: variant.sku, attributes: variant.attributes ?? null, isActive: variant.isActive ?? true, ...(variant.countryPrices ? { countryPrices: { create: variant.countryPrices.map(priceCreate) } } : {}) }; }
function productData(input) { return { name: input.name, slug: input.slug ?? slugify(input.name), sku: input.sku ?? null, description: input.description ?? null, category: input.category ?? null, brand: input.brand ?? null, type: input.type ?? "SIMPLE", isActive: input.isActive ?? true, ...(input.images ? { images: { create: input.images } } : {}), ...(input.countryPrices ? { countryPrices: { create: input.countryPrices.map(priceCreate) } } : {}), ...(input.variants ? { variants: { create: input.variants.map(variantCreate) } } : {}) }; }
function serializeProduct(product) { return product; }

export async function createProduct(input) {
  assert(input.type !== "SIMPLE" || !input.variants?.length, "Simple bulk products cannot have variants", "INVALID_BULK_PRODUCT_VARIANTS");
  assert(input.type !== "VARIABLE" || input.variants?.length, "Variable bulk products require variants", "VARIABLE_BULK_PRODUCT_REQUIRES_VARIANTS");
  return serializeProduct(await prisma.bulkProduct.create({ data: productData(input), include: productInclude }));
}
export async function listProducts(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const where = { deletedAt: null, ...(query.isActive === undefined ? { isActive: true } : { isActive: query.isActive }), ...(query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { sku: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }] } : {}), ...(query.type ? { type: query.type } : {}), ...(query.countryCode ? { countryPrices: { some: { countryCode: query.countryCode.toUpperCase(), isAvailable: true } } } : {}) };
  const [items, total] = await prisma.$transaction([prisma.bulkProduct.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: productInclude }), prisma.bulkProduct.count({ where })]);
  return { items: items.map(serializeProduct), total, page, limit };
}
export async function getProduct(id) { const item = await prisma.bulkProduct.findFirst({ where: { id, deletedAt: null }, include: productInclude }); return item ?? fail("Bulk product not found", "BULK_PRODUCT_NOT_FOUND"); }
export async function updateProduct(id, input) {
  await getProduct(id);
  const data = { ...input }; delete data.images; delete data.countryPrices; delete data.variants;
  if (input.slug === undefined && input.name) data.slug = slugify(input.name);
  if (input.images) data.images = { deleteMany: {}, create: input.images };
  if (input.countryPrices) data.countryPrices = { deleteMany: {}, create: input.countryPrices.map(priceCreate) };
  if (input.variants) data.variants = { deleteMany: {}, create: input.variants.map(variantCreate) };
  return prisma.bulkProduct.update({ where: { id }, data, include: productInclude });
}
export async function deleteProduct(id) { await getProduct(id); return prisma.bulkProduct.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } }); }

async function resolvePrice(productId, variantId, countryCode, quantity) {
  const product = await prisma.bulkProduct.findFirst({ where: { id: productId, deletedAt: null, isActive: true }, include: productInclude });
  if (!product) fail("Bulk product not found", "BULK_PRODUCT_NOT_FOUND");
  let target = variantId ? product.variants.find((v) => v.id === variantId && v.isActive) : null;
  if (product.type === "VARIABLE" && !target) fail("Active product variant is required", "BULK_VARIANT_REQUIRED", HTTP_STATUS.BAD_REQUEST);
  if (product.type === "SIMPLE" && variantId) fail("Simple bulk products cannot have variants", "INVALID_BULK_VARIANT", HTTP_STATUS.BAD_REQUEST);
  const prices = target ? target.countryPrices : product.countryPrices;
  const price = prices.find((p) => p.countryCode.toUpperCase() === countryCode.toUpperCase() && p.isAvailable);
  if (!price) fail("Product is not available in the requested country", "BULK_PRODUCT_UNAVAILABLE", HTTP_STATUS.BAD_REQUEST);
  assert(quantity >= price.moq, `Minimum order quantity is ${price.moq}`, "BULK_MOQ_NOT_MET");
  assert(quantity <= price.stock, "Insufficient bulk stock", "BULK_INSUFFICIENT_STOCK", HTTP_STATUS.BAD_REQUEST);
  const tier = selectTier(price.tiers, quantity);
  if (!tier) fail("No pricing tier applies to this quantity", "BULK_TIER_NOT_FOUND", HTTP_STATUS.BAD_REQUEST);
  return { product, variant: target, price, tier, unitPrice: money(tier.price), total: money(tier.price) * quantity };
}

export async function getCart(userId, countryCode) {
  const business = await getBusinessForUser(userId, { approved: true });
  const cart = await findOrCreateCart(business.id);
  const items = [];
  for (const item of cart.items) { const resolved = countryCode ? await resolvePrice(item.productId, item.variantId, countryCode, item.quantity) : null; items.push({ ...item, ...(resolved ? { unitPrice: resolved.unitPrice, total: resolved.total, currencyCode: resolved.price.currencyCode, tier: resolved.tier } : {}) }); }
  return { ...cart, items, subtotal: items.reduce((sum, i) => sum + money(i.total), 0) };
}
export async function addCartItem(userId, input) {
  const business = await getBusinessForUser(userId, { approved: true }); await resolvePrice(input.productId, input.variantId, input.countryCode, input.quantity);
  const cart = await findOrCreateCart(business.id);
  const existing = cart.items.find((i) => i.productId === input.productId && i.variantId === (input.variantId ?? null));
  const quantity = (existing?.quantity ?? 0) + input.quantity; await resolvePrice(input.productId, input.variantId, input.countryCode, quantity);
  const item = existing ? await prisma.bulkCartItem.update({ where: { id: existing.id }, data: { quantity } }) : await prisma.bulkCartItem.create({ data: { cartId: cart.id, productId: input.productId, variantId: input.variantId ?? null, quantity } });
  return getCart(userId, input.countryCode).then((c) => ({ ...c, item }));
}
export async function updateCartItem(userId, id, input) { const business = await getBusinessForUser(userId, { approved: true }); const item = await prisma.bulkCartItem.findFirst({ where: { id, cart: { businessId: business.id } } }); if (!item) fail("Bulk cart item not found", "BULK_CART_ITEM_NOT_FOUND"); await resolvePrice(item.productId, item.variantId, input.countryCode, input.quantity); await prisma.bulkCartItem.update({ where: { id }, data: { quantity: input.quantity } }); return getCart(userId, input.countryCode); }
export async function removeCartItem(userId, id) { const business = await getBusinessForUser(userId, { approved: true }); const item = await prisma.bulkCartItem.findFirst({ where: { id, cart: { businessId: business.id } } }); if (!item) fail("Bulk cart item not found", "BULK_CART_ITEM_NOT_FOUND"); await prisma.bulkCartItem.delete({ where: { id } }); return getCart(userId); }

export async function createOrder(userId, input) {
  const business = await getBusinessForUser(userId, { approved: true }); const cart = await prisma.bulkCart.findUnique({ where: { businessId: business.id }, include: { items: true } });
  if (!cart?.items.length) fail("Bulk cart is empty", "BULK_CART_EMPTY", HTTP_STATUS.BAD_REQUEST);
  const resolved = []; for (const item of cart.items) resolved.push({ item, ...(await resolvePrice(item.productId, item.variantId, input.countryCode, item.quantity)) });
  const subtotal = resolved.reduce((sum, r) => sum + r.total, 0); const discount = 0; const shippingCharges = Number(input.shippingCharges ?? 0); const tax = Number(input.tax ?? 0); const total = subtotal - discount + shippingCharges + tax;
  const order = await prisma.$transaction(async (tx) => {
    for (const r of resolved) { const where = r.variant ? { variantId: r.variant.id } : { productId: r.product.id }; const current = r.variant ? await tx.bulkVariantCountryPrice.findUnique({ where: { variantId_countryCode: { variantId: r.variant.id, countryCode: input.countryCode.toUpperCase() } } }) : await tx.bulkProductCountryPrice.findUnique({ where: { productId_countryCode: { productId: r.product.id, countryCode: input.countryCode.toUpperCase() } } }); if (!current || current.stock < r.item.quantity) fail("Stock changed; please review your cart", "BULK_STOCK_CHANGED", HTTP_STATUS.CONFLICT); await (r.variant ? tx.bulkVariantCountryPrice : tx.bulkProductCountryPrice).update({ where: r.variant ? { id: current.id } : { id: current.id }, data: { stock: { decrement: r.item.quantity } } }); }
    return tx.bulkOrder.create({ data: { orderNumber: `BULK-${Date.now()}-${Math.floor(Math.random() * 1000)}`, businessId: business.id, countryCode: input.countryCode.toUpperCase(), currencyCode: resolved[0].price.currencyCode, subtotal, discount, shippingCharges, tax, total, shippingAddress: input.shippingAddress, items: { create: resolved.map((r) => ({ productId: r.product.id, variantId: r.variant?.id ?? null, productName: r.product.name, sku: r.variant?.sku ?? r.product.sku, quantity: r.item.quantity, unitPrice: r.unitPrice, appliedTier: { minQuantity: r.tier.minQuantity, maxQuantity: r.tier.maxQuantity, price: r.unitPrice }, currencyCode: r.price.currencyCode, countryCode: input.countryCode.toUpperCase(), total: r.total })) } }, include: orderInclude });
  });
  await prisma.bulkCartItem.deleteMany({ where: { cartId: cart.id } }); return order;
}
export async function listOrders(userId, query = {}, admin = false) { const business = admin ? null : await getBusinessForUser(userId, { approved: true }); const { page, limit, skip } = getPagination(query); const where = { ...(business ? { businessId: business.id } : {}), ...(query.status ? { status: query.status } : {}), ...(query.countryCode ? { countryCode: query.countryCode.toUpperCase() } : {}), ...(query.search ? { OR: [{ orderNumber: { contains: query.search, mode: "insensitive" } }, { business: { businessName: { contains: query.search, mode: "insensitive" } } }] } : {}) }; const [items, total] = await prisma.$transaction([prisma.bulkOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: orderInclude }), prisma.bulkOrder.count({ where })]); return { items, total, page, limit }; }
export async function getOrder(userId, id, admin = false) { const business = admin ? null : await getBusinessForUser(userId, { approved: true }); const order = await prisma.bulkOrder.findFirst({ where: { id, ...(business ? { businessId: business.id } : {}) }, include: orderInclude }); return order ?? fail("Bulk order not found", "BULK_ORDER_NOT_FOUND"); }
export async function updateOrderStatus(id, input) { await getOrder(null, id, true); return prisma.bulkOrder.update({ where: { id }, data: { ...(input.status ? { status: input.status } : {}), ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}), ...(input.shippingStatus ? { shippingStatus: input.shippingStatus } : {}) }, include: orderInclude }); }

export async function listAddresses(userId) { const b = await getBusinessForUser(userId, { approved: true }); return prisma.bulkAddress.findMany({ where: { businessId: b.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }); }
export async function createAddress(userId, input) { const b = await getBusinessForUser(userId, { approved: true }); return prisma.$transaction(async (tx) => { if (input.isDefault) await tx.bulkAddress.updateMany({ where: { businessId: b.id }, data: { isDefault: false } }); return tx.bulkAddress.create({ data: { ...input, businessId: b.id } }); }); }
