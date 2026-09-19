import * as controller from "./user.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

const superadminGuard = [authenticate, authorize("SUPERADMIN")];

const idParams = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "string", minLength: 1 } }
};

const userProperties = {
  email: { type: "string", format: "email", maxLength: 320 },
  password: { type: "string", minLength: 8, maxLength: 200 },
  firstName: { type: ["string", "null"], maxLength: 100 },
  lastName: { type: ["string", "null"], maxLength: 100 },
  phone: { type: ["string", "null"], maxLength: 50 },
  imageUrl: { type: ["string", "null"], maxLength: 2000 },
  isActive: { type: "boolean" },
  role: { type: "string", enum: ["USER", "SUPERADMIN"] },
  countryId: { type: ["string", "null"], minLength: 1 },
  businessId: { type: ["string", "null"], minLength: 1 },
  businessName: { type: ["string", "null"], maxLength: 200 },
  business: { type: ["object", "null"] }
};

const userBodySchema = {
  type: "object",
  additionalProperties: true,
  properties: userProperties
};

export async function userRoutes(fastify) {
  fastify.post("/users", {
    schema: {
      body: {
        content: {
          "application/json": { schema: { ...userBodySchema, required: ["email", "password"] } },
          "multipart/form-data": { schema: { type: "object" } }
        }
      }
    },
    preHandler: superadminGuard
  }, controller.create);

  fastify.get("/users", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          search: { type: "string" },
          isActive: { type: "boolean" },
          countryId: { type: "string", minLength: 1 }
        }
      }
    },
    preHandler: superadminGuard
  }, controller.list);

  fastify.get("/users/:id", { schema: { params: idParams }, preHandler: superadminGuard }, controller.getById);

  fastify.put("/users/:id", {
    schema: {
      params: idParams
    },
    preHandler: superadminGuard
  }, controller.update);

  fastify.delete("/users/:id", { schema: { params: idParams }, preHandler: superadminGuard }, controller.remove);
}
