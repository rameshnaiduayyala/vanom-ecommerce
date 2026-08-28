import { prisma } from "../../infrastructure/database/prisma.js";
import { IdGenerator } from "../../common/utils/id-generator.js";

export class ShippingRepository {
  static async createShipment({ orderId, warehouseId, carrierId, fulfillmentType = "STANDARD", shippingCost = 0, items = [] }, tx = null) {
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
          create: items.map(item => ({
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

  static async findById(id) {
    return prisma.shipment.findUnique({
      where: { id },
      include: {
        order: true,
        warehouse: true,
        carrier: true,
        items: { include: { orderItem: true } },
        events: { orderBy: { occurredAt: "desc" } },
      },
    });
  }

  static async list({ orderId, status, page = 1, limit = 20 }) {
    const where = {};
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.findMany({
        where,
        include: { carrier: true, events: { take: 1, orderBy: { occurredAt: "desc" } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }

  static async addTrackingEvent(shipmentId, { status, description, location }, tx = null) {
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
