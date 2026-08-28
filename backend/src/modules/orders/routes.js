import { OrderController } from "./controller.js";

export default async function orderRoutes(fastify, options) {
  const controller = new OrderController();

  fastify.post("/orders", {
    preHandler: [fastify.authenticate, fastify.idempotent()],
    handler: controller.create,
  });

  fastify.get("/orders", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });

  fastify.get("/orders/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getById,
  });

  fastify.post("/orders/:id/cancel", {
    preHandler: [fastify.authenticate],
    handler: controller.cancel,
  });
}
