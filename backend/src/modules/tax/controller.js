import { TaxService } from "./service.js";

export class TaxController {
  constructor(service = new TaxService()) {
    this.service = service;
  }

  calculate = async (request, reply) => {
    const { countryCode, regionCode, items } = request.body || {};
    const result = await this.service.calculateTax({
      countryCode: countryCode || "IN",
      regionCode,
      items: items || [],
      customerType: request.user?.customerType || "B2C",
    });
    return reply.send({ success: true, data: result });
  };
}
