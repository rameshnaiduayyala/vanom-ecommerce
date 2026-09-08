import Fastify from "fastify";
import multipart from "@fastify/multipart";
import securityPlugin from "./plugins/security.plugin.js";
import corsPlugin from "./plugins/cors.plugin.js";
import authPlugin from "./plugins/auth.plugin.js";
import idempotencyPlugin from "./plugins/idempotency.plugin.js";
import errorHandlerPlugin from "./plugins/error.plugin.js";
import healthRoutes from "./modules/health/routes.js";
import registerRoutes from "./routes/index.js";

// Enable BigInt JSON serialization globally
if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return Number(this);
  };
}

export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: opts.logger !== undefined ? opts.logger : true,
    requestIdHeader: "x-request-id",
  });

  // Custom JSON parser allowing empty string bodies (e.g. DELETE/GET with Content-Type header)
  app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
    if (!body || (typeof body === "string" && body.trim() === "")) {
      done(null, {});
      return;
    }
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  // Multipart file uploads (images, docs)
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 5,
    },
  });

  // Security and Utility Plugins
  await app.register(securityPlugin);
  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(idempotencyPlugin);
  await app.register(errorHandlerPlugin);

  // Health check routes
  await app.register(healthRoutes);

  // Master API Routes
  await app.register(registerRoutes, { prefix: "/api/v1" });

  return app;
}
