import * as controller from "./order.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const superadminGuard = [authenticate, authorize("SUPERADMIN")];
const idParams = { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1 } } };
const addressSchema = {
  type: "object",
  required: ["addressLine1", "city", "postalCode", "countryCode"],
  additionalProperties: true,
  properties: {
    fullName: { type: "string" },
    phone: { type: "string" },
    addressLine1: { type: "string", minLength: 2, maxLength: 255 },
    addressLine2: { type: ["string", "null"], maxLength: 255 },
    city: { type: "string", minLength: 1, maxLength: 100 },
    state: { type: ["string", "null"], maxLength: 100 },
    postalCode: { type: "string", minLength: 2, maxLength: 20 },
    countryCode: { type: "string", minLength: 2, maxLength: 10 }
  }
};

const taxAddressSchema = {
  type: "object",
  required: ["countryCode"],
  additionalProperties: true,
  properties: {
    fullName: { type: "string" },
    phone: { type: "string" },
    addressLine1: { type: "string" },
    addressLine2: { type: ["string", "null"] },
    city: { type: "string" },
    state: { type: ["string", "null"] },
    postalCode: { type: "string" },
    countryCode: { type: "string" }
  }
};

async function optionalAuth(request) {
  try {
    await request.jwtVerify();
  } catch {
    // Unauthenticated pass-through for tax calculation estimates
  }
}

export async function orderRoutes(fastify) {
  // ── Checkout & Place Order with Stripe Flow ──────────────────────────────
  fastify.post("/checkout", {
    preHandler: authenticate,
    schema: {
      body: {
        type: "object",
        required: ["shippingAddress"],
        additionalProperties: true,
        properties: {
          countryId: { type: "string" },
          currencyCode: { type: "string" },
          shippingAddress: addressSchema,
          billingAddress: addressSchema,
          shippingCharges: { type: "number", minimum: 0 },
          discount: { type: "number", minimum: 0 },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string" },
                variantId: { type: ["string", "null"] },
                quantity: { type: "integer", minimum: 1 }
              }
            }
          }
        }
      }
    }
  }, controller.checkout);

  // ── Calculate Real-Time Stripe Sales Tax ──────────────────────────────────
  fastify.post("/checkout/calculate-tax", {
    preHandler: optionalAuth,
    schema: {
      body: {
        type: "object",
        required: ["shippingAddress"],
        additionalProperties: true,
        properties: {
          currency: { type: "string" },
          shippingAddress: taxAddressSchema,
          shippingAmount: { type: "number" },
          items: { type: "array" }
        }
      }
    }
  }, controller.calculateTax);

  // ── Standard Orders Create (seamlessly wired to checkout flow) ───────────
  fastify.post("/orders", {
    preHandler: authenticate,
    schema: {
      body: {
        type: "object",
        required: ["shippingAddress"],
        additionalProperties: true,
        properties: {
          countryId: { type: "string" },
          currencyCode: { type: "string" },
          shippingAddress: addressSchema,
          billingAddress: addressSchema,
          shippingCharges: { type: "number", minimum: 0 },
          tax: { type: "number", minimum: 0 },
          discount: { type: "number", minimum: 0 },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string" },
                variantId: { type: ["string", "null"] },
                quantity: { type: "integer", minimum: 1 }
              }
            }
          }
        }
      }
    }
  }, controller.create);

  fastify.get("/orders", {
    preHandler: authenticate,
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          status: { type: "string" }
        }
      }
    }
  }, controller.list);

  fastify.get("/orders/:id", {
    preHandler: authenticate,
    schema: { params: idParams }
  }, controller.getById);

  fastify.get("/orders/:id/invoice", {
    preHandler: authenticate,
    schema: { params: idParams }
  }, controller.downloadInvoice);

  fastify.put("/orders/:id/status", {
    preHandler: superadminGuard,
    schema: {
      params: idParams,
      body: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string" }
        }
      }
    }
  }, controller.updateStatus);

  fastify.delete("/orders/:id", {
    preHandler: superadminGuard,
    schema: { params: idParams }
  }, controller.remove);
}
