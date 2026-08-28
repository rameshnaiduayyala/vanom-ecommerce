import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { authConfig } from "../config/auth.js";
import { prisma } from "../infrastructure/database/prisma.js";
import { UnauthorizedError } from "../common/errors/index.js";

async function authPlugin(fastify, options) {
  fastify.register(fastifyJwt, {
    secret: authConfig.jwtSecret,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
      const decoded = request.user;
      if (!decoded || !decoded.userId) {
        throw new UnauthorizedError("Invalid token payload");
      }

      // Authoritative database load of user, roles, permissions and company affiliations
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
          companyMembers: {
            include: {
              company: true,
              roles: true,
            },
          },
        },
      });

      if (!user || user.status !== "ACTIVE") {
        throw new UnauthorizedError("User account is inactive or disabled");
      }

      // Flatten permissions for high-performance RBAC evaluations
      const permissions = new Set();
      user.roles.forEach(ur => {
        ur.role.permissions.forEach(rp => {
          permissions.add(rp.permission.code);
        });
      });

      request.user = {
        id: user.id,
        email: user.email,
        customerType: user.customerType,
        status: user.status,
        roles: user.roles.map(ur => ur.role.name),
        permissions: Array.from(permissions),
        companyMembers: user.companyMembers,
        rawUser: user,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        throw err;
      }
      throw new UnauthorizedError(err.message || "Invalid or expired authorization token");
    }
  });

  fastify.decorate("optionalAuthenticate", async function (request, reply) {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      try {
        await fastify.authenticate(request, reply);
      } catch (e) {
        // Token was invalid or expired, continue as unauthenticated guest
        request.user = null;
      }
    } else {
      request.user = null;
    }
  });
}

export default fp(authPlugin);
