import * as controller from "./country.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const guard = [authenticate, authorize("SUPERADMIN")];
const params = { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1 } } };
const properties = { code: { type: "string", minLength: 2, maxLength: 10 }, name: { type: "string", minLength: 2, maxLength: 100 }, currencyId: { type: "string", minLength: 1 } };

export async function countryRoutes(fastify) {
  fastify.post("/countries", { preHandler: guard, schema: { body: { type: "object", required: ["code", "name", "currencyId"], additionalProperties: false, properties } } }, controller.create);
  fastify.get("/countries", { schema: { querystring: { type: "object", properties: { page: { type: "integer", minimum: 1, default: 1 }, limit: { type: "integer", minimum: 1, maximum: 100, default: 20 }, search: { type: "string" }, currencyId: { type: "string" } } } } }, controller.list);
  fastify.get("/countries/:id", { schema: { params } }, controller.getById);
  fastify.put("/countries/:id", { preHandler: guard, schema: { params, body: { type: "object", minProperties: 1, additionalProperties: false, properties } } }, controller.update);
  fastify.delete("/countries/:id", { preHandler: guard, schema: { params } }, controller.remove);
}
