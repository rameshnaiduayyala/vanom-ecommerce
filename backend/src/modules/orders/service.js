import { prisma } from "../../infrastructure/database/prisma.js";
import { CheckoutService } from "../checkout/service.js";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

/**
 * OrderService
 * Direct Prisma queries, order state transitions, inventory reservation handling, and checkout logic
 */
export class OrderService {
  constructor(checkoutService = new CheckoutService()) {
    this.checkoutService = checkoutService;
  }

  async createOrder(user, payload, idempotencyKey = null) {
    return this.checkoutService.placeOrder(user, payload, idempotencyKey);
  }

  async getOrderById(orderId, user) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      throw new NotFoundError("Order not found", ERROR_CODES.ORDER_NOT_FOUND);
    }

    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");
    const isOwner = order.userId === user.id;
    const isCompanyMember = order.companyId && user.companyMembers?.some((m) => m.companyId === order.companyId);

    if (!isAdmin && !isOwner && !isCompanyMember) {
      throw new ForbiddenError("You do not have permission to view this order");
    }

    return order;
  }

  async listUserOrders(user, { page = 1, limit = 20 } = {}) {
    const where = { userId: user.id };
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          currency: true,
          company: true,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  async listCompanyOrders(companyId, user, { page = 1, limit = 20 } = {}) {
    const isMember = user.companyMembers?.some((m) => m.companyId === companyId);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have access to this company's orders");
    }

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
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  async cancelOrder(orderId, user, reason) {
    const order = await this.getOrderById(orderId, user);

    if (order.status !== "PENDING_PAYMENT" && order.status !== "DRAFT" && order.status !== "PAID") {
      throw new BusinessRuleError(
        `Order in status '${order.status}' cannot be cancelled`,
        ERROR_CODES.ORDER_CANNOT_BE_CANCELLED
      );
    }

    return prisma.$transaction(async (tx) => {
      // Find inventory reservations linked to this order
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId },
      });

      for (const res of reservations) {
        if (res.status === "ACTIVE") {
          await tx.inventoryItem.updateMany({
            where: { warehouseId: res.warehouseId, variantId: res.variantId },
            data: { reserved: { decrement: res.quantity } },
          });
          await tx.inventoryReservation.update({
            where: { id: res.id },
            data: { status: "RELEASED", releasedAt: new Date() },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: "CANCELLED",
              changedById: user.id,
              reason: reason || "Cancelled by user",
            },
          },
        },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: "ORDER",
          aggregateId: order.id,
          eventType: "ORDER_CANCELLED",
          payload: { orderId: order.id, reason },
        },
      });

      return updated;
    });
  }
}
