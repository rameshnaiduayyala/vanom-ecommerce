import { BusinessVerificationController } from "./controller.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { ROLES } from "../../common/constants/index.js";

export default async function businessVerificationRoutes(fastify, options) {
  const controller = new BusinessVerificationController();

  fastify.get("/admin/business-applications", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.list,
  });

  fastify.get("/admin/business-applications/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.getById,
  });

  fastify.post("/admin/business-applications/:id/approve", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.approve,
  });

  fastify.post("/admin/business-applications/:id/reject", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.reject,
  });
}
