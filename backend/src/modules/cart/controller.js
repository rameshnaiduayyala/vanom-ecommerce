import { CartService } from "./service.js";

export class CartController {
  constructor(service = new CartService()) {
    this.service = service;
  }

  getCart = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || "IN";
    const currencyCode = request.headers["x-currency-code"] || "INR";
    const data = await this.service.getCart(request.user, request.query.companyId, countryCode, currencyCode);
    return reply.send({ success: true, data });
  };

  addItem = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || "IN";
    const currencyCode = request.headers["x-currency-code"] || "INR";
    const data = await this.service.addItem(request.user, {
      ...request.body,
      countryCode,
      currencyCode,
    });
    return reply.status(201).send({ success: true, data });
  };

  updateItem = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || "IN";
    const currencyCode = request.headers["x-currency-code"] || "INR";
    const data = await this.service.updateItemQuantity(
      request.user,
      request.params.id,
      request.body.quantity,
      countryCode,
      currencyCode
    );
    return reply.send({ success: true, data });
  };

  removeItem = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || "IN";
    const currencyCode = request.headers["x-currency-code"] || "INR";
    const data = await this.service.removeItem(request.user, request.params.id, countryCode, currencyCode);
    return reply.send({ success: true, data });
  };

  clearCart = async (request, reply) => {
    const data = await this.service.clearCart(request.user, request.query.companyId);
    return reply.send({ success: true, data });
  };
}
