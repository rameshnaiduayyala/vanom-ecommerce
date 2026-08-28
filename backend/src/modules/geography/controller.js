import { GeographyService } from "./service.js";

export class GeographyController {
  constructor(service = new GeographyService()) {
    this.service = service;
  }

  getCountries = async (request, reply) => {
    const data = await this.service.getCountries();
    return reply.send({ success: true, data });
  };

  getCountry = async (request, reply) => {
    const data = await this.service.getCountry(request.params.id);
    return reply.send({ success: true, data });
  };

  getCurrencies = async (request, reply) => {
    const data = await this.service.getCurrencies();
    return reply.send({ success: true, data });
  };
}
