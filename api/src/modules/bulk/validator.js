import { AppError } from "../../common/errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export function assert(condition, message, code = "BULK_VALIDATION_ERROR") { if (!condition) throw new AppError(message, HTTP_STATUS.BAD_REQUEST, code); }
export function assertApproved(business) { if (!business) throw new AppError("Approved bulk business access is required", HTTP_STATUS.FORBIDDEN, "BULK_BUSINESS_REQUIRED"); if (business.status !== "APPROVED") throw new AppError(`Business is ${business.status.toLowerCase()}; approval is required`, HTTP_STATUS.FORBIDDEN, "BULK_BUSINESS_NOT_APPROVED"); }
export function selectTier(tiers, quantity) { const matches = tiers.filter((t) => quantity >= t.minQuantity && (t.maxQuantity == null || quantity <= t.maxQuantity)); return matches.sort((a, b) => b.minQuantity - a.minQuantity)[0] ?? null; }
