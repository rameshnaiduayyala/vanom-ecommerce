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
              role: true,
            },
          },
          businessMemberships: {
            include: {
              business: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedError("User account not found");
      }

      if (user.status !== "ACTIVE") {
        if (user.status === "PENDING") {
          const companyName = user.businessMemberships?.[0]?.business?.legalName || user.businessMemberships?.[0]?.business?.tradeName;
          const msg = companyName
            ? `Your business account for '${companyName}' is currently pending administrator verification and approval.`
            : "Your account is currently pending administrator verification.";
          throw new UnauthorizedError(msg);
        }
        if (user.status === "SUSPENDED") {
          throw new UnauthorizedError("Your account has been suspended. Please contact Vanom Support.");
        }
        if (user.status === "DELETED") {
          throw new UnauthorizedError("This account is no longer active.");
        }
        throw new UnauthorizedError(`Your account is ${user.status.toLowerCase()}. Please contact administrator.`);
      }

      // Flatten permissions for high-performance RBAC evaluations
      const roleNames = user.roles.map(ur => ur.role.name);
      const isSuperAdmin = roleNames.includes("SUPER_ADMIN") || roleNames.includes("ADMIN");

      const permissions = new Set();
      if (isSuperAdmin) {
        const { PERMISSIONS } = await import("../common/constants/permissions.js");
        Object.values(PERMISSIONS).forEach(p => permissions.add(p));
      } else {
        const { DEFAULT_ROLE_PERMISSIONS } = await import("../common/constants/permissions.js").catch(() => ({ DEFAULT_ROLE_PERMISSIONS: {} }));
        if (DEFAULT_ROLE_PERMISSIONS) {
          roleNames.forEach(r => {
            const rolePerms = DEFAULT_ROLE_PERMISSIONS[r] || [];
            rolePerms.forEach(p => permissions.add(p));
          });
        }
      }

      request.user = {
        id: user.id,
        email: user.email,
        customerType: user.customerType,
        status: user.status,
        roles: roleNames,
        permissions: Array.from(permissions),
        companyMembers: user.businessMemberships,
        businessMemberships: user.businessMemberships,
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
