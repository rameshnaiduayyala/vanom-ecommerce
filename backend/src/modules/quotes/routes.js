import { QuoteController } from "./controller.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { PERMISSIONS } from "../../common/constants/index.js";

export default async function quoteRoutes(fastify, options) {
  const controller = new QuoteController();

  fastify.post("/quotes", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });

  fastify.get("/quotes", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });

  fastify.get("/quotes/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getById,
  });

  fastify.post("/quotes/:id/submit", {
    preHandler: [fastify.authenticate],
    handler: controller.submit,
  });

  fastify.post("/quotes/:id/counter", {
    preHandler: [fastify.authenticate, RbacGuard.requirePermissions(PERMISSIONS.QUOTES_UPDATE)],
    handler: controller.counter,
  });

  fastify.post("/quotes/:id/accept", {
    preHandler: [fastify.authenticate],
    handler: controller.accept,
  });

  fastify.post("/quotes/:id/convert-to-order", {
    preHandler: [fastify.authenticate, fastify.idempotent()],
    handler: controller.convertToOrder,
  });
}
