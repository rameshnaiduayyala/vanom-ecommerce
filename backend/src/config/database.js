import { env } from "./env.js";

export const databaseConfig = {
  url: env.DATABASE_URL,
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
};
