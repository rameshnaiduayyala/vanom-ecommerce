import { PaymentController } from "./controller.js";

export default async function paymentRoutes(fastify, options) {
  const controller = new PaymentController();

  fastify.post("/payments/create", {
    preHandler: [fastify.authenticate],
    handler: controller.create,
  });

  fastify.post("/payments/:id/capture", {
    preHandler: [fastify.authenticate],
    handler: controller.capture,
  });

  fastify.post("/payments/:id/refund", {
    preHandler: [fastify.authenticate],
    handler: controller.refund,
  });

  fastify.post("/payments/verify-razorpay", {
    handler: controller.verifyRazorpay,
  });

  fastify.post("/payments/webhook", {
    handler: controller.webhook,
  });
}
