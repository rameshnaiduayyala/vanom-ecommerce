import cors from "@fastify/cors";
import { env } from "../config/env.js";

export async function registerCors(fastify) {
  const allowedOrigins = new Set([
    ...env.allowedOrigins,
    env.clientUrl,
    env.appUrl
  ].map((url) => (url ? url.replace(/\/+$/, "") : null)).filter(Boolean));

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return cb(null, true);
      }

      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.has(normalized)) {
        return cb(null, true);
      }

      // In non-production, allow any local development port (Vite 5173, 5174, etc.)
      if (env.nodeEnv !== "production") {
        if (/^https?:\/\/localhost(:\d+)?$/.test(normalized) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)) {
          return cb(null, true);
        }
      }

      // Reject unknown origins safely without throwing internal 500 error
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "x-country-code",
      "x-currency-code",
      "idempotency-key",
      "Idempotency-Key",
      "stripe-signature",
      "x-shippo-signature",
      "shippo-signature-sha256"
    ],
    exposedHeaders: [
      "Content-Disposition",
      "Content-Type",
      "Content-Length"
    ]
  });
}

