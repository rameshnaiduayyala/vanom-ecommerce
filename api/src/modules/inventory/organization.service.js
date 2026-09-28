import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

/**
 * Resolves the organization for a user/session.
 * Never trust tenant ID from the frontend.
 * Authoritatively verifies organization membership from database.
 * Non-superadmin users without an organization are strictly forbidden.
 */
export async function resolveUserOrganization(user, tx = prisma) {
  const userId = user?.sub || user?.id;
  if (!userId) {
    throw new AppError("Authentication required to resolve organization context", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
  }

  // Authoritatively resolve user's assigned organization from database
  const dbUser = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, organizationId: true }
  });

  if (dbUser?.organizationId) {
    const org = await tx.organization.findUnique({
      where: { id: dbUser.organizationId }
    });
    if (org && org.isActive) {
      return org;
    }
  }

  // Only SUPERADMIN is permitted to access or bootstrap the root organization
  const isSuperAdmin = dbUser?.role === "SUPERADMIN" || user?.role === "SUPERADMIN";
  if (isSuperAdmin) {
    let rootOrg = await tx.organization.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });
    if (!rootOrg) {
      rootOrg = await tx.organization.create({
        data: {
          name: "Vanom Global Enterprise",
          slug: "vanom-global",
          code: "VANOM-HQ",
          isActive: true
        }
      });
    }
    return rootOrg;
  }

  throw new AppError("Forbidden: User does not belong to an active organization", HTTP_STATUS.FORBIDDEN, "TENANT_ACCESS_DENIED");
}

export async function getOrganizationById(id) {
  return prisma.organization.findUnique({ where: { id } });
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    orderBy: { name: "asc" }
  });
}
