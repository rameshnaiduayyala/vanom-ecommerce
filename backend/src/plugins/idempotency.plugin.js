import fp from "fastify-plugin";
import { prisma } from "../infrastructure/database/prisma.js";
import { HashUtil } from "../common/utils/hash.js";
import { ConflictError } from "../common/errors/index.js";

async function idempotencyPlugin(fastify, options) {
  fastify.decorate("idempotent", function (options = {}) {
    return async function (request, reply) {
      const idempotencyKey = request.headers["idempotency-key"];
      if (!idempotencyKey) {
        return; // Optional unless specified
      }

      const requestHash = HashUtil.sha256(JSON.stringify(request.body || {}));
      const userId = request.user?.id;
      if (!userId) return; // Only authenticated idempotent requests

      // Look up key in DB
      const existing = await prisma.idempotencyKey.findUnique({
        where: {
          userId_key: { userId, key: idempotencyKey },
        },
      });

      if (existing) {
        // If expired
        if (existing.expiresAt && existing.expiresAt < new Date()) {
          await prisma.idempotencyKey.delete({ where: { id: existing.id } });
        } else if (existing.status === "COMPLETED" && existing.responseStatus && existing.responseBody) {
          // Replay cached response
          reply.header("X-Cache-Lookup", "HIT-IDEMPOTENT");
          return reply.status(existing.responseStatus).send(existing.responseBody);
        } else {
          // Request currently in flight
          throw new ConflictError("A request with this Idempotency-Key is currently being processed.");
        }
      }

      // Store in-flight idempotency record
      try {
        await prisma.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            userId,
            requestHash,
            status: "PROCESSING",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      } catch (err) {
        // If race condition hit
        const raced = await prisma.idempotencyKey.findUnique({
          where: { userId_key: { userId, key: idempotencyKey } },
        });
        if (raced?.responseStatus) {
          reply.header("X-Cache-Lookup", "HIT-IDEMPOTENT");
          return reply.status(raced.responseStatus).send(raced.responseBody);
        }
        throw new ConflictError("Concurrent idempotent request detected.");
      }

      // Attach key to request for controller to update on completion
      request.idempotencyKey = idempotencyKey;
    };
  });
}

export async function saveIdempotentResponse(key, statusCode, body, userId = null) {
  if (!key) return;
  try {
    if (userId) {
      await prisma.idempotencyKey.update({
        where: { userId_key: { userId, key } },
        data: {
          status: "COMPLETED",
          responseStatus: statusCode,
          responseBody: body,
        },
      });
    } else {
      await prisma.idempotencyKey.updateMany({
        where: { key },
        data: {
          status: "COMPLETED",
          responseStatus: statusCode,
          responseBody: body,
        },
      });
    }
  } catch (err) {
    // Non-blocking error
    console.error("Failed to update idempotency key record:", err.message);
  }
}

export default fp(idempotencyPlugin);
