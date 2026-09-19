import { prisma } from "../../config/prisma.js";
import { hashPassword, verifyPassword } from "../../common/utils/password.js";
import { AppError } from "../../common/errors/app-error.js";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../common/utils/email.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

const userInclude = { country: { include: { currency: true } } };

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function handleUniqueError(error) {
  if (error.code === "P2002" && error.meta?.target?.includes("email")) {
    throw new AppError(MESSAGES.USER_EMAIL_EXISTS, HTTP_STATUS.CONFLICT, "USER_EMAIL_EXISTS");
  }
  throw error;
}

export async function register(input) {
  try {
    const token = randomBytes(32).toString("hex");
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
        email: normalizeEmail(input.email),
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        countryId: input.countryId ?? null
        },
        include: userInclude
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: tokenHash(token),
          expiresAt: new Date(Date.now() + env.emailVerificationExpiresMinutes * 60 * 1000)
        }
      });
      return createdUser;
    });

    await sendVerificationEmail(user.email, token);
    return { user: publicUser(user), verificationToken: token };
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function login(input, signToken) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(input.email) },
    include: userInclude
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AppError(MESSAGES.AUTH_INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }
  if (!user.isActive) {
    throw new AppError(MESSAGES.AUTH_INACTIVE_USER, HTTP_STATUS.FORBIDDEN, "INACTIVE_USER");
  }
  if (!user.emailVerifiedAt) {
    throw new AppError(MESSAGES.AUTH_EMAIL_NOT_VERIFIED, HTTP_STATUS.FORBIDDEN, "EMAIL_NOT_VERIFIED");
  }

  return { user: publicUser(user), token: signToken(user) };
}

export async function verifyEmail(token) {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: tokenHash(token) }
  });
  if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt <= new Date()) {
    throw new AppError(MESSAGES.EMAIL_VERIFICATION_INVALID, HTTP_STATUS.BAD_REQUEST, "EMAIL_VERIFICATION_INVALID");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: verificationToken.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: verificationToken.id }, data: { usedAt: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: verificationToken.userId, id: { not: verificationToken.id } } })
  ]);
}

export async function getCurrentUser(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: userInclude });
  if (!user || !user.isActive) {
    throw new AppError(MESSAGES.AUTH_INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, "INVALID_TOKEN_USER");
  }
  return publicUser(user);
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user) return { message: MESSAGES.USER_NOT_FOUND };

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + env.passwordResetExpiresMinutes * 60 * 1000)
    }
  });
  await sendPasswordResetEmail(user.email, token);
  return token;
}

export async function resetPassword(token, password) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash: tokenHash(token) } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    throw new AppError(MESSAGES.PASSWORD_RESET_INVALID, HTTP_STATUS.BAD_REQUEST, "PASSWORD_RESET_INVALID");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId, id: { not: resetToken.id } } })
  ]);
}
