import * as authService from "./auth.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { createAccessToken } from "../../common/utils/jwt.js";
import { logAuditEvent } from "../../common/services/audit.service.js";

export async function register(request, reply) {
  const result = await authService.register(request.body);
  if (process.env.NODE_ENV === "production") delete result.verificationToken;

  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.AUTH_REGISTERED, data: result });
}

export async function login(request, reply) {
  const result = await authService.login(
    request.body,
    (user) => createAccessToken(request.server.jwt, user)
  );

  const role = String(result.user?.role || "USER").toUpperCase();
  const isAdminOrStaff = role !== "USER";

  // Only audit administrative/staff logins, NOT regular public consumer users
  if (isAdminOrStaff) {
    await logAuditEvent({
      request,
      actorId: result.user?.id || null,
      actorEmail: result.user?.email || request.body.email,
      actorRole: role,
      action: "ADMIN_LOGIN",
      entityType: "Session",
      entityId: result.user?.id || null,
      description: `Staff / Admin ${result.user?.email || request.body.email} (${role}) logged in`,
      metadata: {
        role,
        hasCompany: Boolean(result.user?.bulkBusinessId || result.user?.organizationId)
      }
    });
  }

  return sendSuccess(reply, { message: MESSAGES.AUTH_LOGIN_SUCCESS, data: result });
}

export async function logout(request, reply) {
  const role = String(request.user?.role || "USER").toUpperCase();
  const isAdminOrStaff = role !== "USER";

  // Only audit administrative/staff logouts, NOT regular public consumer users
  if (isAdminOrStaff) {
    await logAuditEvent({
      request,
      action: "ADMIN_LOGOUT",
      entityType: "Session",
      entityId: request.user?.sub || null,
      description: `Staff / Admin ${request.user?.email || request.user?.sub || "Unknown"} (${role}) logged out`,
      metadata: {
        role
      }
    });
  }

  return sendSuccess(reply, { message: "Logged out successfully", data: null });
}

export async function verifyEmail(request, reply) {
  await authService.verifyEmail(request.query.token);
  return sendSuccess(reply, { message: MESSAGES.AUTH_EMAIL_VERIFIED, data: null });
}

export async function me(request, reply) {
  const user = await authService.getCurrentUser(request.user.sub);
  return sendSuccess(reply, { message: MESSAGES.AUTH_ME_FETCHED, data: user });
}

export async function forgotPassword(request, reply) {
  await authService.requestPasswordReset(request.body.email);
  return sendSuccess(reply, {
    message: "If your email is registered with us, a password reset link has been dispatched.",
    data: null
  });
}

export async function resetPassword(request, reply) {
  await authService.resetPassword(request.body.token, request.body.password);
  return sendSuccess(reply, { message: MESSAGES.PASSWORD_RESET_SUCCESS, data: null });
}
