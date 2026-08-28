import { ShippingService } from "./service.js";

export class ShippingController {
  constructor(service = new ShippingService()) {
    this.service = service;
  }

  list = async (request, reply) => {
    const data = await this.service.listShipments(request.user, request.query);
    return reply.send({ success: true, ...data });
  };

  getById = async (request, reply) => {
    const data = await this.service.getShipmentById(request.params.id, request.user);
    return reply.send({ success: true, data });
  };

  getTracking = async (request, reply) => {
    const data = await this.service.getTracking(request.params.id, request.user);
    return reply.send({ success: true, data });
  };
}
