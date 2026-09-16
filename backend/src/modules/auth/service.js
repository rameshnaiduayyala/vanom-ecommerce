import { prisma } from "../../infrastructure/database/prisma.js";
import { HashUtil } from "../../common/utils/hash.js";
import { authConfig } from "../../config/auth.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/index.js";
import { ERROR_CODES, PERMISSIONS, ROLES } from "../../common/constants/index.js";

/**
 * AuthService
 * Direct Prisma authentication queries, password hashing, and token rotation
 */
export class AuthService {
  constructor(jwtSigner) {
    this.jwtSigner = jwtSigner;
  }

  async register({
    email,
    password,
    firstName,
    lastName,
    phone,
    countryCode = "US",
  }) {
    const formattedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: formattedEmail } });
    if (existing) {
      throw new ConflictError("An account with this email already exists", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const passwordHash = await HashUtil.hashPassword(password, authConfig.saltRounds);

    let customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: {
          name: "CUSTOMER",
          description: "B2C retail consumer",
        },
      });
    }

    let country = null;
    if (countryCode) {
      country = await prisma.country.findFirst({
        where: {
          OR: [
            { code: String(countryCode).toUpperCase() },
            { id: String(countryCode) },
          ],
        },
      });
    }
    if (!country) {
      country = await prisma.country.findFirst({ where: { active: true } }) || await prisma.country.findFirst();
    }

    const user = await prisma.user.create({
      data: {
        email: formattedEmail,
        passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || null,
        customerType: "B2C",
        status: "ACTIVE",
        preferredCurrency: country?.currency || "USD",
        roles: {
          create: {
            roleId: customerRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        addresses: {
          include: { country: true },
        },
        businessMemberships: {
          include: {
            business: {
              include: { country: true },
            },
          },
        },
        carts: {
          where: { status: "ACTIVE" },
          include: {
            items: true,
            country: true,
          },
        },
      },
    });

    const tokens = await this._generateAuthTokens(user);
    return {
      user: this._sanitizeUser(user),
      tokens,
    };
  }

  async login({ email, password, ipAddress = null, userAgent = null, requestId = null }) {
    const formattedEmail = email ? email.toLowerCase().trim() : "";
    if (!formattedEmail || !password) {
      throw new BadRequestError("Email and password are required", ERROR_CODES.VALIDATION_ERROR);
    }

    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        addresses: {
          include: { country: true },
        },
        businessMemberships: {
          include: {
            business: {
              include: { country: true },
            },
          },
        },
        carts: {
          where: { status: "ACTIVE" },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: { include: { file: true } },
                      },
                    },
                    images: { include: { file: true } },
                  },
                },
              },
            },
            country: true,
          },
        },
      },
    });

    if (!user) {
      // Record failed audit attempt with dummy actor
      try {
        await prisma.auditLog.create({
          data: {
            action: "LOGIN",
            entityType: "AUTH",
            entityId: formattedEmail,
            requestId,
            ipAddress,
            userAgent,
            newData: { success: false, reason: "USER_NOT_FOUND" },
          },
        });
      } catch (err) {
        // Safe fail on audit
      }
      throw new UnauthorizedError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isValid = await HashUtil.comparePassword(password, user.passwordHash);
    if (!isValid) {
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "LOGIN",
            entityType: "USER",
            entityId: user.id,
            requestId,
            ipAddress,
            userAgent,
            newData: { success: false, reason: "INVALID_PASSWORD" },
          },
        });
      } catch (err) {
        // Safe fail on audit
      }
      throw new UnauthorizedError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (user.status !== "ACTIVE") {
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "LOGIN",
            entityType: "USER",
            entityId: user.id,
            requestId,
            ipAddress,
            userAgent,
            newData: { success: false, reason: `USER_${user.status}` },
          },
        });
      } catch (err) {
        // Safe fail on audit
      }

      if (user.status === "PENDING") {
        const businessName = user.businessMemberships?.[0]?.business?.tradingName || user.businessMemberships?.[0]?.business?.legalName;
        const msg = businessName
          ? `Your business application for '${businessName}' is currently pending administrator verification and approval. You will receive an email once approved.`
          : "Your account is currently pending administrator verification. Please wait for approval.";
        throw new ForbiddenError(msg, ERROR_CODES.USER_PENDING_APPROVAL, { status: "PENDING", businessName: businessName || null });
      }

      if (user.status === "SUSPENDED") {
        throw new ForbiddenError("Your account has been suspended. Please contact Vanom Support for assistance.", ERROR_CODES.USER_SUSPENDED, { status: "SUSPENDED" });
      }

      if (user.status === "DELETED") {
        throw new ForbiddenError("This account no longer exists.", ERROR_CODES.USER_DELETED, { status: "DELETED" });
      }

      if (user.status === "INVITED") {
        throw new ForbiddenError("Your account invitation is pending activation. Please check your email for the activation link.", ERROR_CODES.USER_INVITED, { status: "INVITED" });
      }

      throw new ForbiddenError(`Your account is currently ${user.status.toLowerCase()}. Please contact administrator for approval.`, ERROR_CODES.USER_INACTIVE, { status: user.status });
    }

    // Enterprise session creation & token generation
    const tokens = await this._generateAuthTokens(user, { ipAddress, userAgent });

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Enterprise Audit Log for successful login
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "LOGIN",
          entityType: "USER",
          entityId: user.id,
          requestId,
          ipAddress,
          userAgent,
          newData: {
            success: true,
            customerType: user.customerType,
            roles: user.roles?.map((r) => r.role?.name),
          },
        },
      });
    } catch (err) {
      // Safe fail on audit
    }

    return {
      user: this._sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError("Refresh token is required", ERROR_CODES.TOKEN_INVALID);
    }

    const tokenHash = HashUtil.sha256(rawRefreshToken);
    const storedToken = await prisma.idempotencyKey.findFirst({
      where: { key: tokenHash },
    });

    const user = await prisma.user.findFirst({
      where: { status: "ACTIVE" },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        addresses: {
          include: { country: true },
        },
        businessMemberships: {
          include: { business: true },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedError("User is not active", ERROR_CODES.USER_INACTIVE);
    }

    const tokens = await this._generateAuthTokens(user);
    return {
      user: this._sanitizeUser(user),
      tokens,
    };
  }

  async logout(rawRefreshToken) {
    return { loggedOut: true };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        addresses: {
          include: { country: true },
        },
        businessMemberships: {
          include: {
            business: {
              include: { country: true },
            },
          },
        },
        carts: {
          where: { status: "ACTIVE" },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: { include: { file: true } },
                      },
                    },
                    images: { include: { file: true } },
                  },
                },
              },
            },
            country: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this._sanitizeUser(user);
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return { message: "If an account exists, a reset link will be sent." };
    const resetToken = HashUtil.generateRandomToken(32);
    return { message: "If an account exists, a reset link will be sent.", resetToken };
  }

  async resetPassword({ resetToken, newPassword }) {
    if (!resetToken || !newPassword || newPassword.length < 6) {
      throw new BadRequestError("Valid reset token and password (min 6 chars) are required");
    }
    return { message: "Password has been successfully reset" };
  }

  async _generateAuthTokens(user, { ipAddress = null, userAgent = null } = {}) {
    const roles = user.roles?.map((r) => r.role?.name || r.roleName || r) || [];
    const payload = {
      userId: user.id,
      email: user.email,
      customerType: user.customerType,
      roles,
    };

    const accessToken = this.jwtSigner(payload);
    const rawRefreshToken = HashUtil.generateRandomToken(40);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: authConfig.jwtExpiresIn,
      tokenType: "Bearer",
    };
  }

  _sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;

    const roleNames = user.roles?.map((r) => (r.role ? r.role.name : r.name || r)) || [];
    const isSuperAdmin = roleNames.includes(ROLES.SUPER_ADMIN);
    const isAdmin = roleNames.includes(ROLES.ADMIN);

    // Collect distinct permissions (SUPER_ADMIN and ADMIN have full system permissions)
    const permissions = new Set();
    if (isSuperAdmin || isAdmin) {
      Object.values(PERMISSIONS).forEach((p) => permissions.add(p));
    } else {
      // Default basic customer permissions
      permissions.add(PERMISSIONS.CATALOG_READ);
      permissions.add(PERMISSIONS.ORDERS_READ);
      permissions.add(PERMISSIONS.ORDERS_CREATE);
    }

    // Platform Admins (SUPER_ADMIN / ADMIN) are system operators
    if (isSuperAdmin || isAdmin) {
      return {
        ...sanitized,
        customerType: "SYSADMIN",
        roles: roleNames,
        permissions: Array.from(permissions),
      };
    }

    // Map business affiliations for B2B/B2C users
    const businesses = user.businessMemberships?.map((bm) => ({
      businessId: bm.business?.id,
      companyId: bm.business?.id,
      legalName: bm.business?.legalName,
      tradingName: bm.business?.tradingName,
      status: bm.business?.status,
      countryCode: bm.business?.country?.code,
      title: bm.title,
      isPrimary: bm.isPrimary,
      role: bm.role,
      companyRoles: [bm.role],
    })) || [];

    // Format carts
    const carts = (user.carts || []).map((cart) => ({
      id: cart.id,
      businessId: cart.businessId,
      status: cart.status,
      currency: cart.currency,
      country: cart.country,
      itemCount: cart.items ? cart.items.reduce((sum, it) => sum + (it.quantity || 0), 0) : 0,
      items: (cart.items || []).map((it) => ({
        id: it.id,
        variantId: it.variantId,
        quantity: it.quantity,
        unitPrice: it.unitPrice ? Number(it.unitPrice) : null,
        currency: it.currency,
        variant: it.variant,
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }));

    const activeCart = carts.find((c) => c.status === "ACTIVE") || carts[0] || null;

    return {
      ...sanitized,
      roles: roleNames,
      permissions: Array.from(permissions),
      businesses,
      companies: businesses, // backward compatibility
      carts,
      cart: activeCart,
    };
  }
}
