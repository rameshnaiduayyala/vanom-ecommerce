import { prisma } from "../../infrastructure/database/prisma.js";

export class AuthRepository {
  static async findUserByEmail(email) {
    return prisma.user.findUnique({
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
          include: {
            company: true,
          },
        },
      },
    });
  }

  static async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
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
          include: {
            addresses: true,
          },
        },
        companyMembers: {
          include: {
            company: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    });
  }

  static async createUser({ email, passwordHash, firstName, lastName, phone, customerType = "B2C", roleName = "CUSTOMER" }, tx = null) {
    const db = tx || prisma;
    return db.user.create({
      data: {
        email: email.toLowerCase().trim(),
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
              connect: { name: roleName },
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
  }

  static async saveRefreshToken(userId, tokenHash, expiresAt) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  static async findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  static async revokeRefreshToken(id) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async updateLastLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  static async updatePassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
