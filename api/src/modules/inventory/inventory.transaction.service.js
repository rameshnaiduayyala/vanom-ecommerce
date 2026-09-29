import { prisma } from "../../config/prisma.js";
import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function listTransactions(organizationId, {
  inventoryId = null,
  type = null,
  referenceType = null,
  referenceId = null,
  startDate = null,
  endDate = null,
  search = null,
  page = 1,
  limit = 50
} = {}) {
  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
  const take = Math.min(100, Math.max(1, limit));

  const where = {
    organizationId,
    ...(inventoryId ? { inventoryId } : {}),
    ...(type ? { type } : {}),
    ...(referenceType ? { referenceType } : {}),
    ...(referenceId ? { referenceId } : {})
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { referenceId: { contains: search, mode: "insensitive" } },
      { reason: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
      { inventory: { product: { name: { contains: search, mode: "insensitive" } } } },
      { inventory: { product: { sku: { contains: search, mode: "insensitive" } } } }
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.inventoryTransaction.findMany({
      where,
      skip,
      take,
      include: {
        inventory: {
          include: {
            warehouse: { select: { id: true, name: true, code: true } },
            product: { select: { id: true, name: true, sku: true } },
            variant: { select: { id: true, name: true, sku: true } }
          }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.inventoryTransaction.count({ where })
  ]);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / take)
  };
}

export async function getTransactionById(organizationId, id) {
  const transaction = await prisma.inventoryTransaction.findFirst({
    where: { id, organizationId },
    include: {
      inventory: {
        include: {
          warehouse: true,
          product: true,
          variant: true
        }
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true }
      }
    }
  });

  if (!transaction) {
    throw new AppError("Inventory transaction not found", HTTP_STATUS.NOT_FOUND, "TRANSACTION_NOT_FOUND");
  }

  return transaction;
}
