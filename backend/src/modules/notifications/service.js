import { prisma } from "../../infrastructure/database/prisma.js";
import { EmailProvider, SmsProvider, PushProvider } from "./providers/index.js";

export class NotificationRepository {
  static async createNotification({ userId, channel, title, body, data }, tx = null) {
    const db = tx || prisma;
    return db.notification.create({
      data: {
        userId,
        channel,
        title,
        body,
        data,
        status: "SENT",
        sentAt: new Date(),
      },
    });
  }

  static async listUserNotifications(userId, { page = 1, limit = 20 }) {
    const where = { userId };
    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  static async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date(), status: "READ" },
    });
  }
}

export class NotificationService {
  constructor() {
    this.emailProvider = new EmailProvider();
    this.smsProvider = new SmsProvider();
    this.pushProvider = new PushProvider();
  }

  async sendNotification({ userId, channel = "EMAIL", title, body, data = {} }) {
    let deliveryResult = null;
    try {
      if (channel === "EMAIL") {
        deliveryResult = await this.emailProvider.send({ subject: title, html: body, text: body });
      } else if (channel === "SMS") {
        deliveryResult = await this.smsProvider.send({ message: body });
      } else if (channel === "PUSH") {
        deliveryResult = await this.pushProvider.send({ toUserId: userId, title, body, data });
      }
    } catch (err) {
      console.error(`Failed to dispatch ${channel} notification:`, err.message);
    }

    return NotificationRepository.createNotification({
      userId,
      channel,
      title,
      body,
      data: { ...data, deliveryResult },
    });
  }

  async getUserNotifications(userId, params) {
    return NotificationRepository.listUserNotifications(userId, params);
  }

  async markAsRead(id, userId) {
    return NotificationRepository.markAsRead(id, userId);
  }
}
