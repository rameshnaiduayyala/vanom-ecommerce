import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { registerCors } from "./plugins/cors.js";
import { registerRootRoutes } from "./routes/root.routes.js";
import { registerRoutes } from "./routes/index.js";
import { registerErrorHandler } from "./common/errors/error-handler.js";
import { registerRateLimit } from "./plugins/rate-limit.js";
import { registerUploadPlugin } from "./plugins/upload.js";
import { env } from "./config/env.js";

export async function buildApp() {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(fastifyJwt, { secret: env.jwtSecret });
  await registerRateLimit(fastify);
  await registerUploadPlugin(fastify);

  await registerCors(fastify);

  await registerRootRoutes(fastify);

  await registerRoutes(fastify);

  registerErrorHandler(fastify);

  return fastify;
}
