import * as authService from "./auth.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { createAccessToken } from "../../common/utils/jwt.js";
import { logAuditEvent } from "../../common/services/audit.service.js";

export async function register(request, reply) {
  const result = await authService.register(request.body);
  if (process.env.NODE_ENV === "production") delete result.verificationToken;

  await logAuditEvent({
    request,
    actorId: result.user?.id || null,
    actorEmail: result.user?.email || request.body.email,
    actorRole: result.user?.role || "USER",
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: result.user?.id || null,
    description: `New user registration for ${result.user?.email || request.body.email}`,
    afterData: {
      id: result.user?.id,
      email: result.user?.email,
      role: result.user?.role
    }
  });

  return sendSuccess(reply, { statusCode: HTTP_STATUS.CREATED, message: MESSAGES.AUTH_REGISTERED, data: result });
}

export async function login(request, reply) {
  const result = await authService.login(
    request.body,
    (user) => createAccessToken(request.server.jwt, user)
  );

  // Record Audit Trail for Login
  await logAuditEvent({
    request,
    actorId: result.user?.id || null,
    actorEmail: result.user?.email || request.body.email,
    actorRole: result.user?.role || "USER",
    action: "USER_LOGIN",
    entityType: "Session",
    entityId: result.user?.id || null,
    description: `User ${result.user?.email || request.body.email} logged in successfully`,
    metadata: {
      role: result.user?.role,
      hasCompany: Boolean(result.user?.bulkBusinessId || result.user?.organizationId)
    }
  });

  return sendSuccess(reply, { message: MESSAGES.AUTH_LOGIN_SUCCESS, data: result });
}

export async function logout(request, reply) {
  // Record Audit Trail for Logout
  await logAuditEvent({
    request,
    action: "USER_LOGOUT",
    entityType: "Session",
    entityId: request.user?.sub || null,
    description: `User ${request.user?.email || request.user?.sub || "Unknown"} logged out`,
    metadata: {
      role: request.user?.role || null
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
