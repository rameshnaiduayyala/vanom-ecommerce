import fp from "fastify-plugin";
import { prisma } from "../config/database.js";

export default fp(async (app) => {
  app.decorate("prisma", prisma);
  app.addHook("onClose", async () => prisma.$disconnect());
});
