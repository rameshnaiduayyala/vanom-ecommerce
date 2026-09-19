import * as service from "../services/admin.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { getPaginationMeta } from "../../../common/utils/pagination.js";
const paged = (reply, result, message) => sendSuccess(reply, { message, data: result.items, meta: getPaginationMeta(result.page, result.limit, result.total) });
export async function listBusinesses(request, reply) { return paged(reply, await service.listBusinesses(request.query), "Bulk businesses fetched"); }
export async function getBusiness(request, reply) { return sendSuccess(reply, { message: "Bulk business fetched", data: await service.getBusiness(request.params.id) }); }
export async function approveBusiness(request, reply) { return sendSuccess(reply, { message: "Bulk business approved", data: await service.approveBusiness(request.params.id, request.user.sub) }); }
export async function rejectBusiness(request, reply) { return sendSuccess(reply, { message: "Bulk business rejected", data: await service.rejectBusiness(request.params.id, request.user.sub, request.body.rejectionReason) }); }
export async function suspendBusiness(request, reply) { return sendSuccess(reply, { message: "Bulk business suspended", data: await service.suspendBusiness(request.params.id, request.user.sub) }); }
export async function listOrders(request, reply) { return paged(reply, await service.listOrders(request.user.sub, request.query), "Bulk orders fetched"); }
export async function getOrder(request, reply) { return sendSuccess(reply, { message: "Bulk order fetched", data: await service.getOrder(request.user.sub, request.params.id) }); }
export async function updateOrderStatus(request, reply) { return sendSuccess(reply, { message: "Bulk order updated", data: await service.updateOrderStatus(request.params.id, request.body) }); }
