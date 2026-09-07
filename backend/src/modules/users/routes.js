import { UserController } from "./controller.js";

export default async function userRoutes(fastify, options) {
  const controller = new UserController();

  fastify.get("/users/profile", {
    preHandler: [fastify.authenticate],
    handler: controller.getProfile,
  });

  fastify.patch("/users/profile", {
    preHandler: [fastify.authenticate],
    handler: controller.updateProfile,
  });
}
