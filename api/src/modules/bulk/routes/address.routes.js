import * as controller from "../controllers/address.controller.js";
import { authenticate } from "../../../common/guards/auth.guard.js";
import { addressBody } from "../schema.js";

export async function addressRoutes(fastify) {
  fastify.get("/bulk/addresses", { preHandler: authenticate }, controller.list);
  fastify.post("/bulk/addresses", { preHandler: authenticate, schema: { body: addressBody } }, controller.create);
}
