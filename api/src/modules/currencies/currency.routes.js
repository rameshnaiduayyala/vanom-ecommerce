import * as controller from "./currency.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const guard = [authenticate, authorize("SUPERADMIN")];
const params = { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1 } } };
const properties = { code: { type: "string", minLength: 3, maxLength: 10 }, name: { type: "string", minLength: 2, maxLength: 100 }, symbol: { type: "string", minLength: 1, maxLength: 10 } };

export async function currencyRoutes(fastify) {
  fastify.post("/currencies", { preHandler: guard, schema: { body: { type: "object", required: ["code", "name", "symbol"], additionalProperties: false, properties } } }, controller.create);
  fastify.get("/currencies", { schema: { querystring: { type: "object", properties: { page: { type: "integer", minimum: 1, default: 1 }, limit: { type: "integer", minimum: 1, maximum: 100, default: 20 }, search: { type: "string" } } } } }, controller.list);
  fastify.get("/currencies/:id", { schema: { params } }, controller.getById);
  fastify.put("/currencies/:id", { preHandler: guard, schema: { params, body: { type: "object", minProperties: 1, additionalProperties: false, properties } } }, controller.update);
  fastify.delete("/currencies/:id", { preHandler: guard, schema: { params } }, controller.remove);
}
