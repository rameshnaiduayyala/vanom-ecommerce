import { TaxController } from "./controller.js";

export default async function taxRoutes(fastify, options) {
  const controller = new TaxController();

  fastify.post("/tax/calculate", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.calculate,
  });
}
