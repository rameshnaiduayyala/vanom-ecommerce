import { prisma } from "../../infrastructure/database/prisma.js";
import { IdGenerator } from "../../common/utils/id-generator.js";

export class BulkOrderRepository {
  static async create({ companyId, requestedById, countryId, currencyId, notes, items }, tx = null) {
    const db = tx || prisma;
    const orderNumber = IdGenerator.generateBulkOrderNumber();

    return db.bulkOrder.create({
      data: {
        orderNumber,
        companyId,
        requestedById,
        countryId,
        currencyId,
        status: "DRAFT",
        notes,
        items: {
          create: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            packagingSnapshot: item.packagingSnapshot || {},
            requestedDeliveryDate: item.requestedDeliveryDate ? new Date(item.requestedDeliveryDate) : null,
          })),
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        company: true,
        country: true,
        currency: true,
      },
    });
  }

  static async findById(id) {
    return prisma.bulkOrder.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { include: { product: true, packaging: true } } } },
        company: { include: { members: true } },
        country: true,
        currency: true,
        quotes: true,
      },
    });
  }

  static async list({ companyId, status, page = 1, limit = 20 }) {
    const where = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.bulkOrder.count({ where }),
      prisma.bulkOrder.findMany({
        where,
        include: {
          items: true,
          company: true,
          currency: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  static async updateStatus(id, status, tx = null) {
    const db = tx || prisma;
    return db.bulkOrder.update({
      where: { id },
      data: { status },
    });
  }
}
