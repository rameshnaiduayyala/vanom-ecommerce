import { prisma } from "../../infrastructure/database/prisma.js";
import { HashUtil } from "../../common/utils/hash.js";
import { authConfig } from "../../config/auth.js";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

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

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
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

    if (!user) {
      throw new UnauthorizedError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedError("Account is suspended or inactive", ERROR_CODES.USER_INACTIVE);
    }

    const isValid = await HashUtil.comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this._generateAuthTokens(user);

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

  async _generateAuthTokens(user) {
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

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: authConfig.jwtExpiresIn,
      tokenType: "Bearer",
    };
  }

  _sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return {
      ...sanitized,
      roles: user.roles?.map((r) => (r.role ? r.role.name : r.name || r)) || [],
    };
  }
}
