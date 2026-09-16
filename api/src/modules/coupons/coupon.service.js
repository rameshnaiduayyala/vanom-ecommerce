import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

function normalizeCode(value) { return value.trim().toUpperCase(); }
function date(value) { return value === null ? null : value === undefined ? undefined : new Date(value); }
function handleError(error) { if (error.code === "P2002") throw new AppError(MESSAGES.COUPON_CODE_EXISTS, HTTP_STATUS.CONFLICT, "COUPON_CODE_EXISTS"); throw error; }

export async function createCoupon(input) {
  try { return await prisma.coupon.create({ data: { code: normalizeCode(input.code), type: input.type, value: input.value, minOrder: input.minOrder ?? null, maxDiscount: input.maxDiscount ?? null, usageLimit: input.usageLimit ?? null, startsAt: date(input.startsAt) ?? null, expiresAt: date(input.expiresAt) ?? null, isActive: input.isActive ?? true } }); }
  catch (error) { handleError(error); }
}
export async function listCoupons({ page, limit, skip, search, isActive, type }) {
  const where = { ...(search ? { code: { contains: search, mode: "insensitive" } } : {}), ...(isActive !== undefined ? { isActive } : {}), ...(type ? { type } : {}) };
  const [items, total] = await prisma.$transaction([prisma.coupon.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }), prisma.coupon.count({ where })]);
  return { items, total };
}
export async function getCouponById(id) { const coupon = await prisma.coupon.findUnique({ where: { id } }); if (!coupon) throw new AppError(MESSAGES.COUPON_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "COUPON_NOT_FOUND"); return coupon; }
export async function updateCoupon(id, input) { await getCouponById(id); try { return await prisma.coupon.update({ where: { id }, data: { ...(input.code !== undefined && { code: normalizeCode(input.code) }), ...(input.type !== undefined && { type: input.type }), ...(input.value !== undefined && { value: input.value }), ...(input.minOrder !== undefined && { minOrder: input.minOrder }), ...(input.maxDiscount !== undefined && { maxDiscount: input.maxDiscount }), ...(input.usageLimit !== undefined && { usageLimit: input.usageLimit }), ...(input.startsAt !== undefined && { startsAt: date(input.startsAt) }), ...(input.expiresAt !== undefined && { expiresAt: date(input.expiresAt) }), ...(input.isActive !== undefined && { isActive: input.isActive }) } }); } catch (error) { handleError(error); } }
export async function deleteCoupon(id) { await getCouponById(id); return prisma.coupon.delete({ where: { id } }); }
