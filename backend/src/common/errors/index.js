import { HTTP_STATUS, ERROR_CODES } from "../constants/index.js";

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = ERROR_CODES.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = ERROR_CODES.VALIDATION_ERROR, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = ERROR_CODES.UNAUTHENTICATED, details = null) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access", code = ERROR_CODES.FORBIDDEN, details = null) {
    super(message, HTTP_STATUS.FORBIDDEN, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = ERROR_CODES.NOT_FOUND, details = null) {
    super(message, HTTP_STATUS.NOT_FOUND, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", code = ERROR_CODES.CONFLICT, details = null) {
    super(message, HTTP_STATUS.CONFLICT, code, details);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message, code = ERROR_CODES.VALIDATION_ERROR, details = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, code, details);
  }
}
