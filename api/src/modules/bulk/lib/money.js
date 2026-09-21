/**
 * Safely converts a Prisma Decimal / string / undefined value to a JS number.
 *
 * @param {unknown} value
 * @returns {number}
 */
export function money(value) {
  return Number(value ?? 0);
}
