import { CategoryController } from "./controller.js";

export default async function categoryRoutes(fastify, options) {
  const controller = new CategoryController();

  // Public category browsing
  fastify.get("/categories", controller.list);
  fastify.get("/categories/:id", controller.getById);

  // Authenticated / Admin category management
  fastify.post("/categories", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });

  fastify.put("/categories/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.update,
  });

  fastify.delete("/categories/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.delete,
  });

  // Dedicated Category Image operations
  fastify.post("/categories/:id/image", {
    preHandler: [fastify.authenticate],
    handler: controller.uploadImage,
  });

  fastify.delete("/categories/:id/image", {
    preHandler: [fastify.authenticate],
    handler: controller.deleteImage,
  });

  fastify.post("/categories/:id/presigned-image-url", {
    preHandler: [fastify.authenticate],
    handler: controller.getPresignedUploadUrl,
  });
}
