import * as service from "../services/address.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";

export async function list(request, reply) {
  const data = await service.list(request.user.sub);
  return sendSuccess(reply, { message: "Bulk addresses fetched", data });
}

export async function create(request, reply) {
  const data = await service.create(request.user.sub, request.body);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Bulk address created",
    data
  });
}
