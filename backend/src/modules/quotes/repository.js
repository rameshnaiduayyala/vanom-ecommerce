import { prisma } from "../../infrastructure/database/prisma.js";
import { IdGenerator } from "../../common/utils/id-generator.js";
import { Money } from "../../common/utils/money.js";

export class QuoteRepository {
  static async createQuote({
    companyId,
    requestedById,
    bulkOrderId = null,
    countryId,
    currencyId,
    subtotal,
    discountAmount = 0,
    shippingAmount = 0,
    taxAmount = 0,
    totalAmount,
    validUntil = null,
    customerNotes = null,
    internalNotes = null,
    items = [],
  }, tx = null) {
    const db = tx || prisma;
    const quoteNumber = IdGenerator.generateQuoteNumber();

    const quote = await db.quote.create({
      data: {
        quoteNumber,
        companyId,
        requestedById,
        bulkOrderId,
        countryId,
        currencyId,
        status: "DRAFT",
        subtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        totalAmount,
        validUntil,
        customerNotes,
        internalNotes,
        items: {
          create: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            discount: item.discount || 0,
            taxAmount: item.taxAmount || 0,
            totalAmount: item.totalAmount,
            packagingSnapshot: item.packagingSnapshot || {},
          })),
        },
        versions: {
          create: {
            version: 1,
            subtotal,
            discount: discountAmount,
            shipping: shippingAmount,
            tax: taxAmount,
            total: totalAmount,
            snapshot: {
              items,
              customerNotes,
              internalNotes,
              calculatedAt: new Date().toISOString(),
            },
          },
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        versions: true,
        company: true,
        currency: true,
      },
    });

    return quote;
  }

  static async findById(id) {
    return prisma.quote.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { include: { product: true, packaging: true } } } },
        versions: { orderBy: { version: "desc" } },
        approvals: { include: { approvedBy: { select: { id: true, email: true, firstName: true } } } },
        company: { include: { members: true } },
        currency: true,
        country: true,
      },
    });
  }

  static async list({ companyId, status, page = 1, limit = 20 }) {
    const where = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.quote.count({ where }),
      prisma.quote.findMany({
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

  static async createNewVersion(quoteId, { subtotal, discount, shipping, tax, total, snapshot, newStatus = "QUOTED" }, tx = null) {
    const db = tx || prisma;
    const latest = await db.quoteVersion.findFirst({
      where: { quoteId },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version || 1) + 1;

    await db.quoteVersion.create({
      data: {
        quoteId,
        version: nextVersion,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        snapshot,
      },
    });

    return db.quote.update({
      where: { id: quoteId },
      data: {
        subtotal,
        discountAmount: discount,
        shippingAmount: shipping,
        taxAmount: tax,
        totalAmount: total,
        status: newStatus,
      },
      include: { versions: true, items: true },
    });
  }

  static async updateStatus(id, status, tx = null) {
    const db = tx || prisma;
    return db.quote.update({
      where: { id },
      data: { status },
    });
  }
}
