import { CheckoutController } from "./controller.js";

export default async function checkoutRoutes(fastify, options) {
  const controller = new CheckoutController();

  fastify.post("/checkout/validate", {
    preHandler: [fastify.authenticate],
    handler: controller.validate,
  });

  fastify.post("/checkout/place-order", {
    preHandler: [fastify.authenticate, fastify.idempotent()],
    handler: controller.placeOrder,
  });

  fastify.post("/checkout", {
    preHandler: [fastify.authenticate],
    handler: controller.validate,
  });
}
