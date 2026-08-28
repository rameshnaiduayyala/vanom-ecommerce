import { prisma } from "../../infrastructure/database/prisma.js";
import { RbacGuard } from "../../common/rbac/index.js";
import { ROLES, PERMISSIONS } from "../../common/constants/index.js";

export default async function adminRoutes(fastify, options) {
  fastify.get("/admin/dashboard", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: async (request, reply) => {
      const [
        totalUsers,
        totalCompanies,
        pendingVerifications,
        totalOrders,
        totalProducts,
        recentOrders,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.company.count(),
        prisma.verificationApplication.count({ where: { status: "UNDER_REVIEW" } }),
        prisma.order.count(),
        prisma.product.count({ where: { status: "ACTIVE" } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { currency: true, user: { select: { email: true, firstName: true } } },
        }),
      ]);

      return reply.send({
        success: true,
        data: {
          metrics: {
            totalUsers,
            totalCompanies,
            pendingVerifications,
            totalOrders,
            totalProducts,
          },
          recentOrders,
        },
      });
    },
  });

  fastify.get("/admin/users", {
    preHandler: [fastify.authenticate, RbacGuard.requireRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
    handler: async (request, reply) => {
      const page = parseInt(request.query.page || "1", 10);
      const limit = parseInt(request.query.limit || "20", 10);
      const [total, users] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: { roles: { include: { role: true } } },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      const sanitized = users.map(u => {
        const { passwordHash, ...rest } = u;
        return rest;
      });
      return reply.send({ success: true, data: sanitized, meta: { page, limit, total } });
    },
  });
}
