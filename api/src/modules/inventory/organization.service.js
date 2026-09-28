import { prisma } from "../../config/prisma.js";

/**
 * Resolves the organization for a user/session.
 * Never trust tenant ID from the frontend.
 * If user does not have an assigned organization (e.g. system bootstrap or initial superadmin),
 * safely finds or creates the default root organization.
 */
export async function resolveUserOrganization(user, tx = prisma) {
  if (user?.organizationId) {
    const org = await tx.organization.findUnique({
      where: { id: user.organizationId }
    });
    if (org && org.isActive) {
      return org;
    }
  }

  // Ensure default root organization exists
  let defaultOrg = await tx.organization.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" }
  });

  if (!defaultOrg) {
    defaultOrg = await tx.organization.create({
      data: {
        name: "Vanom Global Enterprise",
        slug: "vanom-global",
        code: "VANOM-HQ",
        isActive: true
      }
    });
  }

  // If user exists and doesn't have organizationId, link user to default organization
  if (user?.id && !user.organizationId) {
    try {
      await tx.user.update({
        where: { id: user.id },
        data: { organizationId: defaultOrg.id }
      });
    } catch {}
  }

  return defaultOrg;
}

export async function getOrganizationById(id) {
  return prisma.organization.findUnique({ where: { id } });
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    orderBy: { name: "asc" }
  });
}
