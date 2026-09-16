import * as controller from "./cart.controller.js";
import { authenticate } from "../../common/guards/auth.guard.js";

const itemParams = {
  type: "object",
  required: ["itemId"],
  properties: { itemId: { type: "string", minLength: 1 } }
};

export async function cartRoutes(fastify) {
  fastify.get("/cart", { preHandler: authenticate }, controller.get);

  fastify.post("/cart/items", {
    preHandler: authenticate,
    schema: {
      body: {
        type: "object",
        required: ["productId"],
        additionalProperties: false,
        properties: {
          productId: { type: "string", minLength: 1 },
          variantId: { type: ["string", "null"], minLength: 1 },
          quantity: { type: "integer", minimum: 1, default: 1 }
        }
      }
    }
  }, controller.addItem);

  fastify.put("/cart/items/:itemId", {
    preHandler: authenticate,
    schema: {
      params: itemParams,
      body: {
        type: "object",
        required: ["quantity"],
        additionalProperties: false,
        properties: { quantity: { type: "integer", minimum: 1 } }
      }
    }
  }, controller.updateItem);

  fastify.delete("/cart/items/:itemId", { preHandler: authenticate, schema: { params: itemParams } }, controller.removeItem);
  fastify.delete("/cart", { preHandler: authenticate }, controller.clear);
}
