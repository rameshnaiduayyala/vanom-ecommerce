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

  updateOrderStatus = async (req, reply) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const data = await this.service.updateOrderStatus(id, status);
    return reply.send({ success: true, data });
  };

  listCompanies = async (req, reply) => {
    const data = await this.service.listCompanies();
    return reply.send({ success: true, data });
  };

  listBusinessApplications = async (req, reply) => {
    const data = await this.service.listBusinessApplications();
    return reply.send({ success: true, data });
  };

  approveBusinessApplication = async (req, reply) => {
    const { id } = req.params;
    const { notes } = req.body || {};
    const data = await this.service.approveBusinessApplication(id, notes);
    return reply.send({ success: true, data });
  };

  rejectBusinessApplication = async (req, reply) => {
    const { id } = req.params;
    const { reason } = req.body || {};
    const data = await this.service.rejectBusinessApplication(id, reason);
    return reply.send({ success: true, data });
  };

  listUsers = async (req, reply) => {
    const data = await this.service.listUsers();
    return reply.send({ success: true, data });
  };

  createUser = async (req, reply) => {
    const data = await this.service.createUser(req.body);
    return reply.status(201).send({ success: true, data });
  };

  updateUser = async (req, reply) => {
    const { id } = req.params;
    const data = await this.service.updateUser(id, req.body);
    return reply.send({ success: true, data });
  };

  deleteUser = async (req, reply) => {
    const { id } = req.params;
    const data = await this.service.deleteUser(id);
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

  listAuditLogs = async (req, reply) => {
    const data = await this.service.listAuditLogs();
    return reply.send({ success: true, data });
  };
}
