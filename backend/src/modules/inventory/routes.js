import { InventoryController } from "./controller.js";

export default async function inventoryRoutes(fastify, options) {
  const controller = new InventoryController();

  fastify.get("/inventory/:variantId", controller.getStock);
  fastify.post("/inventory/adjust", {
    preHandler: [fastify.authenticate],
    handler: controller.adjust,
  });
}
