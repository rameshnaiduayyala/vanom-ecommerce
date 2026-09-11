import { TaxService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";

export class TaxController {
  constructor(service = new TaxService()) {
    this.service = service;
  }

  calculate = async (request, reply) => {
    const {
      countryCode,
      regionCode,
      postalCode,
      address,
      items,
      provider,
      taxExemptionNo,
    } = request.body || {};

    const isB2BApproved =
      request.user?.customerType === "B2B" &&
      request.user?.companyMembers?.some((m) => m.company?.status === "APPROVED");

    const result = await this.service.calculateTax({
      countryCode: countryCode || "US",
      regionCode,
      postalCode,
      address,
      items: items || [],
      customerType: request.user?.customerType || "B2C",
      isB2BApproved,
      taxExemptionNo,
      provider,
    });

    return reply.send(ApiResponse.success(result));
  };
}
