import * as paymentService from "./payment.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

function extractGuestToken(request) {
  return (
    request.headers["x-guest-order-token"] ||
    request.body?.guestAccessToken ||
    request.body?.guestToken ||
    null
  );
}

export async function create(request, reply) {
  const guestToken = extractGuestToken(request);
  const data = await paymentService.createPaymentIntent({
    orderId: request.body.orderId,
    provider: request.body.provider,
    user: request.user || null,
    userId: request.user?.sub || request.user?.id || null,
    guestToken,
    captureMethod: request.body.captureMethod || "automatic"
  });

  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Payment intent created successfully",
    data
  });
}

export async function createCheckoutSession(request, reply) {
  const guestToken = extractGuestToken(request);
  const data = await paymentService.createCheckoutSession({
    orderId: request.body.orderId,
    user: request.user || null,
    userId: request.user?.sub || request.user?.id || null,
    guestToken,
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
  const guestToken = extractGuestToken(request);
  const data = await paymentService.capturePayment(request.params.paymentId, {
    ...request.body,
    user: request.user || null,
    guestToken
  });
  return sendSuccess(reply, {
    message: "Payment captured successfully",
    data
  });
}

export async function refund(request, reply) {
  const data = await paymentService.refundPayment(request.params.paymentId, {
    ...request.body,
    user: request.user || null
  });
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
