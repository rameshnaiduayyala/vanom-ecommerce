import * as orderService from "./order.service.js";
import * as checkoutService from "./checkout.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { getPagination, getPaginationMeta } from "../../common/utils/pagination.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function create(request, reply) {
  // Automatically route through the enterprise checkout flow with PENDING_PAYMENT & Stripe Tax
  const result = await checkoutService.processCheckout({
    userId: request.user.sub,
    ...request.body
  });
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: MESSAGES.ORDER_CREATED,
    data: result
  });
}

export async function checkout(request, reply) {
  const result = await checkoutService.processCheckout({
    userId: request.user.sub,
    ...request.body
  });
  return sendSuccess(reply, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Order created with PENDING_PAYMENT, Stripe clientSecret generated",
    data: result
  });
}

export async function calculateTax(request, reply) {
  const result = await checkoutService.estimateStripeTax(request.body);
  return sendSuccess(reply, {
    message: "Stripe sales tax calculated successfully",
    data: result
  });
}

export async function list(request, reply) {
  const pagination = getPagination(request.query);
  const result = await orderService.listOrders({
    ...pagination,
    userId: request.user.role === "SUPERADMIN" ? null : request.user.sub,
    status: request.query.status
  });
  return sendSuccess(reply, {
    message: MESSAGES.ORDERS_FETCHED,
    data: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total)
  });
}

export async function getById(request, reply) {
  const userId = request.user.role === "SUPERADMIN" ? null : request.user.sub;
  const order = await orderService.getOrderById(request.params.id, userId);
  return sendSuccess(reply, { message: MESSAGES.ORDER_FETCHED, data: order });
}

export async function updateStatus(request, reply) {
  const order = await orderService.updateStatus(request.params.id, request.body.status);
  return sendSuccess(reply, { message: MESSAGES.ORDER_UPDATED, data: order });
}

export async function remove(request, reply) {
  await orderService.deleteOrder(request.params.id);
  return sendSuccess(reply, { message: MESSAGES.ORDER_DELETED, data: null });
}

export async function downloadInvoice(request, reply) {
  const { getOrderInvoice } = await import("../invoice/invoice.controller.js");
  return getOrderInvoice(request, reply);
}
