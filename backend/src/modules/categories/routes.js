import { CategoryController } from "./controller.js";

export default async function categoryRoutes(fastify, options) {
  const controller = new CategoryController();

  fastify.get("/categories", controller.list);
  fastify.get("/categories/:id", controller.getById);
  fastify.post("/categories", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });
}
