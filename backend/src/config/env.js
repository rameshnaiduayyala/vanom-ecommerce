import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  HOST: process.env.HOST || "0.0.0.0",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/vanom_ecommerce",
  JWT_SECRET: process.env.JWT_SECRET || "enterprise-super-secret-jwt-key-2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || "local",
  LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH || "./uploads",
  DEFAULT_COUNTRY: process.env.DEFAULT_COUNTRY || "IN",
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || "INR",
};
