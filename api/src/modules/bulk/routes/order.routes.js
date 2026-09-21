import * as controller from "../controllers/order.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { idParams, pageQuery } from "../schema.js";
import { orderBody } from "../schemas/order.schema.js";

export async function orderRoutes(fastify) {
  fastify.post("/bulk/orders", {
    preHandler: authenticate,
    schema: { body: orderBody }
  }, controller.create);

  fastify.get("/bulk/orders", {
    preHandler: authenticate,
    schema: { querystring: pageQuery }
  }, controller.list);

  fastify.get("/bulk/orders/:id", {
    preHandler: authenticate,
    schema: { params: idParams }
  }, controller.getById);
}
