import { prisma } from "../../../config/prisma.js";
import { getBusinessForUser } from "../lib/business.repository.js";

export async function list(userId) {
  const business = await getBusinessForUser(userId, { approved: true });
  return prisma.bulkAddress.findMany({
    where: { businessId: business.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });
}

export async function create(userId, input) {
  const business = await getBusinessForUser(userId, { approved: true });

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      // Unset any existing default before setting the new one
      await tx.bulkAddress.updateMany({
        where: { businessId: business.id },
        data: { isDefault: false }
      });
    }

    return tx.bulkAddress.create({
      data: { ...input, businessId: business.id }
    });
  });
}
