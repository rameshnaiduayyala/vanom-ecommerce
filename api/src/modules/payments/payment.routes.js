import * as controller from "./payment.controller.js";

async function optionalAuth(request) {
  try {
    await request.jwtVerify();
  } catch {
    // Guest or unauthenticated pass-through
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
          provider: { type: "string" }
        }
      }
    }
  }, controller.create);

  fastify.post("/payments/:paymentId/capture", {
    preHandler: optionalAuth,
    schema: {
      params: {
        type: "object",
        required: ["paymentId"],
        properties: {
          paymentId: { type: "string", minLength: 1 }
        }
      }
    }
  }, controller.capture);

  fastify.post("/payments/:paymentId/refund", {
    preHandler: optionalAuth,
    schema: {
      params: {
        type: "object",
        required: ["paymentId"],
        properties: {
          paymentId: { type: "string", minLength: 1 }
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
