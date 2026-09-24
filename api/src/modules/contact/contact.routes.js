import * as controller from "./contact.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

export async function contactRoutes(fastify) {
  // Public storefront contact submission
  fastify.post("/contact", controller.submitContact);

  // Superadmin contact message management
  fastify.get("/admin/contact-messages", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.list);

  fastify.patch("/admin/contact-messages/:id", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.update);

  fastify.delete("/admin/contact-messages/:id", {
    preHandler: [authenticate, authorize("SUPERADMIN")]
  }, controller.remove);
}
