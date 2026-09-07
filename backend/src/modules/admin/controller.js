import { AdminService } from "./service.js";

export class AdminController {
  constructor(service = new AdminService()) {
    this.service = service;
  }

  getMetrics = async (req, reply) => {
    const data = await this.service.getMetrics();
    return reply.send({ success: true, data });
  };

  listProducts = async (req, reply) => {
    const data = await this.service.listProducts();
    return reply.send({ success: true, data });
  };

  listCategories = async (req, reply) => {
    const data = await this.service.listCategories();
    return reply.send({ success: true, data });
  };

  listOrders = async (req, reply) => {
    const data = await this.service.listOrders();
    return reply.send({ success: true, data });
  };

  listCompanies = async (req, reply) => {
    const data = await this.service.listCompanies();
    return reply.send({ success: true, data });
  };

  listUsers = async (req, reply) => {
    const data = await this.service.listUsers();
    return reply.send({ success: true, data });
  };

  listInventory = async (req, reply) => {
    const data = await this.service.listInventory();
    return reply.send({ success: true, data });
  };

  listQuotes = async (req, reply) => {
    const data = await this.service.listQuotes();
    return reply.send({ success: true, data });
  };

  listPayments = async (req, reply) => {
    const data = await this.service.listPayments();
    return reply.send({ success: true, data });
  };

  getReports = async (req, reply) => {
    const data = await this.service.getReports();
    return reply.send({ success: true, data });
  };
}
