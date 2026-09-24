import * as controller from "../controllers/admin.controller.js";
import { idParams, pageQuery } from "../schema.js";
import { rejectBusinessBody, updateBusinessBody } from "../schemas/business.schema.js";
import { updateOrderStatusBody } from "../schemas/order.schema.js";
import { adminGuard } from "../lib/guards.js";

export async function adminRoutes(fastify) {
  // ─── Business Management ────────────────────────────────────────────────────
  fastify.get("/admin/bulk/businesses", {
    preHandler: adminGuard,
    schema: { querystring: pageQuery }
  }, controller.listBusinesses);

  fastify.post("/admin/bulk/businesses", {
    preHandler: adminGuard,
    schema: { body: updateBusinessBody }
  }, controller.createBusiness);

  fastify.get("/admin/bulk/businesses/:id", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.getBusiness);

  fastify.put("/admin/bulk/businesses/:id", {
    preHandler: adminGuard,
    schema: { params: idParams, body: updateBusinessBody }
  }, controller.updateBusiness);

  fastify.delete("/admin/bulk/businesses/:id", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.deleteBusiness);

  // ─── Business Status Actions ────────────────────────────────────────────────
  fastify.patch("/admin/bulk/businesses/:id/approve", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.approveBusiness);

  fastify.patch("/admin/bulk/businesses/:id/reject", {
    preHandler: adminGuard,
    schema: { params: idParams, body: rejectBusinessBody }
  }, controller.rejectBusiness);

  fastify.patch("/admin/bulk/businesses/:id/suspend", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.suspendBusiness);

  fastify.patch("/admin/bulk/businesses/:id/lock", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.lockBusiness);

  // ─── Order Management ───────────────────────────────────────────────────────
  fastify.get("/admin/bulk/orders", {
    preHandler: adminGuard,
    schema: { querystring: pageQuery }
  }, controller.listOrders);

  fastify.get("/admin/bulk/orders/:id", {
    preHandler: adminGuard,
    schema: { params: idParams }
  }, controller.getOrder);

  fastify.patch("/admin/bulk/orders/:id/status", {
    preHandler: adminGuard,
    schema: { params: idParams, body: updateOrderStatusBody }
  }, controller.updateOrderStatus);
}
