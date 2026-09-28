import * as controller from "./shipping.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const adminGuard = [authenticate, authorize("SUPERADMIN", "COMPANY_ADMIN", "WAREHOUSE_MANAGER")];

async function optionalAuth(request) {
  try {
    await request.jwtVerify();
  } catch {
    // Unauthenticated pass-through for checkout address validation and rate calculation
  }
}

export async function shippingRoutes(fastify) {
  // ── 1. Validate Shipping Address (USA, Canada, International) ─────────────
  fastify.post("/shipping/address/validate", {
    preHandler: optionalAuth,
    schema: {
      body: {
        type: "object",
        required: ["addressLine1", "city", "postalCode"],
        properties: {
          fullName: { type: "string" },
          company: { type: ["string", "null"] },
          addressLine1: { type: "string" },
          addressLine2: { type: ["string", "null"] },
          city: { type: "string" },
          state: { type: ["string", "null"] },
          postalCode: { type: "string" },
          countryCode: { type: "string" },
          phone: { type: ["string", "null"] },
          email: { type: ["string", "null"] }
        }
      }
    }
  }, controller.validateAddress);

  // ── 2. Get Real-Time Shipping Rates (Normalized) ──────────────────────────
  fastify.post("/shipping/rates", {
    preHandler: optionalAuth,
    schema: {
      body: {
        type: "object",
        required: ["shippingAddress"],
        properties: {
          warehouseId: { type: ["string", "null"] },
          subtotal: { type: "number" },
          shippingAddress: {
            type: "object",
            required: ["addressLine1", "city", "postalCode"],
            properties: {
              fullName: { type: "string" },
              addressLine1: { type: "string" },
              addressLine2: { type: ["string", "null"] },
              city: { type: "string" },
              state: { type: ["string", "null"] },
              postalCode: { type: "string" },
              countryCode: { type: "string" },
              phone: { type: ["string", "null"] }
            }
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                variantId: { type: ["string", "null"] },
                quantity: { type: "integer", minimum: 1 },
                weight: { type: "number" },
                weightUnit: { type: "string" }
              }
            }
          }
        }
      }
    }
  }, controller.getRates);

  // ── 3. Create Shipment For Order ──────────────────────────────────────────
  fastify.post("/shipping/shipments", {
    preHandler: adminGuard,
    schema: {
      body: {
        type: "object",
        required: ["orderId"],
        properties: {
          orderId: { type: "string" },
          warehouseId: { type: ["string", "null"] },
          rateId: { type: ["string", "null"] },
          carrier: { type: ["string", "null"] },
          service: { type: ["string", "null"] }
        }
      }
    }
  }, controller.createShipment);

  // ── 4. Generate Shipping Label & Transaction ──────────────────────────────
  fastify.post("/shipping/shipments/:shipmentId/label", {
    preHandler: adminGuard
  }, controller.createLabel);

  // ── 5. Get Shipment Details ───────────────────────────────────────────────
  fastify.get("/shipping/shipments/:shipmentId", {
    preHandler: authenticate
  }, controller.getShipmentById);

  // ── 6. Get All Shipments For An Order ─────────────────────────────────────
  fastify.get("/shipping/orders/:orderId/shipments", {
    preHandler: authenticate
  }, controller.getOrderShipments);

  // ── 7. Get Shipment Tracking ──────────────────────────────────────────────
  fastify.get("/shipping/tracking/:trackingNumber", {
    preHandler: optionalAuth
  }, controller.getTracking);

  // ── 8. Shippo Webhook Receiver (Idempotent) ───────────────────────────────
  fastify.post("/shipping/shippo/webhook", controller.handleWebhook);

  // ── 9. Admin List All Shipments ───────────────────────────────────────────
  fastify.get("/shipping/admin/shipments", {
    preHandler: adminGuard
  }, controller.listShipments);

  // ── 10. Update Shipment Status ────────────────────────────────────────────
  fastify.put("/shipping/shipments/:shipmentId/status", {
    preHandler: adminGuard,
    schema: {
      body: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string" }
        }
      }
    }
  }, controller.updateShipmentStatus);
}
