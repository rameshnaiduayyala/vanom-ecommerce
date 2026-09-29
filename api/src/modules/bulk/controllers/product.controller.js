import * as service from "../services/product.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { getPaginationMeta } from "../../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";

function sendPaged(reply, result) {
  return sendSuccess(reply, {
    message: "Bulk products fetched",
    data: result.items,
    meta: getPaginationMeta(result.page, result.limit, result.total)
  });
}

export async function list(request, reply) {
  const result = await service.list(request.query);
  return sendPaged(reply, result);
}

export async function getById(request, reply) {
  const data = await service.getById(request.params.id);
  return sendSuccess(reply, { message: "Bulk product fetched", data });
}

export async function create(request, reply) {
  const data = await service.create(request.body);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Bulk product created",
    data
  });
}

export async function update(request, reply) {
  const data = await service.update(request.params.id, request.body);
  return sendSuccess(reply, { message: "Bulk product updated", data });
}

export async function remove(request, reply) {
  await service.remove(request.params.id);
  return sendSuccess(reply, { message: "Bulk product deleted", data: null });
}
