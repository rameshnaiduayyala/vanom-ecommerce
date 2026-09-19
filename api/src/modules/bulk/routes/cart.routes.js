import * as controller from "../controllers/cart.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { cartItemBody, idParams } from "../schema.js";

export async function cartRoutes(fastify) {
  fastify.get("/bulk/cart", { preHandler: authenticate, schema: { querystring: { type: "object", properties: { countryCode: { type: "string" } } } } }, controller.get);
  fastify.post("/bulk/cart/items", { preHandler: authenticate, schema: { body: cartItemBody } }, controller.add);
  fastify.patch("/bulk/cart/items/:id", { preHandler: authenticate, schema: { params: idParams, body: { type: "object", required: ["quantity", "countryCode"], additionalProperties: false, properties: { quantity: { type: "integer", minimum: 1 }, countryCode: { type: "string", minLength: 2 } } } } }, controller.update);
  fastify.delete("/bulk/cart/items/:id", { preHandler: authenticate, schema: { params: idParams } }, controller.remove);
}
