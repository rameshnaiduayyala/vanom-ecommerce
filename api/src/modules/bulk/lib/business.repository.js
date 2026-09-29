import { prisma } from "../../../config/prisma.js";
import { assertApproved } from "../validator.js";

/**
 * Returns the BulkBusiness linked to a user (via foreign key or matching email).
 * Does NOT throw if no business is found — callers decide what to do.
 *
 * @param {string} userId
 * @returns {Promise<import("@prisma/client").BulkBusiness | null>}
 */
export async function businessByUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bulkBusiness: true }
  });
  return user?.bulkBusiness ?? null;
}

/**
 * Looks up a user's email address.
 *
 * @param {string} userId
 * @returns {Promise<string | null>}
 */
export async function userEmail(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });
  return user?.email ?? null;
}

/**
 * Resolves the BulkBusiness for a given user, falling back to an email lookup.
 * Pass `{ approved: true }` to additionally assert the business is APPROVED.
 *
 * @param {string} userId
 * @param {{ approved?: boolean }} [options]
 * @returns {Promise<import("@prisma/client").BulkBusiness | null>}
 */
export async function getBusinessForUser(userId, { approved = false } = {}) {
  let business = await businessByUser(userId);

  if (!business) {
    const email = await userEmail(userId);
    if (email) {
      business = await prisma.bulkBusiness.findUnique({
        where: { businessEmail: email }
      });
    }
  }

  if (approved) {
    assertApproved(business);
  }

  return business;
}

/**
 * Upserts the BulkCart for a business (create if missing), returning it with
 * all items including their product and variant relations.
 *
 * @param {string} businessId
 */
export async function findOrCreateCart(businessId) {
  return prisma.bulkCart.upsert({
    where: { businessId },
    create: { businessId },
    update: {},
    include: {
      items: {
        include: { product: true, variant: true }
      }
    }
  });
}
