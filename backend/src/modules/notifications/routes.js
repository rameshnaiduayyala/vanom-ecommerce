import { NotificationController } from "./controller.js";

export default async function notificationRoutes(fastify, options) {
  const controller = new NotificationController();

  fastify.get("/notifications", {
    preHandler: [fastify.authenticate],
    handler: controller.getUserNotifications,
  });

  fastify.patch("/notifications/:id/read", {
    preHandler: [fastify.authenticate],
    handler: controller.markAsRead,
  });
}
