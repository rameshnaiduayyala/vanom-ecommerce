import { NotificationService } from "./service.js";

export class NotificationController {
  constructor(service = new NotificationService()) {
    this.service = service;
  }

  getUserNotifications = async (request, reply) => {
    const page = parseInt(request.query.page || "1", 10);
    const limit = parseInt(request.query.limit || "20", 10);
    const data = await this.service.getUserNotifications(request.user.id, { page, limit });
    return reply.send({ success: true, ...data });
  };

  markAsRead = async (request, reply) => {
    await this.service.markAsRead(request.params.id, request.user.id);
    return reply.send({ success: true, message: "Marked as read" });
  };
}
