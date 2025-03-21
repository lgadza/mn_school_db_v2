import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import ErrorHandlerUtil, {
  AppError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";

/**
 * Error handling middleware
 * Acts as a centralized error processor for the Express application
 */
export const errorHandlerMiddleware = {
  /**
   * Global error handler middleware
   * This should be registered after all routes
   *
   * @param err - Error object
   * @param req - Express Request
   * @param res - Express Response
   * @param next - Express NextFunction
   */
  globalErrorHandler: ErrorHandlerUtil.globalErrorHandler,

  /**
   * 404 Not Found handler middleware
   * This should be registered after all routes and before the global error handler
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  notFoundHandler: ErrorHandlerUtil.notFoundHandler,

  /**
   * High load protection middleware
   * Returns 503 Service Unavailable when the system is under high load
   *
   * @param req - Express Request
   * @param res - Express Response
   * @param next - Express NextFunction
   */
  highLoadProtection: ErrorHandlerUtil.highLoadProtection,

  /**
   * Async handler wrapper
   * Catches errors in async route handlers and forwards them to the error handler
   *
   * @param fn - Async route handler function
   * @returns Wrapped function that catches errors
   */
  asyncHandler: ErrorHandlerUtil.asyncHandler,

  /**
   * Server-side validation error handler
   *
   * @param err - Error object
   * @param req - Express Request
   * @param res - Express Response
   * @param next - Express NextFunction
   */
  validationErrorHandler: (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Only handle validation errors in this middleware
    if (err.name === "ValidationError") {
      return ErrorHandlerUtil.globalErrorHandler(err, req, res, next);
    }
    next(err);
  },
};

// Re-export error classes for easier imports
export { AppError, NotFoundError };

export default errorHandlerMiddleware;
