import { checkDatabaseConnection } from "../../infrastructure/database/prisma.js";
import { ApiResponse } from "../../common/response/index.js";

export async function liveHandler(request, reply) {
  return ApiResponse.success({ status: "alive", timestamp: new Date().toISOString() });
}

export async function readyHandler(request, reply) {
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    return reply.status(503).send(ApiResponse.error("DATABASE_UNAVAILABLE", "PostgreSQL database connection failed"));
  }
  return ApiResponse.success({
    status: "ready",
    database: "connected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

export default async function healthRoutes(fastify, options) {
  fastify.get("/health/live", liveHandler);
  fastify.get("/health/ready", readyHandler);
}
