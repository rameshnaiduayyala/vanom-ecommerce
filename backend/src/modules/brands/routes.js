import { BrandController } from "./controller.js";

export default async function brandRoutes(fastify, options) {
  const controller = new BrandController();

  fastify.get("/brands", controller.list);
  fastify.get("/brands/:id", controller.getById);
  fastify.post("/brands", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });
}
