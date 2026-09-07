import { UserService } from "./service.js";

export class UserController {
  constructor(service = new UserService()) {
    this.service = service;
  }

  getProfile = async (req, reply) => {
    const data = await this.service.getProfile(req.user.id);
    return reply.send({ success: true, data });
  };

  updateProfile = async (req, reply) => {
    const data = await this.service.updateProfile(req.user.id, req.body || {});
    return reply.send({ success: true, data });
  };
}
