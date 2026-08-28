import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { env } from "../config/env.js";

async function corsPlugin(fastify, options) {
  fastify.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-Country-Code", "X-Currency-Code"],
  });
}

export default fp(corsPlugin);
