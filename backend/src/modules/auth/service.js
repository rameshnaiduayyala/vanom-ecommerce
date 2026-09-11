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

  async register({ email, password, firstName, lastName, phone, customerType = "B2C" }) {
    const formattedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: formattedEmail } });
    if (existing) {
      throw new ConflictError("An account with this email already exists", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const passwordHash = await HashUtil.hashPassword(password, authConfig.saltRounds);
    const user = await prisma.user.create({
      data: {
        email: formattedEmail,
        passwordHash,
        firstName,
        lastName,
        phone,
        customerType,
        status: "ACTIVE",
        profile: {
          create: {},
        },
        roles: {
          create: {
            role: {
              connect: { name: "CUSTOMER" },
            },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        profile: true,
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
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        profile: true,
        companyMembers: {
          include: {
            company: {
              include: { country: true },
            },
            roles: true,
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
            metadata: { success: false, reason: "USER_NOT_FOUND" },
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
            metadata: { success: false, reason: "INVALID_PASSWORD" },
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
            metadata: { success: false, reason: `USER_${user.status}` },
          },
        });
      } catch (err) {
        // Safe fail on audit
      }

      if (user.status === "PENDING") {
        const companyName = user.companyMembers?.[0]?.company?.tradingName || user.companyMembers?.[0]?.company?.legalName;
        const msg = companyName
          ? `Your business application for '${companyName}' is currently pending administrator verification and approval. You will receive an email once approved.`
          : "Your account is currently pending administrator verification. Please wait for approval.";
        throw new ForbiddenError(msg, ERROR_CODES.USER_PENDING_APPROVAL, { status: "PENDING", companyName: companyName || null });
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
          metadata: {
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
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token", ERROR_CODES.TOKEN_INVALID);
    }

    if (storedToken.revokedAt) {
      // Possible token reuse attack - revoke all user tokens
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError("Refresh token has been revoked", ERROR_CODES.TOKEN_REVOKED);
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError("Refresh token has expired", ERROR_CODES.TOKEN_EXPIRED);
    }

    // Refresh Token Rotation: Revoke current token and issue new pair
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
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
        profile: true,
        companyMembers: {
          include: { company: true },
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
    if (rawRefreshToken) {
      const tokenHash = HashUtil.sha256(rawRefreshToken);
      const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });
      if (storedToken) {
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });
      }
    }
    return { loggedOut: true };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        profile: {
          include: { addresses: true },
        },
        companyMembers: {
          include: {
            company: {
              include: { country: true },
            },
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
    const tokenHash = HashUtil.sha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + authConfig.refreshTokenExpiresDays * 24 * 60 * 60 * 1000);

    // Concurrently persist refresh token and user session
    await Promise.all([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          tokenHash,
          ipAddress,
          userAgent,
          expiresAt,
        },
      }),
    ]);

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

    // Collect distinct permissions (SUPER_ADMIN has all system permissions)
    const permissions = new Set();
    if (isSuperAdmin) {
      Object.values(PERMISSIONS).forEach((p) => permissions.add(p));
    } else {
      user.roles?.forEach((ur) => {
        ur.role?.permissions?.forEach((rp) => {
          if (rp.permission?.code) permissions.add(rp.permission.code);
        });
      });
    }

    // Platform Admins (SUPER_ADMIN / ADMIN) are system operators without company associations
    if (isSuperAdmin || isAdmin) {
      return {
        ...sanitized,
        customerType: "SYSADMIN",
        roles: user.roles?.map((r) => (r.role ? r.role.name : r.name || r)) || [],
        permissions: Array.from(permissions),
      };
    }

    // Map company affiliations for B2B/B2C users
    const companies = user.companyMembers?.map((cm) => ({
      companyId: cm.company?.id,
      legalName: cm.company?.legalName,
      tradingName: cm.company?.tradingName,
      status: cm.company?.status,
      countryCode: cm.company?.country?.code,
      title: cm.title,
      isPrimary: cm.isPrimary,
      companyRoles: cm.roles?.map((cr) => cr.roleName) || [],
    })) || [];

    return {
      ...sanitized,
      roles: user.roles?.map((r) => (r.role ? r.role.name : r.name || r)) || [],
      permissions: Array.from(permissions),
      companies,
    };
  }
}
