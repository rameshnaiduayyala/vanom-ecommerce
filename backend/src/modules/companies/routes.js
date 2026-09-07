import { CompanyController } from "./controller.js";

export default async function companyRoutes(fastify, options) {
  const controller = new CompanyController();

  fastify.post("/companies", {
    preHandler: [fastify.authenticate],
    handler: controller.register,
  });

  fastify.get("/companies", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });

  fastify.get("/companies/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getById,
  });

  fastify.patch("/companies/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.update,
  });

  fastify.put("/companies/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.update,
  });

  fastify.delete("/companies/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.delete,
  });

  fastify.post("/companies/:id/documents", {
    preHandler: [fastify.authenticate],
    handler: controller.uploadDocument,
  });

  fastify.get("/companies/:id/documents", {
    preHandler: [fastify.authenticate],
    handler: controller.listDocuments,
  });

  fastify.post("/companies/:id/submit-verification", {
    preHandler: [fastify.authenticate],
    handler: controller.submitVerification,
  });
}
