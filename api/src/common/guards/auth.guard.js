import { AppError } from "../errors/app-error.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

export async function authenticate(request) {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError(MESSAGES.AUTHENTICATION_REQUIRED, HTTP_STATUS.UNAUTHORIZED, "AUTHENTICATION_REQUIRED");
  }
}

export function authorize(...roles) {
  return async function authorizationGuard(request) {
    if (!roles.includes(request.user?.role)) {
      throw new AppError(MESSAGES.AUTHORIZATION_REQUIRED, HTTP_STATUS.FORBIDDEN, "AUTHORIZATION_REQUIRED");
    }
  };
}

export const requireRoles = (...roles) => [authenticate, authorize(...roles)];
export const requireSuperadmin = requireRoles("SUPERADMIN");
