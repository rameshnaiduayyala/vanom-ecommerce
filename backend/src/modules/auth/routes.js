import { AuthController } from "./controller.js";
import { AuthService } from "./service.js";

export default async function authRoutes(fastify, options) {
  const authService = new AuthService(fastify.jwt.sign.bind(fastify.jwt));
  const controller = new AuthController(authService);

  fastify.post("/register", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          firstName: { type: "string" },
          lastName: { type: "string" },
          phone: { type: "string" },
          customerType: { type: "string", enum: ["B2C", "B2B"] },
        },
      },
    },
    handler: controller.register,
  });

  fastify.post("/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
    },
    handler: controller.login,
  });

  fastify.post("/refresh", controller.refresh);
  fastify.post("/logout", controller.logout);
  fastify.post("/forgot-password", controller.forgotPassword);
  fastify.post("/reset-password", controller.resetPassword);

  fastify.get("/me", {
    preHandler: [fastify.authenticate],
    handler: controller.getMe,
  });
}
