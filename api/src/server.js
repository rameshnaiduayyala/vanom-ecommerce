import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const app = await buildApp();

async function start() {
  try {
    await prisma.$connect();

    // Support both numeric port (standard / cloud) and unix socket (cPanel Passenger)
    const portEnv = process.env.PORT;
    const isSocket = portEnv && (isNaN(Number(portEnv)) || portEnv.startsWith("/") || portEnv.startsWith("\\\\.\\pipe\\"));

    if (isSocket) {
      await app.listen({ path: portEnv });
      app.log.info(`Server listening on passenger socket: ${portEnv}`);
    } else {
      const port = Number(portEnv || env.port || 3000);
      await app.listen({
        port,
        host: "0.0.0.0"
      });
      app.log.info(`Server listening on port ${port}`);
    }
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  app.log.info(`${signal} received. Shutting down...`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
