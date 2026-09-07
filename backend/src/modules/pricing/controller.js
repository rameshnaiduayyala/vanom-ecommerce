import { PricingService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class PricingController {
  constructor(service = new PricingService()) {
    this.service = service;
  }

  resolvePrice = async (request, reply) => {
    const { productId, variantId, quantity, countryCode, currencyCode, companyId } = request.query || {};
    const result = await this.service.resolvePrice({
      productId,
      variantId,
      quantity: quantity ? parseInt(quantity, 10) : 1,
      countryCode: countryCode || request.headers["x-country-code"] || "IN",
      currencyCode: currencyCode || request.headers["x-currency-code"] || "INR",
      user: request.user,
      companyId,
    });
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };
}
