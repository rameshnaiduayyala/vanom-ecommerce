import * as controller from "./auth.controller.js";
import { authenticate } from "../../common/guards/auth.guard.js";

const credentials = {
  email: { type: "string", format: "email", maxLength: 320 },
  password: { type: "string", minLength: 8, maxLength: 200 }
};

export async function authRoutes(fastify) {
  fastify.post("/auth/register", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        additionalProperties: false,
        properties: {
          ...credentials,
          firstName: { type: ["string", "null"], maxLength: 100 },
          lastName: { type: ["string", "null"], maxLength: 100 },
          countryId: { type: ["string", "null"], minLength: 1 }
        }
      }
    }
  }, controller.register);

  fastify.post("/auth/login", {
    schema: {
      body: { type: "object", required: ["email", "password"], additionalProperties: false, properties: credentials }
    }
  }, controller.login);

  fastify.get("/auth/verify-email", {
    schema: {
      querystring: {
        type: "object",
        required: ["token"],
        additionalProperties: false,
        properties: { token: { type: "string", minLength: 20, maxLength: 200 } }
      }
    }
  }, controller.verifyEmail);

  fastify.get("/auth/me", { preHandler: authenticate }, controller.me);

  fastify.post("/auth/forgot-password", {
    schema: { body: { type: "object", required: ["email"], additionalProperties: false, properties: { email: { type: "string", format: "email" } } } }
  }, controller.forgotPassword);

  fastify.post("/auth/reset-password", {
    schema: { body: { type: "object", required: ["token", "password"], additionalProperties: false, properties: { token: { type: "string", minLength: 20 }, password: { type: "string", minLength: 8, maxLength: 200 } } } }
  }, controller.resetPassword);
}
