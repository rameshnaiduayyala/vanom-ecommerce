import * as controller from "../controllers/business.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { businessBody, updateBusinessBody } from "../schemas/business.schema.js";

export async function businessRoutes(fastify) {
  // Open registration — no auth required
  fastify.post("/bulk/business/register", {
    schema: { body: businessBody }
  }, controller.register);

  fastify.get("/bulk/business/me", {
    preHandler: authenticate
  }, controller.me);

  fastify.put("/bulk/business/me", {
    preHandler: authenticate,
    schema: { body: updateBusinessBody }
  }, controller.update);
}
