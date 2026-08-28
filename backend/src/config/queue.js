import { Queue } from "bullmq";
import { env } from "./env.js";

const connection = { url: env.redisUrl };

export const queues = {
  order: new Queue("order", { connection }),
  payment: new Queue("payment", { connection }),
  inventory: new Queue("inventory", { connection }),
  email: new Queue("email", { connection }),
  search: new Queue("search", { connection }),
  verification: new Queue("verification", { connection })
};
