import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.js";

async function securityPlugin(fastify, options) {
  await fastify.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: 1000,
    timeWindow: "1 minute",
    allowList: ["127.0.0.1", "localhost"],
  });
}

export default fp(securityPlugin);
