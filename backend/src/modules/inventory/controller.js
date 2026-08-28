import { InventoryService } from "./service.js";

export class InventoryController {
  constructor(service = new InventoryService()) {
    this.service = service;
  }

  getStock = async (request, reply) => {
    const data = await this.service.getStock(request.params.variantId);
    return reply.send({ success: true, data });
  };

  adjust = async (request, reply) => {
    const data = await this.service.adjustStock(request.body);
    return reply.status(201).send({ success: true, data });
  };
}
