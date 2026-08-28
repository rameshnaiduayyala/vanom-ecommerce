import { AuditService } from "./service.js";

export class AuditController {
  constructor(service = new AuditService()) {
    this.service = service;
  }

  list = async (request, reply) => {
    const page = parseInt(request.query.page || "1", 10);
    const limit = parseInt(request.query.limit || "50", 10);
    const result = await this.service.list({
      entityType: request.query.entityType,
      entityId: request.query.entityId,
      actorId: request.query.actorId,
      page,
      limit,
    });
    return reply.send({ success: true, ...result });
  };
}
