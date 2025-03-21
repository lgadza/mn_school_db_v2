import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "@/common/utils/logging/logger";
import { performance } from "perf_hooks";

/**
 * Request logging options interface
 */
interface RequestLoggingOptions {
  excludePaths: string[];
  logRequestBody: boolean;
  logRequestHeaders: boolean;
  logResponseBody: boolean;
  logResponseHeaders: boolean;
  sensitiveFields: string[];
  maxBodyLength: number;
}

/**
 * Request Logger Middleware
 * Provides comprehensive request/response logging for monitoring and auditing
 */
export class RequestLoggerMiddleware {
  /**
   * Default request logging options
   */
  private static readonly DEFAULT_OPTIONS: RequestLoggingOptions = {
    excludePaths: ["/api/health", "/api/metrics", "/favicon.ico"],
    logRequestBody: process.env.NODE_ENV !== "production",
    logRequestHeaders: process.env.NODE_ENV !== "production",
    logResponseBody: false, // Typically too verbose for production
    logResponseHeaders: true,
    sensitiveFields: [
      "password",
      "token",
      "authorization",
      "secret",
      "creditCard",
      "ssn",
    ],
    maxBodyLength: 10000, // Maximum body length to log
  };

  /**
   * Create request logger middleware
   *
   * @param options - Request logging options
   * @returns Express middleware function
   */
  public static create(options?: Partial<RequestLoggingOptions>) {
    const config = { ...this.DEFAULT_OPTIONS, ...options };

    return (req: Request, res: Response, next: NextFunction) => {
      // Skip logging for excluded paths
      if (config.excludePaths.some((path) => req.path.includes(path))) {
        return next();
      }

      // Generate or use existing request ID
      const requestId = (req.headers["x-request-id"] as string) || uuidv4();
      req.headers["x-request-id"] = requestId;

      // Set request start time
      const startTime = performance.now();

      // Gather request information
      const requestInfo = {
        id: requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        path: req.path,
        params: req.params,
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        // userId: req.user?.userId || "anonymous",
        userId: (req as any).user?.userId || "anonymous",

        timestamp: new Date().toISOString(),
      };

      // Add body if enabled and present
      if (config.logRequestBody && req.body) {
        const sanitizedBody = this.sanitizeObject(
          req.body,
          config.sensitiveFields
        );
        const bodyStr = JSON.stringify(sanitizedBody);

        if (bodyStr.length <= config.maxBodyLength) {
          (requestInfo as any).body = sanitizedBody;
        } else {
          (
            requestInfo as any
          ).body = `[Content too large: ${bodyStr.length} bytes]`;
        }
      }

      // Add headers if enabled
      if (config.logRequestHeaders) {
        (requestInfo as any).headers = this.sanitizeObject(
          { ...req.headers },
          config.sensitiveFields
        );
      }

      // Log request
      logger.info(`REQUEST ${req.method} ${req.path}`, requestInfo);

      // Capture the original end method
      const originalEnd = res.end;

      // Override end method to log response
      res.end = function (chunk?: any, encoding?: any, callback?: any): any {
        // Restore original end
        res.end = originalEnd;

        // Calculate duration
        const duration = performance.now() - startTime;

        // Add response headers
        res.setHeader("X-Request-ID", requestId);
        res.setHeader("X-Response-Time", `${duration.toFixed(2)}ms`);

        // Prepare response log info
        const responseInfo = {
          id: requestId,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          duration: `${duration.toFixed(2)}ms`,
          timestamp: new Date().toISOString(),
        };

        // Add response headers if enabled
        if (config.logResponseHeaders) {
          const headersObj = {};
          const headersSent = res.getHeaderNames();
          for (const header of headersSent) {
            (headersObj as any)[header] = res.getHeader(header);
          }
          (responseInfo as any).headers = headersObj;
        }

        // Log response based on status code
        const logLevel =
          res.statusCode >= 500
            ? "error"
            : res.statusCode >= 400
            ? "warn"
            : "info";

        logger[logLevel](
          `RESPONSE ${res.statusCode} ${req.method} ${
            req.path
          } [${duration.toFixed(2)}ms]`,
          responseInfo
        );

        // Call original end method
        return originalEnd.call(this, chunk, encoding, callback);
      };

      next();
    };
  }

  /**
   * Sanitize an object by removing sensitive fields
   *
   * @param obj - Object to sanitize
   * @param sensitiveFields - List of sensitive field names
   * @returns Sanitized object
   */
  private static sanitizeObject(obj: any, sensitiveFields: string[]): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();

      // Check if this key contains any sensitive field name
      if (
        sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))
      ) {
        sanitized[key] = "[REDACTED]";
      } else if (
        typeof sanitized[key] === "object" &&
        sanitized[key] !== null
      ) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeObject(sanitized[key], sensitiveFields);
      }
    }

    return sanitized;
  }
}

export default RequestLoggerMiddleware;
