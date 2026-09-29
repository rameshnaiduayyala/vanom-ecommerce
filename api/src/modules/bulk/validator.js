import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

/**
 * Throws an AppError if `condition` is falsy.
 *
 * @param {boolean} condition
 * @param {string} message
 * @param {string} [code]
 */
export function assert(condition, message, code = "BULK_VALIDATION_ERROR") {
  if (!condition) {
    throw new AppError(message, HTTP_STATUS.BAD_REQUEST, code);
  }
}

/**
 * Asserts that a business exists and has APPROVED status.
 * Throws FORBIDDEN if either condition is unmet.
 *
 * @param {object | null | undefined} business
 */
export function assertApproved(business) {
  if (!business) {
    throw new AppError(
      "Approved bulk business access is required",
      HTTP_STATUS.FORBIDDEN,
      "BULK_BUSINESS_REQUIRED"
    );
  }

  if (business.status !== "APPROVED") {
    throw new AppError(
      `Business is ${business.status.toLowerCase()}; approval is required`,
      HTTP_STATUS.FORBIDDEN,
      "BULK_BUSINESS_NOT_APPROVED"
    );
  }
}
