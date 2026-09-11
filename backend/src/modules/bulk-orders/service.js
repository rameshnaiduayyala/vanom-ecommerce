import { prisma } from "../../infrastructure/database/prisma.js";
import { IdGenerator } from "../../common/utils/id-generator.js";
import { PriceResolver } from "../pricing/price-resolver.js";
import { Money } from "../../common/utils/money.js";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/index.js";

/**
 * BulkOrderService
 * Direct Prisma queries for high-volume B2B bulk orders, custom quotes, and pallet specifications
 */
export class BulkOrderService {
  async createBulkOrder(user, { companyId, items = [], notes, countryCode = "IN", currencyCode = "INR" }) {
    const member = user.companyMembers?.find((m) => m.companyId === companyId);
    if (!member && !user.roles?.includes("ADMIN")) {
      throw new ForbiddenError("You must be an authorized member of the company");
    }

    if (!items || items.length === 0) {
      throw new BusinessRuleError("At least one bulk item is required");
    }

    const country = await prisma.country.findUnique({ where: { code: countryCode.toUpperCase() } });
    const currency = await prisma.currency.findUnique({ where: { code: currencyCode.toUpperCase() } });

    if (!country || !currency) {
      throw new NotFoundError("Country or currency not supported");
    }

    const validatedItems = [];
    let subtotal = Money.toDecimal(0);

    for (const item of items) {
      // Direct lookup from dedicated BulkProduct table first
      const bulkProd = await prisma.bulkProduct.findFirst({
        where: {
          OR: [{ id: item.productId || item.bulkProductId || item.id }, { sku: item.sku || "" }],
        },
      });

      const unitPrice = item.unitPrice ? Money.toDecimal(item.unitPrice) : Money.toDecimal(30.0);
      const itemSubtotal = Money.multiply(unitPrice, item.quantity);
      subtotal = Money.add(subtotal, itemSubtotal);

      validatedItems.push({
        bulkProductId: bulkProd ? bulkProd.id : item.productId,
        variantId: item.variantId || null,
        quantity: parseInt(item.quantity, 10) || 1,
        unitPrice: unitPrice,
        subtotal: itemSubtotal,
        packagingSnapshot: bulkProd
          ? {
              packagingType: bulkProd.packagingType,
              unitsPerPackage: bulkProd.unitsPerPackage,
              packagesPerPallet: bulkProd.packagesPerPallet,
            }
          : { packagingType: "Master Carton / Sacks" },
        requestedDeliveryDate: item.requestedDeliveryDate ? new Date(item.requestedDeliveryDate) : null,
      });
    }

    const orderNumber = IdGenerator.generateBulkOrderNumber();

    return prisma.bulkOrder.create({
      data: {
        orderNumber,
        companyId,
        requestedById: user.id,
        countryId: country.id,
        currencyId: currency.id,
        status: "DRAFT",
        notes,
        subtotal,
        totalAmount: subtotal,
        items: {
          create: validatedItems,
        },
      },
      include: {
        items: { include: { bulkProduct: true, variant: { include: { product: true } } } },
        company: true,
        country: true,
        currency: true,
      },
    });
  }

  async getBulkOrderById(id, user) {
    const order = await prisma.bulkOrder.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { include: { product: true, packaging: true } } } },
        company: { include: { members: true } },
        country: true,
        currency: true,
        quotes: true,
      },
    });

    if (!order) throw new NotFoundError("Bulk order inquiry not found");

    const isMember = order.company?.members?.some((m) => m.userId === user.id);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("Access denied to this bulk order");
    }

    return order;
  }

  async submitBulkOrder(id, user) {
    const order = await this.getBulkOrderById(id, user);
    return prisma.bulkOrder.update({
      where: { id: order.id },
      data: { status: "SUBMITTED" },
    });
  }

  async listBulkOrders(user, { companyId, status, page = 1, limit = 20 } = {}) {
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
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }
}
