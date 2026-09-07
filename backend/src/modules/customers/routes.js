import { CustomerController } from "./controller.js";

export default async function customerRoutes(fastify, options) {
  const controller = new CustomerController();

  // Profile CRUD
  fastify.get("/customers/profile", {
    preHandler: [fastify.authenticate],
    handler: controller.getProfile,
  });

  fastify.patch("/customers/profile", {
    preHandler: [fastify.authenticate],
    handler: controller.updateProfile,
  });

  fastify.put("/customers/profile", {
    preHandler: [fastify.authenticate],
    handler: controller.updateProfile,
  });

  // Addresses CRUD
  fastify.get("/customers/addresses", {
    preHandler: [fastify.authenticate],
    handler: controller.getAddresses,
  });

  fastify.get("/customers/addresses/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getAddressById,
  });

  fastify.post("/customers/addresses", {
    preHandler: [fastify.authenticate],
    handler: controller.addAddress,
  });

  fastify.patch("/customers/addresses/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.updateAddress,
  });

  fastify.put("/customers/addresses/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.updateAddress,
  });

  fastify.delete("/customers/addresses/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.deleteAddress,
  });
}
