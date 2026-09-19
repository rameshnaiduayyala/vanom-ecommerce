import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { hashPassword } from "../../common/utils/password.js";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";
import { sendVerificationEmail } from "../../common/utils/email.js";

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

const userInclude = {
  country: {
    include: { currency: true }
  },
  bulkBusiness: true,
  _count: {
    select: {
      orders: true,
      reviews: true
    }
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
    const user = await prisma.$transaction(async (tx) => {
      let bulkBusinessId = null;

      // Handle B2B Wholesale Business linking or creation if provided
      if (input.businessId) {
        bulkBusinessId = input.businessId;
      } else if (input.businessName || input.business) {
        const b = input.business || input;
        const newBusiness = await tx.bulkBusiness.create({
          data: {
            businessName: b.businessName,
            businessEmail: normalizeEmail(b.businessEmail || input.email),
            businessPhone: b.businessPhone || input.phone || "—",
            registrationNumber: b.registrationNumber ?? null,
            taxRegistrationNumber: b.taxRegistrationNumber ?? null,
            countryCode: (b.countryCode || input.countryCode || "US").toUpperCase(),
            address: b.address || "Principal Business Address",
            contactPersonName: b.contactPersonName || `${input.firstName || ""} ${input.lastName || ""}`.trim() || "Account Admin",
            status: b.status || "APPROVED"
          }
        });
        bulkBusinessId = newBusiness.id;
      }

      const determinedRole = input.role === "SUPERADMIN"
        ? "SUPERADMIN"
        : bulkBusinessId || input.role === "B2B_USER"
        ? "B2B_USER"
        : (input.role || "USER");

      const newUser = await tx.user.create({
        data: {
          email: normalizeEmail(input.email),
          passwordHash: await hashPassword(input.password),
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
          imageUrl: input.imageUrl ?? null,
          isActive: input.isActive ?? true,
          role: determinedRole,
          countryId: input.countryId ?? null,
          bulkBusinessId: bulkBusinessId
        }
      });

      const token = randomBytes(32).toString("hex");

      await tx.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          tokenHash: tokenHash(token),
          expiresAt: new Date(Date.now() + (env.emailVerificationExpiresMinutes || 1440) * 60 * 1000)
        }
      });

      const fullUser = await tx.user.findUnique({
        where: { id: newUser.id },
        include: userInclude
      });

      return { fullUser, token };
    });

    if (user?.fullUser?.email && user?.token) {
      try {
        await sendVerificationEmail(user.fullUser.email, user.token, {
          firstName: user.fullUser.firstName,
          isB2B: user.fullUser.role === "B2B_USER" || !!user.fullUser.bulkBusiness,
          businessName: user.fullUser.bulkBusiness?.businessName,
          businessEmail: user.fullUser.bulkBusiness?.businessEmail,
          businessPhone: user.fullUser.bulkBusiness?.businessPhone,
          taxRegistrationNumber: user.fullUser.bulkBusiness?.taxRegistrationNumber,
          registrationNumber: user.fullUser.bulkBusiness?.registrationNumber,
          address: user.fullUser.bulkBusiness?.address,
        });
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }
    }

    return publicUser(user.fullUser);
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
  const existingUser = await getUserById(id);

  try {
    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
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
        }
      });

      // Handle B2B business update/creation/linking if passed
      let updatedBulkBusinessId = existingUser.bulkBusinessId;

      if (input.businessId !== undefined) {
        updatedBulkBusinessId = input.businessId || null;
        await tx.user.update({
          where: { id },
          data: { bulkBusinessId: updatedBulkBusinessId }
        });
      } else if (input.businessName || input.business) {
        const b = input.business || input;
        const businessData = {
          businessName: b.businessName,
          businessEmail: normalizeEmail(b.businessEmail || input.email || existingUser.email),
          businessPhone: b.businessPhone || input.phone || existingUser.bulkBusiness?.businessPhone || "—",
          registrationNumber: b.registrationNumber ?? null,
          taxRegistrationNumber: b.taxRegistrationNumber ?? null,
          countryCode: (b.countryCode || input.countryCode || existingUser.bulkBusiness?.countryCode || "US").toUpperCase(),
          address: b.address || existingUser.bulkBusiness?.address || "Principal Business Address",
          contactPersonName: b.contactPersonName || `${input.firstName || existingUser.firstName || ""} ${input.lastName || existingUser.lastName || ""}`.trim() || "Account Admin",
          status: b.status || existingUser.bulkBusiness?.status || "APPROVED"
        };

        if (existingUser.bulkBusiness) {
          await tx.bulkBusiness.update({
            where: { id: existingUser.bulkBusiness.id },
            data: businessData
          });
        } else {
          const newBusiness = await tx.bulkBusiness.create({
            data: businessData
          });
          await tx.user.update({
            where: { id },
            data: { bulkBusinessId: newBusiness.id }
          });
        }
      }

      return tx.user.findUnique({
        where: { id },
        include: userInclude
      });
    });

    return publicUser(user);
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function deleteUser(id) {
  const user = await getUserById(id);
  if (user.role === "SUPERADMIN") {
    throw new AppError("Superadmin accounts cannot be deleted.", HTTP_STATUS.FORBIDDEN, "SUPERADMIN_CANNOT_BE_DELETED");
  }
  return prisma.user.delete({ where: { id } });
}
