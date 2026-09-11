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
            currency: true,
          },
        },
        country: true,
        currency: true,
        company: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
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
      type: order.customerType || (order.companyId ? "B2B" : "B2C"),
      subtotal: Number(order.subtotal || 0),
      discountAmount: Number(order.discountAmount || 0),
      taxAmount: Number(order.taxAmount || 0),
      shippingAmount: Number(order.shippingAmount || 0),
      shippingCost: Number(order.shippingAmount || 0),
      totalAmount: Number(order.totalAmount || 0),
      currency: order.currency?.code || "INR",
      symbol: order.currency?.symbol || "₹",
      currencyCode: order.currency?.code || "INR",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      user: order.user,
      company: order.company,
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
          total: Number(it.total || it.subtotal || 0),
          image: imageUrl,
        };
      }),
      invoice: {
        invoiceNumber: `INV-${order.orderNumber}`,
        invoiceDate: order.createdAt,
        seller: {
          name: "VANOM ORGANICS & ENTERPRISE",
          taxId: "GSTIN27AABCV1234F1Z9",
          address: "Vanom Logistics Park, Sector 18, Gurugram, Haryana - 122015, India",
          supportEmail: "support@vanom.com",
          phone: "+91 1800-123-VANOM",
        },
      },
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
          currency: true,
          country: true,
          company: true,
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
      type: o.customerType || (o.companyId ? "B2B" : "B2C"),
      subtotal: Number(o.subtotal),
      taxAmount: Number(o.taxAmount),
      shippingAmount: Number(o.shippingAmount),
      totalAmount: Number(o.totalAmount),
      currency: o.currency?.code || "INR",
      symbol: o.currency?.symbol || "₹",
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

  async listCompanyOrders(companyId, user, { page = 1, limit = 20 } = {}) {
    const isMember = user.companyMembers?.some((m) => m.companyId === companyId);
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isMember && !isAdmin) {
      throw new ForbiddenError("You do not have access to this company's orders");
    }

    const where = { companyId };
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
          currency: true,
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
      currency: o.currency?.code || "INR",
      symbol: o.currency?.symbol || "₹",
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
