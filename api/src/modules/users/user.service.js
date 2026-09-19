import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { hashPassword } from "../../common/utils/password.js";

const userInclude = {
  country: {
    include: { currency: true }
  }
};

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function handleUniqueError(error) {
  if (error.code === "P2002" && error.meta?.target?.includes("email")) {
    throw new AppError(MESSAGES.USER_EMAIL_EXISTS, HTTP_STATUS.CONFLICT, "USER_EMAIL_EXISTS");
  }
  throw error;
}

export async function createUser(input) {
  try {
    const user = await prisma.user.create({
      data: {
        email: normalizeEmail(input.email),
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        imageUrl: input.imageUrl ?? null,
        isActive: input.isActive ?? true,
        role: input.role ?? "USER",
        countryId: input.countryId ?? null
      },
      include: userInclude
    });
    return publicUser(user);
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function listUsers({ page, limit, skip, search, isActive, countryId }) {
  const where = {
    ...(search ? {
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(countryId ? { countryId } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: userInclude
    }),
    prisma.user.count({ where })
  ]);

  return { items: items.map(publicUser), total };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: userInclude });
  if (!user) throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
  return publicUser(user);
}

export async function updateUser(id, input) {
  input = input ?? {};
  await getUserById(id);

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(input.email !== undefined && { email: normalizeEmail(input.email) }),
        ...(input.password !== undefined && { passwordHash: await hashPassword(input.password) }),
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.countryId !== undefined && { countryId: input.countryId })
      },
      include: userInclude
    });
    return publicUser(user);
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function deleteUser(id) {
  await getUserById(id);
  return prisma.user.delete({ where: { id } });
}
