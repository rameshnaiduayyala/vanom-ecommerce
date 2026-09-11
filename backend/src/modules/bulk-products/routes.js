import { BulkProductsController } from "./controller.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { ROLES } from "../../common/constants/index.js";

/**
 * Separate dedicated API routes for Enterprise B2B Bulk Products.
 * These endpoints are authenticated and isolated from public B2C endpoints.
 */
export default async function bulkProductsRoutes(fastify, options) {
  const controller = new BulkProductsController();

  // B2B Buyer & Admin Access (List & View)
  fastify.get("/bulk-products", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });

  fastify.get("/bulk-products/:id", {
    preHandler: [fastify.authenticate],
    handler: controller.getById,
  });

  // Admin & Supplier CRUD Management
  fastify.post("/bulk-products", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.create,
  });

  fastify.put("/bulk-products/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.update,
  });

  fastify.patch("/bulk-products/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.update,
  });

  fastify.delete("/bulk-products/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.delete,
  });
}
