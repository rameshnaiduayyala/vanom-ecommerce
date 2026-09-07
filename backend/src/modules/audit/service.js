import { prisma } from "../../infrastructure/database/prisma.js";

/**
 * AuditService
 * Direct Prisma queries for audit logging
 */
export class AuditService {
  async log(
    {
      actorId,
      action,
      entityType,
      entityId,
      requestId,
      ipAddress,
      userAgent,
      beforeData,
      afterData,
      metadata,
    },
    tx = null
  ) {
    const db = tx || prisma;
    try {
      return await db.auditLog.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          requestId,
          ipAddress,
          userAgent,
          beforeData,
          afterData,
          metadata,
        },
      });
    } catch (err) {
      console.error("Failed to write audit log:", err.message);
    }
  }

  async list({ entityType, entityId, actorId, page = 1, limit = 50 } = {}) {
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }
}
