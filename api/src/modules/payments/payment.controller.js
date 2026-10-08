import * as paymentService from "./payment.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function create(request, reply) {
  const data = await paymentService.createPaymentIntent({
    orderId: request.body.orderId,
    provider: request.body.provider,
    userId: request.user?.sub
  });

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Payment intent created successfully",
    data
  });
}

export async function createCheckoutSession(request, reply) {
  const data = await paymentService.createCheckoutSession({
    orderId: request.body.orderId,
    userId: request.user?.sub || null,
    successUrl: request.body.successUrl || null,
    cancelUrl: request.body.cancelUrl || null
  });

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Stripe checkout session initialized successfully",
    data
  });
}

export async function capture(request, reply) {
  const data = await paymentService.capturePayment(request.params.paymentId, {
    ...request.body,
    user: request.user
  });
  return sendSuccess(reply, {
    message: "Payment captured successfully",
    data
  });
}

export async function refund(request, reply) {
  const data = await paymentService.refundPayment(request.params.paymentId, request.body);
  return sendSuccess(reply, {
    message: "Payment refunded successfully",
    data
  });
}

export async function webhook(request, reply) {
  const signature = request.headers["stripe-signature"] || null;
  const rawBody = request.rawBody || null;
  const data = await paymentService.processWebhook(request.body, signature, rawBody);
  return sendSuccess(reply, {
    message: "Webhook processed successfully",
    data
  });
}
