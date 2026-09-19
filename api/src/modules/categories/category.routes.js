import * as controller from "./category.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const superadminGuard = [authenticate, authorize("SUPERADMIN")];
const idParams = { type: "object", required: ["id"], properties: { id: { type: "string", minLength: 1 } } };
const properties = {
  name: { type: "string", minLength: 2, maxLength: 200 },
  slug: { type: "string", minLength: 2, maxLength: 220 },
  imageUrl: { type: ["string", "null"], maxLength: 2000 },
  isActive: { type: "boolean" }
};

export async function categoryRoutes(fastify) {
  fastify.post("/categories", {
    schema: {
      body: {
        content: {
          "application/json": { schema: { type: "object", required: ["name"], additionalProperties: false, properties } },
          "multipart/form-data": { schema: { type: "object" } }
        }
      }
    },
    preHandler: superadminGuard
  }, controller.create);

  fastify.get("/categories", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          search: { type: "string" },
          isActive: { type: "boolean" }
        }
      }
    }
  }, controller.list);

  fastify.get("/categories/:id", { schema: { params: idParams } }, controller.getById);

  fastify.put("/categories/:id", {
    schema: { params: idParams },
    preHandler: superadminGuard
  }, controller.update);

  fastify.delete("/categories/:id", { schema: { params: idParams }, preHandler: superadminGuard }, controller.remove);
}
