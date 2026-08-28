import { describe, it, expect } from "vitest";
import { RbacGuard } from "../../src/common/rbac/index.js";
import { ROLES, PERMISSIONS } from "../../src/common/constants/index.js";

describe("RBAC Authorization Engine", () => {
  it("should permit Super Admin for any role requirement", () => {
    const user = {
      id: "u-1",
      roles: [{ role: { name: ROLES.SUPER_ADMIN } }],
    };
    expect(RbacGuard.hasRole(user, [ROLES.ADMIN, ROLES.FINANCE])).toBe(true);
  });

  it("should accurately match assigned user roles", () => {
    const user = {
      id: "u-2",
      roles: [{ role: { name: ROLES.COMPANY_ADMIN } }],
    };
    expect(RbacGuard.hasRole(user, [ROLES.COMPANY_ADMIN])).toBe(true);
    expect(RbacGuard.hasRole(user, [ROLES.ADMIN])).toBe(false);
  });

  it("should evaluate flattened permission sets", () => {
    const user = {
      id: "u-3",
      roles: [
        {
          role: {
            name: ROLES.INVENTORY_MANAGER,
            permissions: [
              { permission: { code: PERMISSIONS.INVENTORY_ADJUST } },
              { permission: { code: PERMISSIONS.INVENTORY_READ } },
            ],
          },
        },
      ],
    };

    expect(RbacGuard.hasPermission(user, PERMISSIONS.INVENTORY_ADJUST)).toBe(true);
    expect(RbacGuard.hasPermission(user, PERMISSIONS.COMPANIES_APPROVE)).toBe(false);
  });
});
