import { prisma } from "../../../config/prisma.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
import { hashPassword } from "../../../common/utils/password.js";
import { sendVerificationEmail } from "../../../common/utils/email.js";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../../../config/env.js";
import { getBusinessForUser } from "../lib/business.repository.js";
import { fail } from "../lib/errors.js";

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function register(input, userId) {
  const { user: userCredentials, ...businessInput } = input;
  const data = {
    ...businessInput,
    businessEmail: businessInput.businessEmail.trim().toLowerCase()
  };

  let verificationToken = null;
  let targetUserEmail = null;
  let targetFirstName = null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.bulkBusiness.create({ data });
      let createdOrUpdatedUserId = userId;

      if (userId) {
        const user = await tx.user.update({
          where: { id: userId },
          data: { bulkBusinessId: business.id, role: "B2B_USER" }
        });
        targetUserEmail = user.email;
        targetFirstName = user.firstName;
      } else if (userCredentials?.email && userCredentials?.password) {
        const email = userCredentials.email.trim().toLowerCase();
        const existingUser = await tx.user.findUnique({ where: { email } });

        if (existingUser) {
          const user = await tx.user.update({
            where: { id: existingUser.id },
            data: { bulkBusinessId: business.id, role: "B2B_USER" }
          });
          createdOrUpdatedUserId = user.id;
          targetUserEmail = user.email;
          targetFirstName = user.firstName;
        } else {
          const user = await tx.user.create({
            data: {
              email,
              passwordHash: await hashPassword(userCredentials.password),
              firstName: userCredentials.firstName || null,
              lastName: userCredentials.lastName || null,
              role: "B2B_USER",
              bulkBusinessId: business.id
            }
          });
          createdOrUpdatedUserId = user.id;
          targetUserEmail = user.email;
          targetFirstName = user.firstName;
        }
      }

      if (createdOrUpdatedUserId) {
        const token = randomBytes(32).toString("hex");
        verificationToken = token;

        await tx.emailVerificationToken.deleteMany({
          where: { userId: createdOrUpdatedUserId, usedAt: null }
        });

        await tx.emailVerificationToken.create({
          data: {
            userId: createdOrUpdatedUserId,
            tokenHash: tokenHash(token),
            expiresAt: new Date(
              Date.now() + (env.emailVerificationExpiresMinutes || 1440) * 60 * 1000
            )
          }
        });
      }

      return tx.bulkBusiness.findUnique({
        where: { id: business.id },
        include: { users: true }
      });
    });

    if (targetUserEmail && verificationToken) {
      try {
        await sendVerificationEmail(targetUserEmail, verificationToken, {
          firstName: targetFirstName,
          isB2B: true,
          businessName: result.businessName,
          businessEmail: result.businessEmail,
          businessPhone: result.businessPhone,
          taxRegistrationNumber: result.taxRegistrationNumber,
          registrationNumber: result.registrationNumber,
          address: result.address
        });
      } catch (err) {
        console.error("[bulk:register] Email send error:", err);
      }
    }

    return result;
  } catch (error) {
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("businessEmail")) {
        fail("A business with this email address is already registered", "BUSINESS_EMAIL_EXISTS", HTTP_STATUS.CONFLICT);
      }
      if (error.meta?.target?.includes("email")) {
        fail("An account with this email address already exists", "USER_EMAIL_EXISTS", HTTP_STATUS.CONFLICT);
      }
    }
    throw error;
  }
}

export async function me(userId) {
  return getBusinessForUser(userId);
}

export async function getDashboardSummary(userId) {
  const business = await getBusinessForUser(userId);
  if (!business) {
    return {
      business: null,
      stats: {
        totalOrders: 0,
        totalSpend: 0,
        activeOrders: 0,
        completedOrders: 0,
        cartItemsCount: 0,
        currencyCode: "USD"
      },
      recentOrders: [],
      featuredProducts: [],
      cart: null
    };
  }

  const [orders, cart, featuredProducts] = await Promise.all([
    prisma.bulkOrder.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        business: {
          select: { id: true, businessName: true, businessEmail: true }
        }
      }
    }),
    prisma.bulkCart.findUnique({
      where: { businessId: business.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" } }
              }
            },
            variant: true
          }
        }
      }
    }),
    prisma.bulkProduct.findMany({
      where: { isActive: true, deletedAt: null },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        countryPrices: {
          include: {
            tiers: { orderBy: { minQuantity: "asc" } }
          }
        }
      }
    })
  ]);

  const totalOrders = orders.length;
  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const activeOrders = orders.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "DELIVERED"
  ).length;
  const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const cartItemsCount =
    cart?.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;

  return {
    business,
    stats: {
      totalOrders,
      totalSpend,
      activeOrders,
      completedOrders,
      cartItemsCount,
      currencyCode: orders[0]?.currencyCode || business.countryCode === "IN" ? "INR" : business.countryCode === "CA" ? "CAD" : "USD"
    },
    recentOrders: orders.slice(0, 5),
    featuredProducts,
    cart
  };
}

export async function update(userId, input) {
  const current = await getBusinessForUser(userId);
  if (!current) fail("Bulk business not found");
  return prisma.bulkBusiness.update({ where: { id: current.id }, data: input });
}
