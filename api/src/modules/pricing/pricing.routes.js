import * as controller from "./pricing.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const guard = [authenticate, authorize("SUPERADMIN")];
const params = { type: "object", required: ["productId", "countryId"], properties: { productId: { type: "string" }, countryId: { type: "string" } } };
const priceBody = { type: "object", required: ["countryId", "price"], additionalProperties: false, properties: { countryId: { type: "string", minLength: 1 }, oldPrice: { type: ["number", "string", "null"], minimum: 0 }, price: { type: ["number", "string", "null"], minimum: 0 }, stock: { type: "integer", minimum: 0 }, isAvailable: { type: "boolean" } } };

export async function pricingRoutes(fastify) {
  fastify.get("/products/:productId/countries", { schema: { params: { type: "object", required: ["productId"], properties: { productId: { type: "string" } } } } }, controller.productList);
  fastify.post("/products/:productId/countries", { preHandler: guard, schema: { params: { type: "object", required: ["productId"], properties: { productId: { type: "string" } } }, body: priceBody } }, controller.productUpsert);
  fastify.delete("/products/:productId/countries/:countryId", { preHandler: guard, schema: { params } }, controller.productDelete);

  const variantParams = { type: "object", required: ["productId", "variantId"], properties: { productId: { type: "string" }, variantId: { type: "string" } } };
  fastify.get("/products/:productId/variants/:variantId/countries", { schema: { params: variantParams } }, controller.variantList);
  fastify.post("/products/:productId/variants/:variantId/countries", { preHandler: guard, schema: { params: variantParams, body: priceBody } }, controller.variantUpsert);
  fastify.delete("/products/:productId/variants/:variantId/countries/:countryId", { preHandler: guard, schema: { params: { ...variantParams, required: ["productId", "variantId", "countryId"] } } }, controller.variantDelete);
}
