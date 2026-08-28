import fp from "fastify-plugin";
import { AppError } from "../common/errors/index.js";
import { HTTP_STATUS, ERROR_CODES } from "../common/constants/index.js";
import { ApiResponse } from "../common/response/index.js";
import { env } from "../config/env.js";

async function errorHandlerPlugin(fastify, options) {
  fastify.setErrorHandler(function (error, request, reply) {
    const requestId = request.id || `req_${Date.now()}`;

    // Fastify validation errors
    if (error.validation) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(
        ApiResponse.error(
          ERROR_CODES.VALIDATION_ERROR,
          error.message || "Request validation failed",
          error.validation,
          requestId
        )
      );
    }

    // Custom Application Errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(
        ApiResponse.error(
          error.code,
          error.message,
          error.details,
          requestId
        )
      );
    }

    // Fastify Rate-Limit Error
    if (error.statusCode === 429) {
      return reply.status(HTTP_STATUS.TOO_MANY_REQUESTS).send(
        ApiResponse.error(
          "RATE_LIMIT_EXCEEDED",
          "Too many requests, please try again later.",
          null,
          requestId
        )
      );
    }

    // Fastify JWT error
    if (error.statusCode === 401) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send(
        ApiResponse.error(
          ERROR_CODES.UNAUTHENTICATED,
          error.message || "Unauthorized access",
          null,
          requestId
        )
      );
    }

    // Unhandled / Internal Errors
    request.log.error({ err: error, requestId }, "Unhandled application error");

    const message = env.NODE_ENV === "production" ? "Internal server error" : error.message;
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(
      ApiResponse.error(
        ERROR_CODES.INTERNAL_ERROR,
        message,
        env.NODE_ENV === "production" ? null : error.stack,
        requestId
      )
    );
  });

  fastify.setNotFoundHandler(function (request, reply) {
    const requestId = request.id || `req_${Date.now()}`;
    return reply.status(HTTP_STATUS.NOT_FOUND).send(
      ApiResponse.error(
        ERROR_CODES.NOT_FOUND,
        `Route ${request.method}:${request.url} not found`,
        null,
        requestId
      )
    );
  });
}

export default fp(errorHandlerPlugin);
