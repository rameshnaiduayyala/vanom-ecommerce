import * as authService from "./auth.service.js";
import { sendSuccess } from "../../common/response/api-response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";

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
  return sendSuccess(reply, { message: MESSAGES.AUTH_LOGIN_SUCCESS, data: result });
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
  const token = await authService.requestPasswordReset(request.body.email);
  const data = !process.env.NODE_ENV || process.env.NODE_ENV !== "production" ? { resetToken: token } : null;
  return sendSuccess(reply, { message: MESSAGES.PASSWORD_RESET_REQUESTED, data });
}

export async function resetPassword(request, reply) {
  await authService.resetPassword(request.body.token, request.body.password);
  return sendSuccess(reply, { message: MESSAGES.PASSWORD_RESET_SUCCESS, data: null });
}
