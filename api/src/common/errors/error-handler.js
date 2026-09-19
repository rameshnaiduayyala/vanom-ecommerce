import { Prisma } from "@prisma/client";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { env } from "../../config/env.js";

export function registerErrorHandler(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const isProduction = env.nodeEnv === "production";

    if (error.isOperational) {
      const response = {
        success: false,
        message: error.message,
        error: { code: error.code }
      };
      if (!isProduction && error.details) response.error.details = error.details;
      if (!isProduction && error.stack) response.error.stack = error.stack;
      return reply.code(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).send(response);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return reply.code(HTTP_STATUS.CONFLICT).send({
          success: false,
          message: "A unique value already exists",
          error: { code: "DUPLICATE_RESOURCE" }
        });
      }

      if (error.code === "P2025") {
        return reply.code(HTTP_STATUS.NOT_FOUND).send({
          success: false,
          message: "Resource not found",
          error: { code: "RESOURCE_NOT_FOUND" }
        });
      }
    }

    if (error.validation) {
      const response = {
        success: false,
        message: "Validation error",
        error: {
          code: "VALIDATION_ERROR",
          ...(!isProduction ? { details: error.validation } : {})
        }
      };
      if (!isProduction && error.stack) response.error.stack = error.stack;
      return reply.code(HTTP_STATUS.BAD_REQUEST).send(response);
    }

    const response = {
      success: false,
      message: isProduction ? "Internal server error" : (error.message || "Internal server error"),
      error: { code: "INTERNAL_SERVER_ERROR" }
    };
    if (!isProduction && error.stack) response.error.stack = error.stack;
    return reply.code(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(response);
  });
}
