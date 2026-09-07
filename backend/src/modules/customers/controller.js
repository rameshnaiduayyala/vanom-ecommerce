import { CustomerService } from "./service.js";

export class CustomerController {
  constructor(service = new CustomerService()) {
    this.service = service;
  }

  getAddresses = async (req, reply) => {
    const data = await this.service.getAddresses(req.user.id);
    return reply.send({ success: true, data });
  };

  getAddressById = async (req, reply) => {
    const data = await this.service.getAddressById(req.user.id, req.params.id);
    if (!data) return reply.status(404).send({ success: false, message: "Address not found" });
    return reply.send({ success: true, data });
  };

  addAddress = async (req, reply) => {
    const data = await this.service.addAddress(req.user.id, req.body);
    return reply.status(201).send({ success: true, data });
  };

  updateAddress = async (req, reply) => {
    const data = await this.service.updateAddress(req.user.id, req.params.id, req.body);
    return reply.send({ success: true, data });
  };

  deleteAddress = async (req, reply) => {
    await this.service.deleteAddress(req.user.id, req.params.id);
    return reply.send({ success: true, message: "Address deleted" });
  };

  getProfile = async (req, reply) => {
    const data = await this.service.getProfile(req.user.id);
    return reply.send({ success: true, data });
  };

  updateProfile = async (req, reply) => {
    const data = await this.service.updateProfile(req.user.id, req.body);
    return reply.send({ success: true, data });
  };
}
