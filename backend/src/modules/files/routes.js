import { FileController } from "./controller.js";

export default async function fileRoutes(fastify, options) {
  const controller = new FileController();

  fastify.post("/files/upload", {
    preHandler: [fastify.authenticate],
    handler: controller.upload,
  });

  fastify.get("/files/*", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.getFile,
  });
}
