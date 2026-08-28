import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnectPrisma } from "./infrastructure/database/prisma.js";

async function startServer() {
  const app = await buildApp();

  const shutdown = async (signal) => {
    app.log.info(`Received ${signal}, gracefully shutting down...`);
    try {
      await app.close();
      await disconnectPrisma();
      process.exit(0);
    } catch (err) {
      app.log.error("Error during server shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 Enterprise Ecommerce Backend running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
