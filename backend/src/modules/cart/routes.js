import { CartController } from "./controller.js";

export default async function cartRoutes(fastify, options) {
  const controller = new CartController();

  fastify.get("/cart", {
    preHandler: [fastify.authenticate],
    handler: controller.getCart,
  });

  fastify.post("/cart/items", {
    preHandler: [fastify.authenticate],
    handler: controller.addItem,
  });

  fastify.patch("/cart/items/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.updateItem,
  });

  fastify.delete("/cart/items/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.removeItem,
  });

  fastify.delete("/cart", {
    preHandler: [fastify.authenticate],
    handler: controller.clearCart,
  });
}
