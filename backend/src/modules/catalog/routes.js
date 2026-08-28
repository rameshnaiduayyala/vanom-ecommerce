import { CatalogController } from "./controller.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { PERMISSIONS } from "../../common/constants/index.js";

export default async function catalogRoutes(fastify, options) {
  const controller = new CatalogController();

  fastify.get("/products", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.list,
  });

  fastify.get("/products/:id", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.getById,
  });

  fastify.post("/products", {
    preHandler: [fastify.authenticate, RbacGuard.requirePermissions(PERMISSIONS.CATALOG_CREATE)],
    handler: controller.create,
  });

  fastify.patch("/products/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requirePermissions(PERMISSIONS.CATALOG_UPDATE)],
    handler: controller.update,
  });

  fastify.delete("/products/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requirePermissions(PERMISSIONS.CATALOG_DELETE)],
    handler: controller.delete,
  });
}
