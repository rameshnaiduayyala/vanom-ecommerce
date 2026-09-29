import * as inventoryService from "./inventory.service.js";
import * as transactionService from "./inventory.transaction.service.js";
import { resolveUserOrganization } from "./organization.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function list(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await inventoryService.listInventory(org.id, request.query);
  return sendSuccess(reply, {
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    },
    message: "Inventory retrieved successfully"
  });
}

export async function getById(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.getInventoryById(org.id, request.params.id);
  return sendSuccess(reply, { data });
}

export async function getByProduct(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await inventoryService.listInventory(org.id, {
    productId: request.params.productId,
    ...request.query
  });
  return sendSuccess(reply, { data: result.items, meta: { total: result.total } });
}

export async function getByVariant(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await inventoryService.listInventory(org.id, {
    variantId: request.params.variantId,
    ...request.query
  });
  return sendSuccess(reply, { data: result.items, meta: { total: result.total } });
}

export async function getByWarehouse(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await inventoryService.listInventory(org.id, {
    warehouseId: request.params.warehouseId,
    ...request.query
  });
  return sendSuccess(reply, { data: result.items, meta: { total: result.total } });
}

export async function getLowStock(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await inventoryService.getLowStockItems(org.id);
  return sendSuccess(reply, { data: result.items, meta: { total: result.total } });
}

export async function getOutOfStock(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await inventoryService.getOutOfStockItems(org.id);
  return sendSuccess(reply, { data: result.items, meta: { total: result.total } });
}

export async function getTransactionsByInventoryId(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await transactionService.listTransactions(org.id, {
    inventoryId: request.params.id,
    ...request.query
  });
  return sendSuccess(reply, { data: result.items, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
}

export async function listAllTransactions(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const result = await transactionService.listTransactions(org.id, request.query);
  return sendSuccess(reply, { data: result.items, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
}

export async function receive(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.receiveInventory({
    organizationId: org.id,
    warehouseId: request.body.warehouseId,
    productId: request.body.productId,
    variantId: request.body.variantId,
    quantity: request.body.quantity,
    supplier: request.body.supplier,
    referenceNumber: request.body.referenceNumber,
    notes: request.body.notes,
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    data,
    message: "Stock received successfully"
  });
}

export async function adjust(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.adjustInventory({
    organizationId: org.id,
    inventoryId: request.body.inventoryId,
    adjustmentQuantity: request.body.adjustmentQuantity,
    newTotalQuantity: request.body.newTotalQuantity,
    reason: request.body.reason,
    notes: request.body.notes,
    type: request.body.type || "ADJUSTMENT",
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    data,
    message: "Stock adjusted successfully"
  });
}

export async function reserve(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.reserveInventory({
    organizationId: org.id,
    items: request.body.items,
    orderId: request.body.orderId,
    warehouseId: request.body.warehouseId,
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    data,
    message: "Stock reserved successfully"
  });
}

export async function release(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.releaseInventory({
    organizationId: org.id,
    orderId: request.body.orderId,
    reason: request.body.reason || "Manual release",
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    data,
    message: "Reservation released successfully"
  });
}

export async function transfer(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.transferInventory({
    organizationId: org.id,
    sourceWarehouseId: request.body.sourceWarehouseId,
    destinationWarehouseId: request.body.destinationWarehouseId,
    items: request.body.items,
    notes: request.body.notes,
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    data,
    message: "Warehouse stock transfer completed successfully"
  });
}

export async function processReturn(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.returnInventory({
    organizationId: org.id,
    orderId: request.body.orderId,
    items: request.body.items,
    returnToStock: request.body.returnToStock !== false,
    condition: request.body.condition || "SELLABLE",
    reason: request.body.reason || "Customer return",
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    data,
    message: "Return processed and audited successfully"
  });
}

export async function getSummaryReport(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.getInventorySummary(org.id);
  return sendSuccess(reply, { data });
}

export async function getValuationReport(request, reply) {
  const org = await resolveUserOrganization(request.user);
  const data = await inventoryService.getInventoryValuation(org.id);
  return sendSuccess(reply, { data });
}
