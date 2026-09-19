import * as controller from "./review.controller.js";
import { authenticate } from "../../common/guards/auth.guard.js";

const productParams = {
  type: "object",
  required: ["productId"],
  properties: { productId: { type: "string", minLength: 1 } }
};

const reviewParams = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "string", minLength: 1 } }
};

const reviewProperties = {
  rating: { type: "integer", minimum: 1, maximum: 5 },
  title: { type: ["string", "null"], maxLength: 200 },
  comment: { type: ["string", "null"], maxLength: 5000 },
  images: { type: "array", maxItems: 10, items: { type: "string", minLength: 1, maxLength: 2000 } }
};

export async function reviewRoutes(fastify) {
  fastify.post("/products/:productId/reviews", {
    preHandler: authenticate,
    schema: {
      params: productParams,
      body: { type: "object", required: ["rating"], additionalProperties: false, properties: reviewProperties }
    }
  }, controller.create);

  fastify.get("/products/:productId/reviews", {
    schema: {
      params: productParams,
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          rating: { type: "integer", minimum: 1, maximum: 5 }
        }
      }
    }
  }, controller.list);

  fastify.get("/reviews/:id", { schema: { params: reviewParams } }, controller.getById);

  fastify.put("/reviews/:id", {
    preHandler: authenticate,
    schema: { params: reviewParams, body: { type: "object", minProperties: 1, additionalProperties: false, properties: reviewProperties } }
  }, controller.update);

  fastify.delete("/reviews/:id", { preHandler: authenticate, schema: { params: reviewParams } }, controller.remove);
}
