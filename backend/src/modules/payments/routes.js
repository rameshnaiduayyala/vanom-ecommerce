import { PaymentService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class PaymentController {
  constructor(service = new PaymentService()) {
    this.service = service;
  }

  create = async (request, reply) => {
    const data = await this.service.createPaymentIntent(request.user, request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(data));
  };

  capture = async (request, reply) => {
    const data = await this.service.capturePayment(request.params.id, request.body?.amount);
    return reply.send(ApiResponse.success(data));
  };

  refund = async (request, reply) => {
    const data = await this.service.refundPayment(request.params.id, request.user, request.body || {});
    return reply.send(ApiResponse.success(data));
  };

  webhook = async (request, reply) => {
    const { provider, externalEventId, eventType, payload } = request.body || {};
    const result = await this.service.processWebhook({
      provider: provider || request.headers["x-provider"] || "RAZORPAY",
      externalEventId: externalEventId || request.headers["x-webhook-id"],
      eventType,
      payload: payload || request.body,
    });
    return reply.send(ApiResponse.success(result));
  };
}

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

  fastify.post("/payments/webhook", {
    handler: controller.webhook,
  });
}
