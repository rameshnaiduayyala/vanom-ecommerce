import * as service from "../services/business.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
export async function register(request, reply) { return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: "Bulk business registration submitted", data: await service.register(request.body, request.user?.sub) }); }
export async function me(request, reply) { return sendSuccess(reply, { message: "Bulk business fetched", data: await service.me(request.user.sub) }); }
export async function update(request, reply) { return sendSuccess(reply, { message: "Bulk business updated", data: await service.update(request.user.sub, request.body) }); }
