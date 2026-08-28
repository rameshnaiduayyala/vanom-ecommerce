import { BulkOrderService } from "./service.js";

export class BulkOrderController {
  constructor(service = new BulkOrderService()) {
    this.service = service;
  }

  create = async (request, reply) => {
    const data = await this.service.createBulkOrder(request.user, request.body);
    return reply.status(201).send({ success: true, data });
  };

  list = async (request, reply) => {
    const data = await this.service.listBulkOrders(request.user, request.query);
    return reply.send({ success: true, data });
  };

  getById = async (request, reply) => {
    const data = await this.service.getBulkOrderById(request.params.id, request.user);
    return reply.send({ success: true, data });
  };

  submit = async (request, reply) => {
    const data = await this.service.submitBulkOrder(request.params.id, request.user);
    return reply.send({ success: true, data });
  };
}
