import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import logger from "@/common/utils/logging/logger";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import { ValidationError as JoiValidationError } from "joi";
import { QueryFailedError } from "typeorm";
import DiagnosticsUtil from "@/common/utils/system/diagnosticsUtil";
import { appConfig } from "@/config"; // Import appConfig to check environment
import {
  ErrorCode,
  ErrorSeverity,
  ErrorMetadata,
  createErrorMetadata,
} from "./errorCodes";

// Re-export error codes
export { ErrorCode, ErrorSeverity, ErrorMetadata, createErrorMetadata };

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpStatus;
  public readonly isOperational: boolean;
  public readonly metadata: ErrorMetadata;

  constructor(
    message: string,
    httpCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ErrorCode.GEN_INTERNAL_ERROR,
    isOperational: boolean = true,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message);

    this.name = this.constructor.name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.metadata = {
      code,
      timestamp: new Date().toISOString(),
      severity: metadata?.severity || ErrorSeverity.ERROR,
      source: metadata?.source || "server",
      additionalInfo: metadata?.additionalInfo,
    };

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, HttpStatus.NOT_FOUND, ErrorCode.RES_NOT_FOUND, true, {
      ...metadata,
      severity: ErrorSeverity.WARNING,
    });
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends AppError {
  constructor(
    message: string = "Bad request",
    code: ErrorCode = ErrorCode.VAL_INVALID_FORMAT,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, true, {
      ...metadata,
      severity: ErrorSeverity.WARNING,
    });
  }
}

/**
 * 401 Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Unauthorized",
    code: ErrorCode = ErrorCode.AUTH_MISSING_TOKEN,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, HttpStatus.UNAUTHORIZED, code, true, {
      ...metadata,
      severity: ErrorSeverity.WARNING,
    });
  }
}

/**
 * 403 Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "Forbidden",
    metadata?: Partial<ErrorMetadata>
  ) {
    super(
      message,
      HttpStatus.FORBIDDEN,
      ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
      true,
      {
        ...metadata,
        severity: ErrorSeverity.WARNING,
      }
    );
  }
}

/**
 * 409 Conflict error
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, HttpStatus.CONFLICT, ErrorCode.RES_CONFLICT, true, {
      ...metadata,
      severity: ErrorSeverity.WARNING,
    });
  }
}

/**
 * 422 Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation error",
    metadata?: Partial<ErrorMetadata>
  ) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCode.VAL_INVALID_FORMAT,
      true,
      {
        ...metadata,
        severity: ErrorSeverity.WARNING,
      }
    );
  }
}

/**
 * 500 Database error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "Database error",
    metadata?: Partial<ErrorMetadata>
  ) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_FAILED,
      true,
      {
        ...metadata,
        severity: ErrorSeverity.ERROR,
      }
    );
  }
}

/**
 * 503 Service Unavailable error
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = "Service unavailable",
    metadata?: Partial<ErrorMetadata>
  ) {
    super(
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.EXT_SERVICE_UNAVAILABLE,
      true,
      {
        ...metadata,
        severity: ErrorSeverity.ERROR,
      }
    );
  }
}

/**
 * File Error
 * Used for errors related to file uploads and processing
 */
export class FileError extends AppError {
  constructor(
    message: string = "File processing error",
    code: ErrorCode = ErrorCode.FILE_ERROR,
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, true, {
      ...metadata,
      severity: ErrorSeverity.WARNING,
    });
    Object.defineProperty(this, "name", { value: "FileError" });
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
        {
          code: error.metadata.code,
          metadata: error.metadata,
        },
        { requestId: req.headers["x-request-id"] as string }
      );
    } else if (error instanceof JoiValidationError) {
      // Joi validation errors
      return ResponseUtil.sendBadRequest(
        res,
        "Validation failed",
        {
          code: ErrorCode.VAL_INVALID_FORMAT,
          details: error.details,
        },
        { requestId: req.headers["x-request-id"] as string }
      );
    } else if (error instanceof QueryFailedError) {
      // Database query errors
      const sanitizedError = this.mapDatabaseError(error);
      return ResponseUtil.sendError(
        res,
        sanitizedError.message,
        sanitizedError.httpCode,
        {
          code: sanitizedError.code,
          originalCode: (error as any).code,
        },
        { requestId: req.headers["x-request-id"] as string }
      );
    } else if (error.name === "SyntaxError") {
      // JSON parsing errors
      return ResponseUtil.sendBadRequest(
        res,
        "Invalid JSON in request body",
        { code: ErrorCode.VAL_INVALID_FORMAT }, // Changed from BAD_REQUEST to VAL_INVALID_FORMAT
        { requestId: req.headers["x-request-id"] as string }
      );
    }

    // Default to 500 for unhandled errors
    return ResponseUtil.sendError(
      res,
      "Internal Server Error",
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: ErrorCode.GEN_INTERNAL_ERROR },
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
   * Map database errors to appropriate AppErrors
   */
  private static mapDatabaseError(error: any): {
    message: string;
    httpCode: HttpStatus;
    code: ErrorCode;
  } {
    // In production, don't leak database details
    if (process.env.NODE_ENV === "production") {
      if (error.code === "23505") {
        return {
          message: "A record with the same unique constraint already exists",
          httpCode: HttpStatus.CONFLICT,
          code: ErrorCode.DB_CONSTRAINT_VIOLATION,
        };
      } else if (error.code === "23503") {
        return {
          message: "Foreign key constraint violation",
          httpCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.DB_CONSTRAINT_VIOLATION,
        };
      } else if (error.code === "42P01") {
        return {
          message: "Database resource not found",
          httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.DB_QUERY_FAILED,
        };
      }
      return {
        message: "A database error occurred",
        httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DB_QUERY_FAILED,
      };
    }

    return {
      message: error.message,
      httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.DB_QUERY_FAILED,
    };
  }

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
   * Skips check in development/local environments
   */
  public static highLoadProtection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Skip load check in development/local environment
    if (appConfig.isDevelopment) {
      return next();
    }

    if (await DiagnosticsUtil.isSystemUnderHighLoad()) {
      logger.warn("System under high load, rejecting request");
      // Set Retry-After header directly
      res.setHeader("Retry-After", "30");
      return ResponseUtil.sendError(
        res,
        "Service temporarily unavailable due to high load",
        HttpStatus.SERVICE_UNAVAILABLE,
        { code: ErrorCode.EXT_SERVICE_UNAVAILABLE },
        { requestId: req.headers["x-request-id"] as string }
      );
    }
    next();
  };
}

export default ErrorHandlerUtil;
