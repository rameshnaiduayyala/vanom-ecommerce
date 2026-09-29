import * as shippingService from "./shipping.service.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export async function validateAddress(request, reply) {
  const result = await shippingService.validateShippingAddress(request.body);
  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: result
  });
}

export async function getRates(request, reply) {
  const user = request.user || null;
  const result = await shippingService.getShippingRates({
    organizationId: user?.organizationId || null,
    warehouseId: request.body.warehouseId || null,
    shippingAddress: request.body.shippingAddress,
    items: request.body.items || [],
    subtotal: request.body.subtotal || 0
  });

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: {
      rates: result.rates,
      originWarehouse: result.originWarehouse,
      freeShippingEligible: result.freeShippingEligible,
      freeShippingThreshold: result.freeShippingThreshold
    }
  });
}

export async function createShipment(request, reply) {
  const { orderId, warehouseId, rateId, carrier, service } = request.body;
  const shipment = await shippingService.createShipmentForOrder({
    orderId,
    warehouseId,
    rateId,
    carrier,
    service
  });

  return reply.status(HTTP_STATUS.CREATED).send({
    success: true,
    data: shipment
  });
}

export async function createLabel(request, reply) {
  const { shipmentId } = request.params;
  const { rateId, carrier, service } = request.body || {};

  // Find shipment
  const existing = await (await import("../../config/prisma.js")).prisma.shipment.findUnique({
    where: { id: shipmentId }
  });

  if (!existing) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      success: false,
      message: "Shipment not found"
    });
  }

  const shipment = await shippingService.createShipmentForOrder({
    orderId: existing.orderId,
    warehouseId: existing.warehouseId,
    rateId: rateId || existing.shippoRateId,
    carrier: carrier || existing.carrier,
    service: service || existing.service
  });

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: shipment
  });
}

export async function getShipmentById(request, reply) {
  const { shipmentId } = request.params;
  const shipment = await (await import("../../config/prisma.js")).prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      order: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          addresses: true
        }
      },
      warehouse: true,
      items: { include: { orderItem: true } }
    }
  });

  if (!shipment) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      success: false,
      message: "Shipment not found"
    });
  }

  const user = request.user;
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isStaff = ["COMPANY_ADMIN", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER"].includes(user?.role);
  if (!isSuperAdmin && !isStaff && shipment.order?.userId !== user?.sub) {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      message: "Forbidden: You do not have permission to view this shipment"
    });
  }

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: shipment
  });
}

export async function getOrderShipments(request, reply) {
  const { orderId } = request.params;
  const { prisma } = await import("../../config/prisma.js");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true }
  });

  if (!order) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      success: false,
      message: "Order not found"
    });
  }

  const user = request.user;
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isStaff = ["COMPANY_ADMIN", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER"].includes(user?.role);
  if (!isSuperAdmin && !isStaff && order.userId !== user?.sub) {
    return reply.status(HTTP_STATUS.FORBIDDEN).send({
      success: false,
      message: "Forbidden: You do not have permission to view shipments for this order"
    });
  }

  const shipments = await prisma.shipment.findMany({
    where: { orderId },
    include: {
      warehouse: true,
      items: { include: { orderItem: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: shipments
  });
}

export async function getTracking(request, reply) {
  const { trackingNumber } = request.params;
  const { carrier, orderId } = request.query || {};

  if (orderId) {
    const user = request.user;
    if (!user) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        message: "Authentication required to query tracking by order ID"
      });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return reply.status(HTTP_STATUS.NOT_FOUND).send({
        success: false,
        message: "Order not found"
      });
    }

    const isSuperAdmin = user.role === "SUPERADMIN";
    const isStaff = ["COMPANY_ADMIN", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER"].includes(user.role);
    if (!isSuperAdmin && !isStaff && order.userId !== user.sub) {
      return reply.status(HTTP_STATUS.FORBIDDEN).send({
        success: false,
        message: "Forbidden: You do not have permission to view tracking for this order"
      });
    }
  }

  const tracking = await shippingService.getShipmentTracking({
    trackingNumber,
    carrier,
    orderId
  });

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: tracking
  });
}

export async function handleWebhook(request, reply) {
  const signature = request.headers["x-shippo-signature"] || request.headers["shippo-signature-sha256"] || null;
  const rawBody = request.rawBody || null;

  const result = await shippingService.processShippoWebhook({
    payload: request.body,
    signature,
    rawBody
  });

  return reply.status(HTTP_STATUS.OK).send(result);
}

export async function listShipments(request, reply) {
  const { page = 1, limit = 20, status, orderId } = request.query || {};
  const user = request.user || null;

  const result = await shippingService.listShipments({
    organizationId: user?.organizationId || null,
    orderId,
    status,
    page: Number(page),
    limit: Number(limit)
  });

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    ...result
  });
}

export async function updateShipmentStatus(request, reply) {
  const { shipmentId } = request.params;
  const { status } = request.body;

  const prisma = (await import("../../config/prisma.js")).prisma;
  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      ...(status === "IN_TRANSIT" ? { shippedAt: new Date() } : {}),
      ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {})
    },
    include: { order: true, warehouse: true }
  });

  // Sync order status
  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
    await prisma.order.update({
      where: { id: updated.orderId },
      data: { status: "SHIPPED" }
    });
  } else if (status === "DELIVERED") {
    await prisma.order.update({
      where: { id: updated.orderId },
      data: { status: "DELIVERED" }
    });
  }

  return reply.status(HTTP_STATUS.OK).send({
    success: true,
    data: updated
  });
}
