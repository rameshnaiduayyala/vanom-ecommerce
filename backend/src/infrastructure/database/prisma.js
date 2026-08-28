import { PrismaClient } from "@prisma/client";
import { databaseConfig } from "../../config/database.js";

let prismaInstance = null;

export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: databaseConfig.log,
    });
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}
