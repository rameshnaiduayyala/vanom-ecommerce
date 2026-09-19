import * as controller from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../../../common/guards/auth.guard.js";
import { pageQuery, idParams, businessBody } from "../schema.js";

const admin = [authenticate, authorize("SUPERADMIN")];
export async function adminRoutes(fastify) {
  fastify.get("/admin/bulk/businesses", { preHandler: admin, schema: { querystring: pageQuery } }, controller.listBusinesses);
  fastify.post("/admin/bulk/businesses", { preHandler: admin, schema: { body: businessBody } }, controller.createBusiness);
  fastify.get("/admin/bulk/businesses/:id", { preHandler: admin, schema: { params: idParams } }, controller.getBusiness);
  fastify.put("/admin/bulk/businesses/:id", { preHandler: admin, schema: { params: idParams } }, controller.updateBusiness);
  fastify.delete("/admin/bulk/businesses/:id", { preHandler: admin, schema: { params: idParams } }, controller.deleteBusiness);
  fastify.patch("/admin/bulk/businesses/:id/approve", { preHandler: admin, schema: { params: idParams } }, controller.approveBusiness);
  fastify.patch("/admin/bulk/businesses/:id/reject", { preHandler: admin, schema: { params: idParams, body: { type: "object", required: ["rejectionReason"], additionalProperties: false, properties: { rejectionReason: { type: "string", minLength: 2 } } } } }, controller.rejectBusiness);
  fastify.patch("/admin/bulk/businesses/:id/suspend", { preHandler: admin, schema: { params: idParams } }, controller.suspendBusiness);
  fastify.get("/admin/bulk/orders", { preHandler: admin, schema: { querystring: pageQuery } }, controller.listOrders);
  fastify.get("/admin/bulk/orders/:id", { preHandler: admin, schema: { params: idParams } }, controller.getOrder);
  fastify.patch("/admin/bulk/orders/:id/status", { preHandler: admin, schema: { params: idParams, body: { type: "object", minProperties: 1, additionalProperties: false, properties: { status: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] }, paymentStatus: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"] }, shippingStatus: { type: "string", enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] } } } } }, controller.updateOrderStatus);
}
