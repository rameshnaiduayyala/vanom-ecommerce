import * as controller from "./search.controller.js";

export async function searchRoutes(fastify) {
  fastify.get("/products/search", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          q: { type: "string" },
          search: { type: "string" },
          categoryId: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 20 },
          country: { type: "string" }
        }
      }
    }
  }, controller.search);

  // Also support /search endpoint directly
  fastify.get("/search", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          q: { type: "string" },
          search: { type: "string" },
          categoryId: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 20 },
          country: { type: "string" }
        }
      }
    }
  }, controller.search);
}

