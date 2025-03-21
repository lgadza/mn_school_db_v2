import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import logger from "@/common/utils/logging/logger";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import { ValidationError as JoiValidationError } from "joi";
import { QueryFailedError } from "typeorm";
import DiagnosticsUtil from "@/common/utils/system/diagnosticsUtil";

/**
 * Custom error codes
 */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  THIRD_PARTY_API_ERROR = "THIRD_PARTY_API_ERROR",
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpStatus;
  public readonly isOperational: boolean;
  public readonly code: ErrorCode;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    httpCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);

    this.name = this.constructor.name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.code = code;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    context?: Record<string, any>
  ) {
    super(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, true, context);
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", context?: Record<string, any>) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCode.BAD_REQUEST,
      true,
      context
    );
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", context?: Record<string, any>) {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      true,
      context
    );
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", context?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, true, context);
  }
}

/**
 * 409 Conflict error
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    context?: Record<string, any>
  ) {
    super(message, HttpStatus.CONFLICT, ErrorCode.CONFLICT, true, context);
  }
}

/**
 * 422 Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation error",
    context?: Record<string, any>
  ) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCode.VALIDATION_ERROR,
      true,
      context
    );
  }
}

/**
 * 500 Database error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "Database error",
    context?: Record<string, any>
  ) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      true,
      context
    );
  }
}

/**
 * 503 Service Unavailable error
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = "Service unavailable",
    context?: Record<string, any>
  ) {
    super(
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.SERVICE_UNAVAILABLE,
      true,
      context
    );
  }
}

/**
 * Error Handler Utility
 * Provides standardized methods for error handling
 */
export class ErrorHandlerUtil {
  /**
   * Global error handler middleware for Express
   *
   * @param error - Error object
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Express NextFunction
   */
  public static globalErrorHandler: ErrorRequestHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Log the error with request details
    const logContext = {
      errorName: error.name,
      path: req.path,
      method: req.method,
      requestId: req.headers["x-request-id"] || "unknown",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    logger.error(`[${logContext.errorName}] ${error.message}`, {
      ...logContext,
      stack: error.stack,
    });

    // Handle different types of errors
    if (error instanceof AppError) {
      // Our custom application errors
      return ResponseUtil.sendError(
        res,
        error.message,
        error.httpCode,
        { code: error.code, context: error.context },
        { requestId: req.headers["x-request-id"] as string }
      );
    } else if (error instanceof JoiValidationError) {
      // Joi validation errors
      return ResponseUtil.sendBadRequest(
        res,
        "Validation failed",
        error.details,
        { requestId: req.headers["x-request-id"] as string }
      );
    } else if (error instanceof QueryFailedError) {
      // Database query errors
      const sanitizedMessage = this.sanitizeDatabaseError(error);
      return ResponseUtil.sendError(
        res,
        sanitizedMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { code: ErrorCode.DATABASE_ERROR },
        { requestId: req.headers["x-request-id"] as string }
      );
    } else if (error.name === "SyntaxError") {
      // JSON parsing errors
      return ResponseUtil.sendBadRequest(
        res,
        "Invalid JSON in request body",
        { code: ErrorCode.BAD_REQUEST },
        { requestId: req.headers["x-request-id"] as string }
      );
    }

    // Default to 500 for unhandled errors
    return ResponseUtil.sendError(
      res,
      "Internal Server Error",
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: ErrorCode.INTERNAL_SERVER_ERROR },
      { requestId: req.headers["x-request-id"] as string }
    );
  };

  /**
   * 404 middleware for Express
   *
   * @param req - Express Request object
   * @param res - Express Response object
   */
  public static notFoundHandler = (req: Request, res: Response) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return ResponseUtil.sendNotFound(
      res,
      `Route not found: ${req.method} ${req.originalUrl}`,
      { requestId: req.headers["x-request-id"] as string }
    );
  };

  /**
   * Sanitize database error messages for production
   *
   * @param error - Database error
   * @returns Sanitized error message
   */
  private static sanitizeDatabaseError(error: any): string {
    // In production, don't leak database details
    if (process.env.NODE_ENV === "production") {
      if (error.code === "23505") {
        return "A record with the same unique constraint already exists";
      } else if (error.code === "23503") {
        return "Foreign key constraint violation";
      } else if (error.code === "42P01") {
        return "Database resource not found";
      }
      return "A database error occurred";
    }

    return error.message;
  }

  /**
   * Create an async route handler that catches errors
   *
   * @param fn - Async route handler function
   * @returns Express middleware that catches errors
   */
  public static asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Detect high load and return 503 if the system is overloaded
   */
  public static highLoadProtection = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (DiagnosticsUtil.isSystemUnderHighLoad()) {
      logger.warn("System under high load, rejecting request");
      // Set Retry-After header directly
      res.setHeader("Retry-After", "30");
      return ResponseUtil.sendError(
        res,
        "Service temporarily unavailable due to high load",
        HttpStatus.SERVICE_UNAVAILABLE,
        { code: ErrorCode.SERVICE_UNAVAILABLE },
        { requestId: req.headers["x-request-id"] as string }
      );
    }
    next();
  };
}

export default ErrorHandlerUtil;
