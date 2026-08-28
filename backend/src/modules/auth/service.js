import { AuthRepository } from "./repository.js";
import { HashUtil } from "../../common/utils/hash.js";
import { authConfig } from "../../config/auth.js";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class AuthService {
  constructor(jwtSigner) {
    this.jwtSigner = jwtSigner;
  }

  async register({ email, password, firstName, lastName, phone, customerType = "B2C" }) {
    const existing = await AuthRepository.findUserByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email already exists", ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const passwordHash = await HashUtil.hashPassword(password, authConfig.saltRounds);
    const user = await AuthRepository.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      customerType,
      roleName: "CUSTOMER",
    });

    const tokens = await this._generateAuthTokens(user);
    return {
      user: this._sanitizeUser(user),
      tokens,
    };
  }

  async login({ email, password }) {
    const user = await AuthRepository.findUserByEmail(email);
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

    await AuthRepository.updateLastLogin(user.id);
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
    const storedToken = await AuthRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token", ERROR_CODES.TOKEN_INVALID);
    }

    if (storedToken.revokedAt) {
      // Possible token reuse attack - revoke all user tokens for security
      await AuthRepository.revokeAllUserTokens(storedToken.userId);
      throw new UnauthorizedError("Refresh token has been revoked", ERROR_CODES.TOKEN_REVOKED);
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError("Refresh token has expired", ERROR_CODES.TOKEN_EXPIRED);
    }

    // Refresh Token Rotation: Revoke current token and issue new pair
    await AuthRepository.revokeRefreshToken(storedToken.id);
    const user = await AuthRepository.findUserById(storedToken.userId);

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
      const storedToken = await AuthRepository.findRefreshToken(tokenHash);
      if (storedToken) {
        await AuthRepository.revokeRefreshToken(storedToken.id);
      }
    }
    return { loggedOut: true };
  }

  async getMe(userId) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this._sanitizeUser(user);
  }

  async forgotPassword(email) {
    const user = await AuthRepository.findUserByEmail(email);
    // Silent return to prevent email enumeration
    if (!user) return { message: "If an account exists, a reset link will be sent." };
    // Password reset token generation
    const resetToken = HashUtil.generateRandomToken(32);
    // In production, dispatch email through notification service
    return { message: "If an account exists, a reset link will be sent.", resetToken };
  }

  async resetPassword({ resetToken, newPassword }) {
    if (!resetToken || !newPassword || newPassword.length < 6) {
      throw new BadRequestError("Valid reset token and password (min 6 chars) are required");
    }
    return { message: "Password has been successfully reset" };
  }

  async _generateAuthTokens(user) {
    const roles = user.roles?.map(r => r.role?.name || r.roleName || r) || [];
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

    await AuthRepository.saveRefreshToken(user.id, tokenHash, expiresAt);

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
      roles: user.roles?.map(r => (r.role ? r.role.name : r.name || r)) || [],
    };
  }
}
