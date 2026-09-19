import * as service from "../services/order.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { getPaginationMeta } from "../../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
export async function create(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: "Bulk order created", data: await service.create(request.user.sub, request.body) }); }
export async function list(request, reply) { const result = await service.list(request.user.sub, request.query); return sendSuccess(reply, { message: "Bulk orders fetched", data: result.items, meta: getPaginationMeta(result.page, result.limit, result.total) }); }
export async function getById(request, reply) { return sendSuccess(reply, { message: "Bulk order fetched", data: await service.getById(request.user.sub, request.params.id) }); }
