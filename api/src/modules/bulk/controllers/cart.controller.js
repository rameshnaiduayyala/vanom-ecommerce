import * as service from "../services/cart.service.js";
import { sendSuccess } from "../../../common/response/api-response.js";
const uid = (r) => r.user.sub;
export async function get(request, reply) { return sendSuccess(reply, { message: "Bulk cart fetched", data: await service.get(uid(request), request.query.countryCode) }); }
export async function add(request, reply) { return sendSuccess(reply, { message: "Bulk cart item added", data: await service.add(uid(request), request.body) }); }
export async function update(request, reply) { return sendSuccess(reply, { message: "Bulk cart item updated", data: await service.update(uid(request), request.params.id, request.body) }); }
export async function remove(request, reply) { await service.remove(uid(request), request.params.id); return sendSuccess(reply, { message: "Bulk cart item removed", data: null }); }
