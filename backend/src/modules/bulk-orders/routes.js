import { BulkOrderController } from "./controller.js";

export default async function bulkOrderRoutes(fastify, options) {
  const controller = new BulkOrderController();

  fastify.post("/bulk-orders", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });

  fastify.get("/bulk-orders", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });

  fastify.get("/bulk-orders/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getById,
  });

  fastify.post("/bulk-orders/:id/submit", {
    preHandler: [fastify.authenticate],
    handler: controller.submit,
  });
}
