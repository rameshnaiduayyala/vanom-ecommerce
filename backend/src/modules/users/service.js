import { prisma } from "../../infrastructure/database/prisma.js";

/**
 * UserService
 * Direct Prisma queries for Users
 */
export class UserService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, roles: { include: { role: true } } },
    });
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async updateProfile(userId, { firstName, lastName, phone }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone },
    });
    const { passwordHash, ...sanitized } = updated;
    return sanitized;
  }
}
