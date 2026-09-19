import { prisma } from "../../../config/prisma.js";
import { getBusinessForUser } from "./bulk.helper.js";

export async function list(userId) {
  const b = await getBusinessForUser(userId, { approved: true });
  return prisma.bulkAddress.findMany({
    where: { businessId: b.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });
}

export async function create(userId, input) {
  const b = await getBusinessForUser(userId, { approved: true });
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.bulkAddress.updateMany({
        where: { businessId: b.id },
        data: { isDefault: false }
      });
    }
    return tx.bulkAddress.create({
      data: { ...input, businessId: b.id }
    });
  });
}
