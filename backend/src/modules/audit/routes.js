import { AuditController } from "./controller.js";

export default async function auditRoutes(fastify, options) {
  const controller = new AuditController();

  fastify.get("/admin/audit-logs", {
    preHandler: [fastify.authenticate],
    handler: controller.list,
  });
}
