import fp from "fastify-plugin";
import { redis } from "../config/redis.js";

export default fp(async (app) => {
  app.decorate("redis", redis);
  app.addHook("onClose", async () => redis.quit());
});
