import * as controller from "./coupon.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const guard = [authenticate, authorize("SUPERADMIN")];
const params = { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1 } } };
const properties = { code: { type: "string", minLength: 2, maxLength: 50 }, type: { type: "string", enum: ["PERCENTAGE", "FIXED"] }, value: { type: ["number", "string"], minimum: 0 }, minOrder: { type: ["number", "string", "null"], minimum: 0 }, maxDiscount: { type: ["number", "string", "null"], minimum: 0 }, usageLimit: { type: ["integer", "null"], minimum: 1 }, startsAt: { type: ["string", "null"], format: "date-time" }, expiresAt: { type: ["string", "null"], format: "date-time" }, isActive: { type: "boolean" } };

export async function couponRoutes(fastify) {
  fastify.post("/coupons", { preHandler: guard, schema: { body: { type: "object", required: ["code", "type", "value"], additionalProperties: false, properties } } }, controller.create);
  fastify.get("/coupons", { preHandler: guard, schema: { querystring: { type: "object", properties: { page: { type: "integer", minimum: 1, default: 1 }, limit: { type: "integer", minimum: 1, maximum: 100, default: 20 }, search: { type: "string" }, isActive: { type: "boolean" }, type: { type: "string", enum: ["PERCENTAGE", "FIXED"] } } } } }, controller.list);
  fastify.get("/coupons/:id", { preHandler: guard, schema: { params } }, controller.getById);
  fastify.put("/coupons/:id", { preHandler: guard, schema: { params, body: { type: "object", minProperties: 1, additionalProperties: false, properties } } }, controller.update);
  fastify.delete("/coupons/:id", { preHandler: guard, schema: { params } }, controller.remove);
}
