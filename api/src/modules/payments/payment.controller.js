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

export async function capture(request, reply) {
  const data = await paymentService.capturePayment(request.params.paymentId, request.body);
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
  const data = await paymentService.processWebhook(request.body);
  return sendSuccess(reply, {
    message: "Webhook processed successfully",
    data
  });
}
