import * as service from "./address.service.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function list(request, reply) {
  const addresses = await service.listAddresses(request.user.sub);
  return reply.code(HTTP_STATUS.OK).send({
    success: true,
    data: addresses
  });
}

export async function create(request, reply) {
  const address = await service.createAddress(request.user.sub, request.body);
  return reply.code(HTTP_STATUS.CREATED).send({
    success: true,
    message: "Address added successfully",
    data: address
  });
}

export async function update(request, reply) {
  const address = await service.updateAddress(request.user.sub, request.params.id, request.body);
  return reply.code(HTTP_STATUS.OK).send({
    success: true,
    message: "Address updated successfully",
    data: address
  });
}

export async function remove(request, reply) {
  await service.deleteAddress(request.user.sub, request.params.id);
  return reply.code(HTTP_STATUS.OK).send({
    success: true,
    message: "Address removed successfully"
  });
}

export async function setDefault(request, reply) {
  const address = await service.setDefaultAddress(request.user.sub, request.params.id);
  return reply.code(HTTP_STATUS.OK).send({
    success: true,
    message: "Default delivery address updated",
    data: address
  });
}
