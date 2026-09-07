import { BannerController } from "./controller.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { ROLES } from "../../common/constants/index.js";

export default async function bannerRoutes(fastify, options) {
  const controller = new BannerController();

  // Public: List and view active promotional banners & sliders
  fastify.get("/banners", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.list,
  });

  fastify.get("/banners/:id", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.getById,
  });

  // Admin: Manage banners (create, update, delete)
  fastify.post("/banners", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.create,
  });

  fastify.put("/banners/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.update,
  });

  fastify.patch("/banners/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.update,
  });

  fastify.delete("/banners/:id", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: controller.delete,
  });
}
