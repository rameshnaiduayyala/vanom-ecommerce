import { prisma } from "../../infrastructure/database/prisma.js";

export class OrderRepository {
  static async createOrderWithTransaction({
    orderData,
    itemsData,
    reservationsData,
    taxCalculationData,
    outboxEventData,
  }, tx = null) {
    const db = tx || prisma;

    const order = await db.order.create({
      data: {
        ...orderData,
        items: {
          create: itemsData,
        },
        statusHistory: {
          create: {
            toStatus: orderData.status || "PENDING_PAYMENT",
            reason: "Initial order placement",
          },
        },
      },
      include: {
        items: true,
        country: true,
        currency: true,
        company: true,
      },
    });

    // Create inventory reservations linked to order
    for (const res of reservationsData) {
      await db.inventoryReservation.create({
        data: {
          warehouseId: res.warehouseId,
          variantId: res.variantId,
          orderId: order.id,
          quantity: res.quantity,
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours hold
        },
      });

      await db.inventoryItem.updateMany({
        where: {
          warehouseId: res.warehouseId,
          variantId: res.variantId,
        },
        data: {
          reserved: { increment: res.quantity },
        },
      });

      await db.inventoryMovement.create({
        data: {
          warehouseId: res.warehouseId,
          variantId: res.variantId,
          type: "RESERVATION",
          quantity: res.quantity,
          referenceType: "ORDER",
          referenceId: order.id,
          reason: "Order placement reservation",
        },
      });
    }

    // Save tax calculation & lines
    if (taxCalculationData) {
      await db.taxCalculation.create({
        data: {
          orderId: order.id,
          countryId: order.countryId,
          provider: taxCalculationData.provider || "DEFAULT",
          totalTax: taxCalculationData.totalTax,
          lines: {
            create: order.items.map((item, idx) => {
              const line = taxCalculationData.taxLines?.[idx] || {};
              return {
                orderItemId: item.id,
                taxableAmount: item.subtotal,
                rate: line.rate || 0,
                taxAmount: item.taxAmount,
                taxType: line.taxType || "VAT",
                jurisdictionSnapshot: line.jurisdiction || {},
              };
            }),
          },
        },
      });
    }

    // Create Outbox Event
    if (outboxEventData) {
      await db.outboxEvent.create({
        data: {
          aggregateType: "ORDER",
          aggregateId: order.id,
          eventType: outboxEventData.eventType || "ORDER_CREATED",
          payload: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            currency: order.currency.code,
            userId: order.userId,
            companyId: order.companyId,
          },
        },
      });
    }

    return order;
  }

  static async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            currency: true,
          },
        },
        country: true,
        currency: true,
        company: true,
        payments: {
          include: { transactions: true, refunds: true },
        },
        shipments: {
          include: { items: true, events: true, carrier: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        taxCalculation: {
          include: { lines: true },
        },
      },
    });
  }

  static async listUserOrders(userId, { page = 1, limit = 20 }) {
    const where = { userId };
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          currency: true,
          company: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  static async listCompanyOrders(companyId, { page = 1, limit = 20 }) {
    const where = { companyId };
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          currency: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  static async cancelOrder(orderId, userId, reason, tx = null) {
    const db = tx || prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { reservations: true },
    });

    if (!order) return null;

    // Release reservations
    for (const res of order.reservations) {
      if (res.status === "ACTIVE") {
        await db.inventoryItem.updateMany({
          where: { warehouseId: res.warehouseId, variantId: res.variantId },
          data: { reserved: { decrement: res.quantity } },
        });
        await db.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "RELEASED", releasedAt: new Date() },
        });
      }
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: "CANCELLED",
            changedById: userId,
            reason: reason || "Cancelled by user",
          },
        },
      },
    });

    await db.outboxEvent.create({
      data: {
        aggregateType: "ORDER",
        aggregateId: order.id,
        eventType: "ORDER_CANCELLED",
        payload: { orderId: order.id, reason },
      },
    });

    return updated;
  }
}
