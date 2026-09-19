import * as controller from "./order.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const superadminGuard = [authenticate, authorize("SUPERADMIN")];
const idParams = { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1 } } };
const addressSchema = {
  type: "object",
  required: ["fullName", "phone", "addressLine1", "city", "postalCode", "countryCode"],
  additionalProperties: false,
  properties: {
    fullName: { type: "string", minLength: 2, maxLength: 200 },
    phone: { type: "string", minLength: 5, maxLength: 30 },
    addressLine1: { type: "string", minLength: 2, maxLength: 255 },
    addressLine2: { type: ["string", "null"], maxLength: 255 },
    city: { type: "string", minLength: 2, maxLength: 100 },
    state: { type: ["string", "null"], maxLength: 100 },
    postalCode: { type: "string", minLength: 2, maxLength: 20 },
    countryCode: { type: "string", minLength: 2, maxLength: 10 }
  }
};

export async function orderRoutes(fastify) {
  fastify.post("/orders", {
    preHandler: authenticate,
    schema: {
      body: {
        type: "object",
        required: ["countryId", "currencyCode", "shippingAddress"],
        additionalProperties: true,
        properties: {
          countryId: { type: "string", minLength: 1 },
          currencyCode: { type: "string", minLength: 3, maxLength: 10 },
          shippingAddress: addressSchema,
          billingAddress: { ...addressSchema, required: addressSchema.required },
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
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          status: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] }
        }
      }
    }
  }, controller.list);

  fastify.get("/orders/:id", { preHandler: authenticate, schema: { params: idParams } }, controller.getById);

  fastify.put("/orders/:id/status", {
    preHandler: superadminGuard,
    schema: {
      params: idParams,
      body: {
        type: "object",
        required: ["status"],
        additionalProperties: false,
        properties: { status: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] } }
      }
    }
  }, controller.updateStatus);

  fastify.delete("/orders/:id", { preHandler: superadminGuard, schema: { params: idParams } }, controller.remove);
}
