import * as controller from "./admin.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

export async function adminRoutes(fastify) {
  fastify.get("/admin/metrics", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.getMetrics);

  fastify.get("/admin/reports", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.getReports);

  fastify.get("/admin/audit-logs", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.getAuditLogs);

  fastify.get("/admin/payments", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.getPayments);

  fastify.get("/admin/inventory", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.getInventory);

  fastify.get("/admin/quotes", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.getQuotes);
}
