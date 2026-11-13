import * as controller from "./payment.controller.js";
import { authenticate, authorize } from "../../common/guards/auth.guard.js";

async function optionalAuth(request) {
  try {
    await request.jwtVerify();
  } catch {
    // Guest or unauthenticated pass-through; user remains null or undefined
    request.user = null;
  }
}

export async function paymentRoutes(fastify) {
  fastify.post("/payments/create", {
    preHandler: optionalAuth,
    schema: {
      body: {
        type: "object",
        required: ["orderId"],
        additionalProperties: true,
        properties: {
          orderId: { type: "string", minLength: 1 },
          provider: { type: "string" },
          captureMethod: { type: "string", enum: ["automatic", "manual"] },
          guestAccessToken: { type: "string" },
          guestToken: { type: "string" }
        }
      }
    }
  }, controller.create);

  fastify.post("/payments/checkout-session", {
    preHandler: optionalAuth,
    schema: {
      body: {
        type: "object",
        required: ["orderId"],
        additionalProperties: true,
        properties: {
          orderId: { type: "string", minLength: 1 },
          successUrl: { type: "string" },
          cancelUrl: { type: "string" },
          guestAccessToken: { type: "string" },
          guestToken: { type: "string" }
        }
      }
    }
  }, controller.createCheckoutSession);

  fastify.post("/payments/:paymentId/capture", {
    preHandler: optionalAuth,
    schema: {
      params: {
        type: "object",
        required: ["paymentId"],
        properties: {
          paymentId: { type: "string", minLength: 1 }
        }
      },
      body: {
        type: "object",
        additionalProperties: true,
        properties: {
          amount: { type: "number", minimum: 0 },
          orderId: { type: "string" },
          guestAccessToken: { type: "string" },
          guestToken: { type: "string" }
        }
      }
    }
  }, controller.capture);

  fastify.post("/payments/:paymentId/refund", {
    preHandler: [authenticate, authorize("SUPERADMIN")],
    schema: {
      params: {
        type: "object",
        required: ["paymentId"],
        properties: {
          paymentId: { type: "string", minLength: 1 }
        }
      },
      body: {
        type: "object",
        additionalProperties: true,
        properties: {
          amount: { type: "number", minimum: 0.01 },
          orderId: { type: "string" },
          reason: { type: "string" }
        }
      }
    }
  }, controller.refund);

  fastify.post("/payments/webhook", {
    schema: {
      body: {
        type: "object",
        additionalProperties: true
      }
    }
  }, controller.webhook);
}
