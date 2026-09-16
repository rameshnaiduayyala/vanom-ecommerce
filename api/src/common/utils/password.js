import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, salt, keyHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !keyHex) return false;

  const derivedKey = await scrypt(password, salt, 64);
  const storedKey = Buffer.from(keyHex, "hex");
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}
