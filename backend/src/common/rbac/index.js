import { ForbiddenError, UnauthorizedError } from "../errors/index.js";
import { ROLES } from "../constants/roles.js";

export class RbacGuard {
  static hasRole(user, allowedRoles = []) {
    if (!user || !user.roles) return false;
    const userRoleNames = user.roles.map(r => (typeof r === "string" ? r : r.role ? r.role.name : r.name));
    if (userRoleNames.includes(ROLES.SUPER_ADMIN)) return true;
    return allowedRoles.some(role => userRoleNames.includes(role));
  }

  static hasPermission(user, requiredPermission) {
    if (!user) return false;
    if (this.hasRole(user, [ROLES.SUPER_ADMIN])) return true;

    const userPermissions = new Set();
    if (Array.isArray(user.permissions)) {
      user.permissions.forEach(p => userPermissions.add(typeof p === "string" ? p : p.code));
    }
    if (Array.isArray(user.roles)) {
      user.roles.forEach(userRole => {
        const role = userRole.role || userRole;
        if (role.permissions) {
          role.permissions.forEach(rp => {
            const perm = rp.permission || rp;
            if (perm.code) userPermissions.add(perm.code);
          });
        }
      });
    }

    return userPermissions.has(requiredPermission);
  }

  static requireAuth() {
    return async (request, reply) => {
      if (!request.user) {
        throw new UnauthorizedError("Authentication required");
      }
    };
  }

  static requireRoles(...allowedRoles) {
    return async (request, reply) => {
      if (!request.user) {
        throw new UnauthorizedError("Authentication required");
      }
      if (!RbacGuard.hasRole(request.user, allowedRoles)) {
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
      }
    };
  }

  static requirePermissions(...requiredPermissions) {
    return async (request, reply) => {
      if (!request.user) {
        throw new UnauthorizedError("Authentication required");
      }
      for (const perm of requiredPermissions) {
        if (!RbacGuard.hasPermission(request.user, perm)) {
          throw new ForbiddenError(`Access denied. Required permission: ${perm}`);
        }
      }
    };
  }
}
