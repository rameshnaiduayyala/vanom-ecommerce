import * as controller from "./address.controller.js";
import { authenticate } from "../../common/guards/auth.guard.js";

const idParams = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "string", minLength: 1 } }
};

const addressBodySchema = {
  type: "object",
  required: ["fullName", "phone", "addressLine1", "city", "postalCode"],
  properties: {
    name: { type: ["string", "null"], maxLength: 100 },
    fullName: { type: "string", minLength: 1, maxLength: 150 },
    phone: { type: "string", minLength: 5, maxLength: 50 },
    addressLine1: { type: "string", minLength: 3, maxLength: 255 },
    addressLine2: { type: ["string", "null"], maxLength: 255 },
    city: { type: "string", minLength: 1, maxLength: 100 },
    state: { type: ["string", "null"], maxLength: 100 },
    postalCode: { type: "string", minLength: 2, maxLength: 20 },
    countryCode: { type: "string", minLength: 2, maxLength: 10 },
    isDefault: { type: "boolean" }
  }
};

const addressUpdateBodySchema = {
  type: "object",
  properties: {
    name: { type: ["string", "null"], maxLength: 100 },
    fullName: { type: "string", minLength: 1, maxLength: 150 },
    phone: { type: "string", minLength: 5, maxLength: 50 },
    addressLine1: { type: "string", minLength: 3, maxLength: 255 },
    addressLine2: { type: ["string", "null"], maxLength: 255 },
    city: { type: "string", minLength: 1, maxLength: 100 },
    state: { type: ["string", "null"], maxLength: 100 },
    postalCode: { type: "string", minLength: 2, maxLength: 20 },
    countryCode: { type: "string", minLength: 2, maxLength: 10 },
    isDefault: { type: "boolean" }
  }
};

export async function addressRoutes(fastify) {
  const routes = ["/addresses", "/users/addresses"];

  routes.forEach((prefix) => {
    fastify.get(prefix, {
      preHandler: [authenticate]
    }, controller.list);

    fastify.post(prefix, {
      schema: {
        body: addressBodySchema
      },
      preHandler: [authenticate]
    }, controller.create);

    fastify.put(`${prefix}/:id`, {
      schema: {
        params: idParams,
        body: addressUpdateBodySchema
      },
      preHandler: [authenticate]
    }, controller.update);

    fastify.delete(`${prefix}/:id`, {
      schema: {
        params: idParams
      },
      preHandler: [authenticate]
    }, controller.remove);

    fastify.patch(`${prefix}/:id/default`, {
      schema: {
        params: idParams
      },
      preHandler: [authenticate]
    }, controller.setDefault);
  });
}
