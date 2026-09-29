import * as controller from "./store.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

export async function storeRoutes(fastify) {
  // Public endpoint for storefront
  fastify.get("/store", controller.getPublic);

  // Strictly Superadmin CRUD endpoints for single store management
  fastify.get("/admin/store", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.get);

  fastify.post("/admin/store", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.create);

  fastify.put("/admin/store", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.update);

  fastify.patch("/admin/store", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.update);

  fastify.delete("/admin/store", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.remove);
}
