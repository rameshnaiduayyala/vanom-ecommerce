import * as service from "../services/admin.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { getPaginationMeta } from "../../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";

function sendPaged(reply, result, message) {
  return sendSuccess(reply, {
    message,
    data: result.items,
    meta: getPaginationMeta(result.page, result.limit, result.total)
  });
}

// ─── Business CRUD ────────────────────────────────────────────────────────────

export async function listBusinesses(request, reply) {
  const result = await service.listBusinesses(request.query);
  return sendPaged(reply, result, "Bulk businesses fetched");
}

export async function getBusiness(request, reply) {
  const data = await service.getBusiness(request.params.id);
  return sendSuccess(reply, { message: "Bulk business fetched", data });
}

export async function createBusiness(request, reply) {
  const data = await service.createBusiness(request.body);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Bulk business created",
    data
  });
}

export async function updateBusiness(request, reply) {
  const data = await service.updateBusiness(request.params.id, request.body);
  return sendSuccess(reply, { message: "Bulk business updated", data });
}

export async function deleteBusiness(request, reply) {
  const data = await service.deleteBusiness(request.params.id);
  return sendSuccess(reply, { message: "Bulk business deleted", data });
}

// ─── Business Status Actions ──────────────────────────────────────────────────

export async function approveBusiness(request, reply) {
  const data = await service.approveBusiness(request.params.id, request.user.sub);
  return sendSuccess(reply, { message: "Bulk business approved", data });
}

export async function rejectBusiness(request, reply) {
  const data = await service.rejectBusiness(
    request.params.id,
    request.user.sub,
    request.body.rejectionReason
  );
  return sendSuccess(reply, { message: "Bulk business rejected", data });
}

export async function suspendBusiness(request, reply) {
  const data = await service.suspendBusiness(request.params.id, request.user.sub);
  return sendSuccess(reply, { message: "Bulk business suspended", data });
}

export async function lockBusiness(request, reply) {
  const data = await service.setBusinessLock(request.params.id, request.body?.isLocked !== false);
  return sendSuccess(reply, {
    message: `Bulk business ${request.body?.isLocked !== false ? "locked" : "unlocked"}`,
    data
  });
}

// ─── Order Management ─────────────────────────────────────────────────────────

export async function listOrders(request, reply) {
  const result = await service.listOrders(request.user.sub, request.query);
  return sendPaged(reply, result, "Bulk orders fetched");
}

export async function getOrder(request, reply) {
  const data = await service.getOrder(request.user.sub, request.params.id);
  return sendSuccess(reply, { message: "Bulk order fetched", data });
}

export async function updateOrderStatus(request, reply) {
  const data = await service.updateOrderStatus(request.params.id, request.body);
  return sendSuccess(reply, { message: "Bulk order updated", data });
}
