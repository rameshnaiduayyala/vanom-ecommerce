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
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: { include: { file: true } } },
            },
            variant: {
              include: { images: { include: { file: true } } },
            },
          },
        },
        country: true,
        business: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        payments: {
          include: { transactions: true, refunds: true },
        },
        shipments: {
          include: { items: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        taxCalculation: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found", ERROR_CODES.ORDER_NOT_FOUND);
    }

    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");
    const isOwner = order.userId === user.id;
    const isBusinessMember = order.businessId && user.businessMemberships?.some((m) => m.businessId === order.businessId);

    if (!isAdmin && !isOwner && !isBusinessMember) {
      throw new ForbiddenError("You do not have permission to view this order");
    }

    // Generate fulfillment timeline
    const timeline = [];
    timeline.push({
      label: "Order Placed & Confirmed",
      date: order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
      status: "COMPLETED",
    });

    if (order.statusHistory && order.statusHistory.length > 0) {
      for (const h of order.statusHistory) {
        timeline.push({
          label: `Status: ${h.toStatus.replace(/_/g, " ")}`,
          date: new Date(h.createdAt).toLocaleString(),
          status: "COMPLETED",
          reason: h.reason,
        });
      }
    } else if (order.status !== "PENDING_PAYMENT" && order.status !== "DRAFT") {
      timeline.push({
        label: `Current Status: ${order.status.replace(/_/g, " ")}`,
        date: new Date(order.updatedAt || order.createdAt).toLocaleString(),
        status: "COMPLETED",
      });
    }

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerType: order.customerType,
      channel: order.channel,
      type: order.customerType || (order.businessId ? "B2B" : "B2C"),
      subtotal: Number(order.subtotal || 0),
      discountAmount: Number(order.discountAmount || 0),
      taxAmount: Number(order.taxAmount || 0),
      shippingAmount: Number(order.shippingAmount || 0),
      shippingCost: Number(order.shippingAmount || 0),
      totalAmount: Number(order.totalAmount || 0),
      currency: order.currency || "USD",
      symbol: order.currency === "CAD" ? "CA$" : "$",
      currencyCode: order.currency || "USD",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      user: order.user,
      business: order.business,
      company: order.business,
      payments: order.payments,
      shipments: order.shipments,
      timeline,
      items: (order.items || []).map((it) => {
        const imageUrl = it.variant?.images?.[0]?.file?.url || it.product?.images?.[0]?.file?.url || "";
        return {
          id: it.id,
          productId: it.productId,
          variantId: it.variantId,
          name: it.productNameSnapshot || it.product?.name || "Product",
          sku: it.skuSnapshot || it.variant?.sku || "",
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice || 0),
          subtotal: Number(it.subtotal || 0),
          discountAmount: Number(it.discountAmount || 0),
          taxAmount: Number(it.taxAmount || 0),
          total: Number(it.totalAmount || it.subtotal || 0),
          image: imageUrl,
        };
      }),
    };

    return formattedOrder;
  }

  async listUserOrders(user, { page = 1, limit = 20 } = {}) {
    const where = { userId: user.id };
    const [total, rawItems] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: { images: { include: { file: true } } },
              },
              variant: {
                include: { images: { include: { file: true } } },
              },
            },
          },
          country: true,
          business: true,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const items = rawItems.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerType: o.customerType,
      type: o.customerType || (o.businessId ? "B2B" : "B2C"),
      subtotal: Number(o.subtotal),
      taxAmount: Number(o.taxAmount),
      shippingAmount: Number(o.shippingAmount),
      totalAmount: Number(o.totalAmount),
      currency: o.currency || "USD",
      symbol: o.currency === "CAD" ? "CA$" : "$",
      createdAt: o.createdAt,
      items: (o.items || []).map((it) => ({
        id: it.id,
        productId: it.productId,
        variantId: it.variantId,
        name: it.productNameSnapshot || it.product?.name || "Product",
        sku: it.skuSnapshot || it.variant?.sku,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice || 0),
        subtotal: Number(it.subtotal || 0),
        image: it.variant?.images?.[0]?.file?.url || it.product?.images?.[0]?.file?.url || "",
      })),
      shippingAddress: o.shippingAddress,
      billingAddress: o.billingAddress,
    }));

    return { total, items };
  }

  async listCompanyOrders(businessId, user, { page = 1, limit = 20 } = {}) {
    const isMember = user.businessMemberships?.some((m) => m.businessId === businessId);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have access to this business's orders");
    }

    const where = { businessId };
    const [total, rawItems] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: { images: { include: { file: true } } },
              },
              variant: {
                include: { images: { include: { file: true } } },
              },
            },
          },
          country: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const items = rawItems.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerType: o.customerType,
      type: "B2B",
      subtotal: Number(o.subtotal),
      taxAmount: Number(o.taxAmount),
      shippingAmount: Number(o.shippingAmount),
      totalAmount: Number(o.totalAmount),
      currency: o.currency || "USD",
      symbol: o.currency === "CAD" ? "CA$" : "$",
      createdAt: o.createdAt,
      items: (o.items || []).map((it) => ({
        id: it.id,
        productId: it.productId,
        variantId: it.variantId,
        name: it.productNameSnapshot || it.product?.name || "Product",
        sku: it.skuSnapshot || it.variant?.sku,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice || 0),
        subtotal: Number(it.subtotal || 0),
        image: it.variant?.images?.[0]?.file?.url || it.product?.images?.[0]?.file?.url || "",
      })),
      user: o.user,
      shippingAddress: o.shippingAddress,
      billingAddress: o.billingAddress,
    }));

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
            data: {
              reserved: { decrement: res.quantity },
              available: { increment: res.quantity },
            },
          });
          await tx.inventoryReservation.update({
            where: { id: res.id },
            data: { status: "RELEASED" },
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

      return updated;
    });
  }
}
