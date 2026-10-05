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
    logger: true,
    maxParamLength: 500
  });

  // Preserve raw body buffer for Stripe HMAC webhook verification
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      try {
        req.rawBody = body;
        const json = body && body.length > 0 ? JSON.parse(body.toString("utf8")) : {};
        done(null, json);
      } catch (err) {
        err.statusCode = 400;
        done(err, undefined);
      }
    }
  );

  await fastify.register(fastifyJwt, { secret: env.jwtSecret });
  await registerRateLimit(fastify);
  await registerUploadPlugin(fastify);

  await registerCors(fastify);

  // Standard HTTP Security Headers (Defense in depth)
  fastify.addHook("onSend", async (request, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    if (env.nodeEnv === "production") {
      reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
  });

  await registerRootRoutes(fastify);

  await registerRoutes(fastify);

  registerErrorHandler(fastify);

  return fastify;
}
