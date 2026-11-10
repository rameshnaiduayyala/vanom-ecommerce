import { prisma } from "../../config/prisma.js";

/**
 * Reusable Audit Log Helper
 * Safely creates an audit record in the database without failing the primary transaction if logging encounters an issue.
 *
 * @param {Object} params
 * @param {string} [params.actorId] - User/Admin ID performing the action
 * @param {string} [params.actorEmail] - User/Admin email
 * @param {string} [params.actorRole] - User/Admin role (e.g. ADMIN, USER, B2B)
 * @param {string} params.action - Event action code (e.g. PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED, USER_LOGIN, USER_LOGOUT)
 * @param {string} params.entityType - Target entity type (e.g. Product, User, Order, Category, Session)
 * @param {string} [params.entityId] - Target entity ID
 * @param {string} [params.description] - Human-readable explanation of the action
 * @param {string} [params.ipAddress] - IP address of the client
 * @param {string} [params.userAgent] - Browser or user-agent string
 * @param {Object} [params.beforeData] - Snapshot before modification
 * @param {Object} [params.afterData] - Snapshot after modification
 * @param {Object} [params.metadata] - Extra contextual information
 */
export async function logAuditEvent({
  actorId = null,
  actorEmail = null,
  actorRole = null,
  action,
  entityType,
  entityId = null,
  description = null,
  ipAddress = null,
  userAgent = null,
  beforeData = null,
  afterData = null,
  metadata = null,
  request = null,
}) {
  try {
    // If a Fastify request object was passed, automatically extract client IP, agent, and user info if missing
    let resolvedIp = ipAddress;
    let resolvedUserAgent = userAgent;
    let resolvedActorId = actorId;
    let resolvedActorEmail = actorEmail;
    let resolvedActorRole = actorRole;

    if (request) {
      if (!resolvedIp) {
        resolvedIp =
          request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
          request.ip ||
          request.socket?.remoteAddress ||
          "127.0.0.1";
      }
      if (!resolvedUserAgent) {
        resolvedUserAgent = request.headers["user-agent"] || null;
      }
      if (request.user) {
        resolvedActorId = resolvedActorId || request.user.sub || request.user.id || null;
        resolvedActorEmail = resolvedActorEmail || request.user.email || null;
        resolvedActorRole = resolvedActorRole || request.user.role || null;
      }
    }

    const cleanBeforeData = beforeData ? JSON.parse(JSON.stringify(beforeData)) : null;
    const cleanAfterData = afterData ? JSON.parse(JSON.stringify(afterData)) : null;
    const cleanMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : null;

    if (typeof prisma.auditLog?.create === "function") {
      return await prisma.auditLog.create({
        data: {
          actorId: resolvedActorId,
          actorEmail: resolvedActorEmail,
          actorRole: resolvedActorRole,
          action: action.toUpperCase(),
          entityType,
          entityId: entityId ? String(entityId) : null,
          description,
          ipAddress: resolvedIp,
          userAgent: resolvedUserAgent,
          beforeData: cleanBeforeData,
          afterData: cleanAfterData,
          metadata: cleanMetadata,
        },
      });
    }

    // Fallback to queryRaw if client is hot-reloaded without auditLog model on Prisma instance
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AuditLog" ("id", "createdAt", "actorId", "actorEmail", "actorRole", "action", "entityType", "entityId", "description", "ipAddress", "userAgent", "beforeData", "afterData", "metadata")
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb)`,
      id,
      resolvedActorId,
      resolvedActorEmail,
      resolvedActorRole,
      action.toUpperCase(),
      entityType,
      entityId ? String(entityId) : null,
      description,
      resolvedIp,
      resolvedUserAgent,
      cleanBeforeData ? JSON.stringify(cleanBeforeData) : null,
      cleanAfterData ? JSON.stringify(cleanAfterData) : null,
      cleanMetadata ? JSON.stringify(cleanMetadata) : null
    );

    return { id, action, entityType, entityId };
  } catch (error) {
    // Non-blocking log failure so critical user operations continue smoothly
    console.error(`[AUDIT_LOG_ERROR] Failed to record audit log for ${action} on ${entityType}:`, error.message);
    return null;
  }
}
