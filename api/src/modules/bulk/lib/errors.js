import { AppError } from "../../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";

/**
 * Throws an AppError — used as a "never returns" throw helper so callers can
 * write `return fail(...)` for type-narrowing without an explicit `throw`.
 *
 * @param {string} message
 * @param {string} [code]
 * @param {number} [status]
 * @returns {never}
 */
export function fail(message, code = "BULK_NOT_FOUND", status = HTTP_STATUS.NOT_FOUND) {
  throw new AppError(message, status, code);
}
