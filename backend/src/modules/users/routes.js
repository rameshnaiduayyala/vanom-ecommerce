import { prisma } from "../../infrastructure/database/prisma.js";

export default async function userRoutes(fastify, options) {
  fastify.get("/users/profile", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        include: { profile: true, roles: { include: { role: true } } },
      });
      const { passwordHash, ...sanitized } = user;
      return reply.send({ success: true, data: sanitized });
    },
  });

  fastify.patch("/users/profile", {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { firstName, lastName, phone } = request.body || {};
      const updated = await prisma.user.update({
        where: { id: request.user.id },
        data: { firstName, lastName, phone },
      });
      const { passwordHash, ...sanitized } = updated;
      return reply.send({ success: true, data: sanitized });
    },
  });
}
