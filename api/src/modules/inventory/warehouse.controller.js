import * as warehouseService from "./warehouse.service.js";
import { resolveUserOrganization } from "./organization.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function list(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const warehouses = await warehouseService.listWarehouses(org.id, request.query);
  return sendSuccess(reply, { data: warehouses, message: "Warehouses retrieved successfully" });
}

export async function getById(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const warehouse = await warehouseService.getWarehouseById(org.id, request.params.id);
  return sendSuccess(reply, { data: warehouse });
}

export async function create(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const warehouse = await warehouseService.createWarehouse(org.id, request.body);
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    data: warehouse,
    message: "Warehouse created successfully"
  });
}

export async function update(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const warehouse = await warehouseService.updateWarehouse(org.id, request.params.id, request.body);
  return sendSuccess(reply, { data: warehouse, message: "Warehouse updated successfully" });
}

export async function remove(request, reply) {
  const org = await resolveUserOrganization(request.user);
  await warehouseService.deleteWarehouse(org.id, request.params.id);
  return sendSuccess(reply, { message: "Warehouse deleted successfully" });
}
