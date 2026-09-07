import { prisma } from "../../infrastructure/database/prisma.js";
import { IdGenerator } from "../../common/utils/id-generator.js";
import { NotFoundError, ForbiddenError } from "../../common/errors/index.js";

/**
 * ShippingService
 * Direct Prisma queries for Shipments, tracking numbers, carriers, and event updates
 */
export class ShippingService {
  async createShipment({ orderId, warehouseId, carrierId, fulfillmentType = "STANDARD", shippingCost = 0, items = [] }, tx = null) {
    const db = tx || prisma;
    const trackingNumber = IdGenerator.generateTrackingNumber(fulfillmentType.slice(0, 3));

    return db.shipment.create({
      data: {
        orderId,
        warehouseId,
        carrierId,
        trackingNumber,
        fulfillmentType,
        shippingCost,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })),
        },
        events: {
          create: {
            status: "MANIFEST_CREATED",
            description: "Shipment record created, awaiting warehouse pickup",
            occurredAt: new Date(),
          },
        },
      },
      include: { items: true, events: true, carrier: true },
    });
  }

  async getShipmentById(id, user) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        order: true,
        warehouse: true,
        carrier: true,
        items: { include: { orderItem: true } },
        events: { orderBy: { occurredAt: "desc" } },
      },
    });

    if (!shipment) throw new NotFoundError("Shipment not found");

    const isOwner = shipment.order?.userId === user.id;
    const isAdmin = user.roles?.includes("ADMIN") || user.roles?.includes("SUPER_ADMIN");

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Access denied to shipment");
    }

    return shipment;
  }

  async getTracking(id, user) {
    const shipment = await this.getShipmentById(id, user);
    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      carrier: shipment.carrier?.name || "Standard Carrier",
      fulfillmentType: shipment.fulfillmentType,
      events: shipment.events,
    };
  }

  async listShipments(user, { orderId, status, page = 1, limit = 20 } = {}) {
    const where = {};
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.findMany({
        where,
        include: { carrier: true, events: { take: 1, orderBy: { occurredAt: "desc" } } },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  async addTrackingEvent(shipmentId, { status, description, location }, tx = null) {
    const db = tx || prisma;
    const event = await db.trackingEvent.create({
      data: {
        shipmentId,
        status,
        description,
        location,
        occurredAt: new Date(),
      },
    });

    await db.shipment.update({
      where: { id: shipmentId },
      data: { status: status.toUpperCase() },
    });

    return event;
  }
}
