import { prisma } from "../database/prisma.js";

export class OutboxService {
  /**
   * Creates an outbox event. If tx (Prisma transaction) is passed, includes it in the transaction.
   */
  static async recordEvent({ aggregateType, aggregateId, eventType, payload }, tx = null) {
    const db = tx || prisma;
    return db.outboxEvent.create({
      data: {
        aggregateType,
        aggregateId,
        eventType,
        payload,
      },
    });
  }

  static async getPendingEvents(limit = 50) {
    return prisma.outboxEvent.findMany({
      where: {
        processedAt: null,
        failedAt: null,
      },
      take: limit,
      orderBy: { createdAt: "asc" },
    });
  }

  static async markProcessed(eventId) {
    return prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        processedAt: new Date(),
      },
    });
  }

  static async markFailed(eventId, errorMessage) {
    return prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        attempts: { increment: 1 },
        lastError: errorMessage,
        failedAt: new Date(),
      },
    });
  }
}
