import { AdminController } from "./controller.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { ROLES } from "../../common/constants/index.js";

export default async function adminRoutes(fastify, options) {
  const controller = new AdminController();
  const adminGuard = [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

  fastify.get("/admin/metrics", { preHandler: adminGuard, handler: controller.getMetrics });
  fastify.get("/admin/products", { preHandler: adminGuard, handler: controller.listProducts });
  fastify.get("/admin/categories", { preHandler: adminGuard, handler: controller.listCategories });
  fastify.get("/admin/orders", { preHandler: adminGuard, handler: controller.listOrders });
  fastify.patch("/admin/orders/:id/status", { preHandler: adminGuard, handler: controller.updateOrderStatus });
  fastify.get("/admin/companies", { preHandler: adminGuard, handler: controller.listCompanies });
  fastify.get("/admin/users", { preHandler: adminGuard, handler: controller.listUsers });
  fastify.post("/admin/users", { preHandler: adminGuard, handler: controller.createUser });
  fastify.patch("/admin/users/:id", { preHandler: adminGuard, handler: controller.updateUser });
  fastify.delete("/admin/users/:id", { preHandler: adminGuard, handler: controller.deleteUser });
  fastify.get("/admin/inventory", { preHandler: adminGuard, handler: controller.listInventory });
  fastify.post("/admin/inventory/adjust", { preHandler: adminGuard, handler: controller.adjustInventory });
  fastify.get("/admin/quotes", { preHandler: adminGuard, handler: controller.listQuotes });
  fastify.get("/admin/payments", { preHandler: adminGuard, handler: controller.listPayments });
  fastify.get("/admin/reports", { preHandler: adminGuard, handler: controller.getReports });
}
