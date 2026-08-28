import { prisma } from "../../infrastructure/database/prisma.js";
import { BusinessRuleError } from "../../common/errors/index.js";
import { ERROR_CODES } from "../../common/constants/index.js";

export class InventoryRepository {
  static async getAvailableStock(variantId, warehouseId = null) {
    const where = { variantId };
    if (warehouseId) where.warehouseId = warehouseId;

    const items = await prisma.inventoryItem.findMany({ where });
    const onHand = items.reduce((sum, item) => sum + item.onHand, 0);
    const reserved = items.reduce((sum, item) => sum + item.reserved, 0);

    return {
      variantId,
      onHand,
      reserved,
      available: Math.max(0, onHand - reserved),
    };
  }

  static async reserveStock({ variantId, quantity, orderId = null, warehouseId = null }, tx = null) {
    const db = tx || prisma;
    const where = { variantId };
    if (warehouseId) where.warehouseId = warehouseId;

    const inventoryItems = await db.inventoryItem.findMany({
      where,
      orderBy: { onHand: "desc" },
    });

    let remainingToReserve = quantity;
    const targetItem = inventoryItems.find(item => item.onHand - item.reserved >= remainingToReserve);

    if (!targetItem) {
      const totalAvailable = inventoryItems.reduce((sum, item) => sum + (item.onHand - item.reserved), 0);
      throw new BusinessRuleError(
        `Insufficient inventory for variant ${variantId}. Available: ${totalAvailable}, Requested: ${quantity}`,
        ERROR_CODES.INSUFFICIENT_STOCK
      );
    }

    // Atomic increment of reserved stock
    await db.inventoryItem.update({
      where: { id: targetItem.id },
      data: {
        reserved: { increment: quantity },
      },
    });

    const reservation = await db.inventoryReservation.create({
      data: {
        warehouseId: targetItem.warehouseId,
        variantId,
        orderId,
        quantity,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour hold
      },
    });

    await db.inventoryMovement.create({
      data: {
        warehouseId: targetItem.warehouseId,
        variantId,
        type: "RESERVATION",
        quantity,
        referenceType: "ORDER",
        referenceId: orderId,
        reason: "Order checkout reservation",
      },
    });

    return reservation;
  }

  static async releaseReservation(reservationId, tx = null) {
    const db = tx || prisma;
    const reservation = await db.inventoryReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation || reservation.status !== "ACTIVE") return null;

    await db.inventoryItem.updateMany({
      where: {
        warehouseId: reservation.warehouseId,
        variantId: reservation.variantId,
      },
      data: {
        reserved: { decrement: reservation.quantity },
      },
    });

    await db.inventoryReservation.update({
      where: { id: reservationId },
      data: { status: "RELEASED", releasedAt: new Date() },
    });

    await db.inventoryMovement.create({
      data: {
        warehouseId: reservation.warehouseId,
        variantId: reservation.variantId,
        type: "RELEASE",
        quantity: reservation.quantity,
        referenceType: "RESERVATION",
        referenceId: reservation.id,
        reason: "Cancelled/expired reservation release",
      },
    });

    return reservation;
  }

  static async consumeReservation(reservationId, tx = null) {
    const db = tx || prisma;
    const reservation = await db.inventoryReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) return null;

    await db.inventoryItem.updateMany({
      where: {
        warehouseId: reservation.warehouseId,
        variantId: reservation.variantId,
      },
      data: {
        onHand: { decrement: reservation.quantity },
        reserved: { decrement: reservation.quantity },
      },
    });

    await db.inventoryReservation.update({
      where: { id: reservationId },
      data: { status: "CONSUMED" },
    });

    await db.inventoryMovement.create({
      data: {
        warehouseId: reservation.warehouseId,
        variantId: reservation.variantId,
        type: "SALE",
        quantity: reservation.quantity,
        referenceType: "ORDER",
        referenceId: reservation.orderId,
        reason: "Order fulfillment / sale completion",
      },
    });

    return reservation;
  }

  static async adjustStock({ warehouseId, locationId, variantId, quantity, type = "ADJUSTMENT", reason }, tx = null) {
    const db = tx || prisma;

    const inventoryItem = await db.inventoryItem.upsert({
      where: {
        warehouseId_locationId_variantId: {
          warehouseId,
          locationId: locationId || "",
          variantId,
        },
      },
      create: {
        warehouseId,
        locationId,
        variantId,
        onHand: quantity,
      },
      update: {
        onHand: { increment: quantity },
      },
    });

    await db.inventoryMovement.create({
      data: {
        warehouseId,
        locationId,
        variantId,
        type,
        quantity,
        reason: reason || "Manual inventory adjustment",
      },
    });

    return inventoryItem;
  }
}
