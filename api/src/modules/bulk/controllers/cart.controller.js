import * as service from "../services/cart.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";

const uid = (request) => request.user.sub;

export async function get(request, reply) {
  const data = await service.get(uid(request), request.query.countryCode);
  return sendSuccess(reply, { message: "Bulk cart fetched", data });
}

export async function add(request, reply) {
  const data = await service.add(uid(request), request.body);
  return sendSuccess(reply, { message: "Bulk cart item added", data });
}

export async function update(request, reply) {
  const data = await service.update(uid(request), request.params.id, request.body);
  return sendSuccess(reply, { message: "Bulk cart item updated", data });
}

export async function remove(request, reply) {
  await service.remove(uid(request), request.params.id);
  return sendSuccess(reply, { message: "Bulk cart item removed", data: null });
}
