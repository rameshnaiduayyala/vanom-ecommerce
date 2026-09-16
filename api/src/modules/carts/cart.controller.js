import * as cartService from "./cart.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function get(request, reply) {
  const cart = await cartService.getCart(request.user.sub);
  return sendSuccess(reply, { message: MESSAGES.CART_FETCHED, data: cart });
}

export async function addItem(request, reply) {
  const cart = await cartService.addItem(request.user.sub, request.body);
  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.CART_ITEM_ADDED, data: cart });
}

export async function updateItem(request, reply) {
  const cart = await cartService.updateItem(request.user.sub, request.params.itemId, request.body.quantity);
  return sendSuccess(reply, { message: MESSAGES.CART_ITEM_UPDATED, data: cart });
}

export async function removeItem(request, reply) {
  const cart = await cartService.removeItem(request.user.sub, request.params.itemId);
  return sendSuccess(reply, { message: MESSAGES.CART_ITEM_REMOVED, data: cart });
}

export async function clear(request, reply) {
  const cart = await cartService.clearCart(request.user.sub);
  return sendSuccess(reply, { message: MESSAGES.CART_CLEARED, data: cart });
}
