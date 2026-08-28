import { CheckoutService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class CheckoutController {
  constructor(service = new CheckoutService()) {
    this.service = service;
  }

  validate = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || request.body?.countryCode || "IN";
    const currencyCode = request.headers["x-currency-code"] || request.body?.currencyCode || "INR";
    const data = await this.service.validateCheckout(request.user, {
      ...request.body,
      countryCode,
      currencyCode,
    });
    return reply.send(ApiResponse.success(data));
  };

  placeOrder = async (request, reply) => {
    const countryCode = request.headers["x-country-code"] || request.body?.countryCode || "IN";
    const currencyCode = request.headers["x-currency-code"] || request.body?.currencyCode || "INR";
    const order = await this.service.placeOrder(
      request.user,
      {
        ...request.body,
        countryCode,
        currencyCode,
      },
      request.idempotencyKey
    );
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(order));
  };
}
