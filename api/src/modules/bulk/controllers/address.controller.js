import * as service from "../services/address.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
export async function list(request, reply) { return sendSuccess(reply, { message: "Bulk addresses fetched", data: await service.list(request.user.sub) }); }
export async function create(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: "Bulk address created", data: await service.create(request.user.sub, request.body) }); }
