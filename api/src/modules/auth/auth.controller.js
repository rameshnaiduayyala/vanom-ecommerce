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
  const isStaff = role !== "USER";
  const userEmail = result.user?.email || request.body.email;

  // Audit login with IP, Device, and Location tracking
  await logAuditEvent({
    request,
    actorId: result.user?.id || null,
    actorEmail: userEmail,
    actorRole: role,
    action: isStaff ? "ADMIN_LOGIN" : "USER_LOGIN",
    entityType: "Session",
    entityId: result.user?.id || null,
    description: isStaff
      ? `Staff / Admin ${userEmail} (${role}) logged in`
      : `User ${userEmail} logged in`,
    metadata: {
      role,
      hasCompany: Boolean(result.user?.bulkBusinessId || result.user?.organizationId),
      loginAt: new Date().toISOString()
    }
  });

  return sendSuccess(reply, { message: MESSAGES.AUTH_LOGIN_SUCCESS, data: result });
}

export async function logout(request, reply) {
  const role = String(request.user?.role || "USER").toUpperCase();
  const isStaff = role !== "USER";
  const userEmail = request.user?.email || request.user?.sub || "User";

  // Audit logout with IP, Device, and Location tracking
  await logAuditEvent({
    request,
    action: isStaff ? "ADMIN_LOGOUT" : "USER_LOGOUT",
    entityType: "Session",
    entityId: request.user?.sub || null,
    description: isStaff
      ? `Staff / Admin ${userEmail} (${role}) logged out`
      : `User ${userEmail} logged out`,
    metadata: {
      role,
      logoutAt: new Date().toISOString()
    }
  });

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
