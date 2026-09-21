import * as controller from "../controllers/cart.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { idParams } from "../schema.js";
import { cartItemBody, updateCartItemBody, cartQuerystring } from "../schemas/cart.schema.js";

export async function cartRoutes(fastify) {
  fastify.get("/bulk/cart", {
    preHandler: authenticate,
    schema: { querystring: cartQuerystring }
  }, controller.get);

  fastify.post("/bulk/cart/items", {
    preHandler: authenticate,
    schema: { body: cartItemBody }
  }, controller.add);

  fastify.patch("/bulk/cart/items/:id", {
    preHandler: authenticate,
    schema: { params: idParams, body: updateCartItemBody }
  }, controller.update);

  fastify.delete("/bulk/cart/items/:id", {
    preHandler: authenticate,
    schema: { params: idParams }
  }, controller.remove);
}
