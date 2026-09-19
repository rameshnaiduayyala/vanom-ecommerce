import * as controller from "../controllers/business.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { businessBody } from "../schema.js";

export async function businessRoutes(fastify) {
  fastify.post("/bulk/business/register", { schema: { body: businessBody } }, controller.register);
  fastify.get("/bulk/business/me", { preHandler: authenticate }, controller.me);
  fastify.put("/bulk/business/me", { preHandler: authenticate, schema: { body: { ...businessBody, required: [], minProperties: 1 } } }, controller.update);
}
