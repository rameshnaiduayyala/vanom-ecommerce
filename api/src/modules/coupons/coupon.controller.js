import * as service from "./coupon.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function create(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.COUPON_CREATED, data: await service.createCoupon(request.body) }); }
export async function list(request, reply) { const pagination = getPagination(request.query); const result = await service.listCoupons({ ...pagination, search: request.query.search, isActive: request.query.isActive, type: request.query.type }); return sendSuccess(reply, { message: MESSAGES.COUPONS_FETCHED, data: result.items, meta: getPaginationMeta(pagination.page, pagination.limit, result.total) }); }
export async function getById(request, reply) { return sendSuccess(reply, { message: MESSAGES.COUPON_FETCHED, data: await service.getCouponById(request.params.id) }); }
export async function update(request, reply) { return sendSuccess(reply, { message: MESSAGES.COUPON_UPDATED, data: await service.updateCoupon(request.params.id, request.body) }); }
export async function remove(request, reply) { await service.deleteCoupon(request.params.id); return sendSuccess(reply, { message: MESSAGES.COUPON_DELETED, data: null }); }
