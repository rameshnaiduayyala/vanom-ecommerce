import * as service from "./admin.service.js";

export async function list(request, reply) {
  return reply.send(await service.list(request.query || {}));
}

export async function getById(request, reply) {
  return reply.send(await service.getById(request.params.id));
}

export async function create(request, reply) {
  const result = await service.create(request.body || {});
  return reply.code(201).send(result);
}

export async function update(request, reply) {
  return reply.send(await service.update(request.params.id, request.body || {}));
}

export async function remove(request, reply) {
  return reply.send(await service.remove(request.params.id));
}
