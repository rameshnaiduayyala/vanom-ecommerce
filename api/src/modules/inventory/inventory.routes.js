import * as controller from "./inventory.controller.js";
import * as warehouseController from "./warehouse.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const inventoryStaff = [authenticate, authorize("SUPERADMIN", "COMPANY_ADMIN", "INVENTORY_MANAGER", "WAREHOUSE_MANAGER")];
const inventoryViewer = [authenticate, authorize("SUPERADMIN", "COMPANY_ADMIN", "INVENTORY_MANAGER", "WAREHOUSE_MANAGER", "EMPLOYEE")];

export async function inventoryRoutes(fastify) {
  // ─── Warehouse Endpoints ─────────────────────────────────────────────
  fastify.get("/warehouses", { preHandler: inventoryViewer }, warehouseController.list);
  fastify.get("/warehouses/:id", { preHandler: inventoryViewer }, warehouseController.getById);
  fastify.post("/warehouses", { preHandler: inventoryStaff }, warehouseController.create);
  fastify.put("/warehouses/:id", { preHandler: inventoryStaff }, warehouseController.update);
  fastify.delete("/warehouses/:id", { preHandler: inventoryStaff }, warehouseController.remove);

  // ─── Inventory Queries ───────────────────────────────────────────────
  fastify.get("/inventory", { preHandler: inventoryViewer }, controller.list);
  fastify.get("/inventory/low-stock", { preHandler: inventoryViewer }, controller.getLowStock);
  fastify.get("/inventory/out-of-stock", { preHandler: inventoryViewer }, controller.getOutOfStock);
  fastify.get("/inventory/transactions", { preHandler: inventoryViewer }, controller.listAllTransactions);
  fastify.get("/inventory/product/:productId", { preHandler: inventoryViewer }, controller.getByProduct);
  fastify.get("/inventory/variant/:variantId", { preHandler: inventoryViewer }, controller.getByVariant);
  fastify.get("/inventory/warehouse/:warehouseId", { preHandler: inventoryViewer }, controller.getByWarehouse);
  fastify.get("/inventory/:id", { preHandler: inventoryViewer }, controller.getById);
  fastify.get("/inventory/:id/transactions", { preHandler: inventoryViewer }, controller.getTransactionsByInventoryId);

  // ─── Inventory Actions / Operations ──────────────────────────────────
  fastify.post("/inventory/receive", {
    preHandler: inventoryStaff,
    schema: {
      body: {
        type: "object",
        required: ["quantity"],
        properties: {
          warehouseId: { type: "string" },
          productId: { type: "string" },
          variantId: { type: "string" },
          quantity: { type: "number", minimum: 1 },
          supplier: { type: "string" },
          referenceNumber: { type: "string" },
          notes: { type: "string" }
        }
      }
    }
  }, controller.receive);

  fastify.post("/inventory/adjust", {
    preHandler: inventoryStaff,
    schema: {
      body: {
        type: "object",
        required: ["inventoryId", "reason"],
        properties: {
          inventoryId: { type: "string" },
          adjustmentQuantity: { type: "number" },
          newTotalQuantity: { type: "number" },
          reason: { type: "string", minLength: 2 },
          notes: { type: "string" },
          type: { type: "string", enum: ["ADJUSTMENT", "DAMAGE", "LOSS", "RESTOCK"] }
        }
      }
    }
  }, controller.adjust);

  fastify.post("/inventory/reserve", {
    preHandler: inventoryStaff,
    schema: {
      body: {
        type: "object",
        required: ["items"],
        properties: {
          orderId: { type: "string" },
          warehouseId: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["quantity"],
              properties: {
                productId: { type: "string" },
                variantId: { type: "string" },
                quantity: { type: "number", minimum: 1 }
              }
            }
          }
        }
      }
    }
  }, controller.reserve);

  fastify.post("/inventory/release", {
    preHandler: inventoryStaff,
    schema: {
      body: {
        type: "object",
        required: ["orderId"],
        properties: {
          orderId: { type: "string" },
          reason: { type: "string" }
        }
      }
    }
  }, controller.release);

  fastify.post("/inventory/transfer", {
    preHandler: inventoryStaff,
    schema: {
      body: {
        type: "object",
        required: ["sourceWarehouseId", "destinationWarehouseId", "items"],
        properties: {
          sourceWarehouseId: { type: "string" },
          destinationWarehouseId: { type: "string" },
          notes: { type: "string" },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["inventoryId", "quantity"],
              properties: {
                inventoryId: { type: "string" },
                quantity: { type: "number", minimum: 1 }
              }
            }
          }
        }
      }
    }
  }, controller.transfer);

  fastify.post("/inventory/return", {
    preHandler: inventoryStaff,
    schema: {
      body: {
        type: "object",
        required: ["items"],
        properties: {
          orderId: { type: "string" },
          returnToStock: { type: "boolean" },
          condition: { type: "string", enum: ["SELLABLE", "DAMAGED", "EXPIRED"] },
          reason: { type: "string" },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["quantity"],
              properties: {
                productId: { type: "string" },
                variantId: { type: "string" },
                warehouseId: { type: "string" },
                quantity: { type: "number", minimum: 1 }
              }
            }
          }
        }
      }
    }
  }, controller.processReturn);

  // ─── Reports ─────────────────────────────────────────────────────────
  fastify.get("/inventory/summary", { preHandler: inventoryViewer }, controller.getSummaryReport);
  fastify.get("/inventory/reports/summary", { preHandler: inventoryViewer }, controller.getSummaryReport);
  fastify.get("/inventory/reports/valuation", { preHandler: inventoryViewer }, controller.getValuationReport);
}
