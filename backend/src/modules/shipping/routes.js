import { ShippingController } from "./controller.js";

export default async function shippingRoutes(fastify, options) {
  const controller = new ShippingController();

  fastify.get("/shipments", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });

  fastify.get("/shipments/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getById,
  });

  fastify.get("/shipments/:id/tracking", {
    preHandler: [fastify.authenticate],
    handler: controller.getTracking,
  });
}
