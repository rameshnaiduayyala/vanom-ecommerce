import { prisma } from "../../infrastructure/database/prisma.js";

export class AuditRepository {
  static async createLog({
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
  }, tx = null) {
    const db = tx || prisma;
    return db.auditLog.create({
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
  }

  static async listLogs({ entityType, entityId, actorId, page = 1, limit = 50 }) {
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { total, items };
  }
}

export class AuditService {
  async log(auditData, tx = null) {
    try {
      return await AuditRepository.createLog(auditData, tx);
    } catch (err) {
      console.error("Failed to write audit log:", err.message);
    }
  }

  async list(params) {
    return AuditRepository.listLogs(params);
  }
}
