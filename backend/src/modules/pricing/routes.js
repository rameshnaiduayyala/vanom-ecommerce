import { PriceResolver } from "./price-resolver.js";
import { PricingRepository } from "./pricing.repository.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class PricingService {
  async resolvePrice(context) {
    return PriceResolver.resolvePrice(context);
  }

  async getPackaging(variantId) {
    return PricingRepository.getPackagingForVariant(variantId);
  }
}

export class PricingController {
  constructor(service = new PricingService()) {
    this.service = service;
  }

  resolvePrice = async (request, reply) => {
    const { productId, variantId, quantity, countryCode, currencyCode, companyId } = request.query;
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

export default async function pricingRoutes(fastify, options) {
  const controller = new PricingController();

  fastify.get("/pricing/resolve", {
    preHandler: [fastify.optionalAuthenticate],
    handler: controller.resolvePrice,
  });
}
