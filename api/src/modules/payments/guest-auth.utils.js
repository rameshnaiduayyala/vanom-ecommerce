/**
 * guest-auth.utils.js — Cryptographic token generation and verification for guest order access.
 *
 * Implements requirement 2.1:
 * - Generate a cryptographically secure random token (32 bytes hex).
 * - Store only its SHA-256 hash in the database.
 * - Bind it to a specific order with an expiration window (24h default).
 * - Verify it on every guest order operation using timing-safe comparison.
 * - Never use a sequential order ID as an authorization credential.
 */
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

const DEFAULT_GUEST_EXPIRY_HOURS = 24;

/**
 * Generates a new cryptographically secure token and its SHA-256 hash.
 *
 * @param {number} [expiryHours=24] Expiration in hours
 * @returns {{ rawToken: string, tokenHash: string, expiresAt: string }}
 */
export function generateGuestOrderAuth(expiryHours = DEFAULT_GUEST_EXPIRY_HOURS) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashGuestOrderToken(rawToken);
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

/**
 * Computes SHA-256 hex digest of a guest token.
 *
 * @param {string} token
 * @returns {string}
 */
export function hashGuestOrderToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token to hash");
  }
  return createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * Validates a candidate raw guest token against a stored SHA-256 hash and expiry.
 * Employs timingSafeEqual to defeat timing attacks.
 *
 * @param {string} candidateRawToken
 * @param {string} storedHash
 * @param {string|Date} [expiresAt]
 * @returns {boolean}
 */
export function verifyGuestOrderToken(candidateRawToken, storedHash, expiresAt = null) {
  if (!candidateRawToken || typeof candidateRawToken !== "string" || !storedHash || typeof storedHash !== "string") {
    return false;
  }

  // Check expiration if set
  if (expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    if (!Number.isNaN(expiryTime) && Date.now() > expiryTime) {
      return false;
    }
  }

  try {
    const candidateHash = hashGuestOrderToken(candidateRawToken);
    const candidateBuf = Buffer.from(candidateHash, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");

    if (candidateBuf.length !== storedBuf.length) {
      return false;
    }

    return timingSafeEqual(candidateBuf, storedBuf);
  } catch {
    return false;
  }
}
