import * as controller from "../controllers/order.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { pageQuery, idParams } from "../schema.js";

const orderBody = { type: "object", required: ["countryCode", "shippingAddress"], additionalProperties: false, properties: { countryCode: { type: "string", minLength: 2 }, shippingCharges: { type: "number", minimum: 0 }, tax: { type: "number", minimum: 0 }, shippingAddress: { type: "object", required: ["contactName", "phone", "addressLine1", "city", "postalCode", "countryCode"], additionalProperties: false, properties: { contactName: { type: "string" }, phone: { type: "string" }, addressLine1: { type: "string" }, addressLine2: { type: ["string", "null"] }, city: { type: "string" }, state: { type: ["string", "null"] }, postalCode: { type: "string" }, countryCode: { type: "string" } } } } };
export async function orderRoutes(fastify) {
  fastify.post("/bulk/orders", { preHandler: authenticate, schema: { body: orderBody } }, controller.create);
  fastify.get("/bulk/orders", { preHandler: authenticate, schema: { querystring: pageQuery } }, controller.list);
  fastify.get("/bulk/orders/:id", { preHandler: authenticate, schema: { params: idParams } }, controller.getById);
}
