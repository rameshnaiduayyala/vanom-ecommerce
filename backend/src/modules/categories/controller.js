import { CategoryService } from "./service.js";

export class CategoryController {
  constructor(service = new CategoryService()) {
    this.service = service;
  }

  list = async (req, reply) => {
    const data = await this.service.list();
    return reply.send({ success: true, data });
  };

  getById = async (req, reply) => {
    const data = await this.service.getById(req.params.id);
    return reply.send({ success: true, data });
  };

  create = async (req, reply) => {
    const data = await this.service.create(req.body);
    return reply.status(201).send({ success: true, data });
  };
}
