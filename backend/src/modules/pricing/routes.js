import { PricingController } from "./controller.js";

export default async function pricingRoutes(fastify, options) {
  const controller = new PricingController();

  fastify.get("/pricing/resolve", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.resolvePrice,
  });
}
