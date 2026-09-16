import * as service from "../services/product.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { getPaginationMeta } from "../../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
const paged = (reply, result) => sendSuccess(reply, { message: "Bulk products fetched", data: result.items, meta: getPaginationMeta(result.page, result.limit, result.total) });
export async function list(request, reply) { return paged(reply, await service.list(request.query)); }
export async function getById(request, reply) { return sendSuccess(reply, { message: "Bulk product fetched", data: await service.getById(request.params.id) }); }
export async function create(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: "Bulk product created", data: await service.create(request.body) }); }
export async function update(request, reply) { return sendSuccess(reply, { message: "Bulk product updated", data: await service.update(request.params.id, request.body) }); }
export async function remove(request, reply) { await service.remove(request.params.id); return sendSuccess(reply, { message: "Bulk product deleted", data: null }); }
