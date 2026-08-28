import { AuthService } from "./service.js";
import { ApiResponse } from "../../common/response/index.js";
import { HTTP_STATUS } from "../../common/constants/index.js";

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (request, reply) => {
    const result = await this.authService.register(request.body);
    return reply.status(HTTP_STATUS.CREATED).send(ApiResponse.success(result));
  };

  login = async (request, reply) => {
    const result = await this.authService.login(request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  refresh = async (request, reply) => {
    const refreshToken = request.body?.refreshToken || request.headers["x-refresh-token"];
    const result = await this.authService.refreshToken(refreshToken);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  logout = async (request, reply) => {
    const refreshToken = request.body?.refreshToken;
    const result = await this.authService.logout(refreshToken);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  getMe = async (request, reply) => {
    const result = await this.authService.getMe(request.user.id);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  forgotPassword = async (request, reply) => {
    const result = await this.authService.forgotPassword(request.body?.email);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };

  resetPassword = async (request, reply) => {
    const result = await this.authService.resetPassword(request.body);
    return reply.status(HTTP_STATUS.OK).send(ApiResponse.success(result));
  };
}
