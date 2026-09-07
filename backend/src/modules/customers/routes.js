import { CustomerController } from "./controller.js";

export default async function customerRoutes(fastify, options) {
  const controller = new CustomerController();

  fastify.get("/customers/addresses", {
    preHandler: [fastify.authenticate],
    handler: controller.getAddresses,
  });

  fastify.post("/customers/addresses", {
    preHandler: [fastify.authenticate],
    handler: controller.addAddress,
  });

  fastify.delete("/customers/addresses/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.deleteAddress,
  });
}
