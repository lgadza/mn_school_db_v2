import { Response } from "express";
import logger from "@/common/utils/logging/logger";

/**
 * HTTP Status Codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Standard API Response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  error?: any;
  meta?: {
    timestamp: string;
    requestId?: string;
    processingTimeMs?: number;
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    version?: string;
  };
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  totalItems: number;
}

/**
 * API Response Utility Class
 * Provides standardized methods for API responses
 */
export class ResponseUtil {
  /**
   * Creates a success response
   *
   * @param data - The data to be sent
   * @param message - Success message
   * @param statusCode - HTTP status code
   * @param meta - Additional metadata
   * @returns Formatted API response
   */
  public static success<T>(
    data?: T,
    message: string = "Operation successful",
    statusCode: number = HttpStatus.OK,
    meta?: Partial<ApiResponse<T>["meta"]>
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      code: statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return response;
  }

  /**
   * Creates an error response
   *
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param error - Error details
   * @param meta - Additional metadata
   * @returns Formatted API response
   */
  public static error<T>(
    message: string = "An error occurred",
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: any,
    meta?: Partial<ApiResponse<T>["meta"]>
  ): ApiResponse<T> {
    // Log the error for internal tracking
    logger.error(`API Error: ${message}`, { statusCode, error });

    // Clean the error for production to avoid leaking sensitive information
    const sanitizedError =
      process.env.NODE_ENV === "production" ? error?.message || error : error;

    const response: ApiResponse<T> = {
      success: false,
      code: statusCode,
      message,
      error: sanitizedError,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return response;
  }

  /**
   * Send a standardized success response
   *
   * @param res - Express Response object
   * @param data - The data to be sent
   * @param message - Success message
   * @param statusCode - HTTP status code
   * @param meta - Additional metadata
   */
  public static sendSuccess<T>(
    res: Response,
    data?: T,
    message: string = "Operation successful",
    statusCode: number = HttpStatus.OK,
    meta?: Partial<ApiResponse<T>["meta"]>
  ): void {
    const response = this.success(data, message, statusCode, meta);
    res.status(statusCode).json(response);
  }

  /**
   * Send a standardized error response
   *
   * @param res - Express Response object
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param error - Error details
   * @param meta - Additional metadata
   */
  public static sendError<T>(
    res: Response,
    message: string = "An error occurred",
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: any,
    meta?: Partial<ApiResponse<T>["meta"]>
  ): void {
    const response = this.error(message, statusCode, error, meta);
    res.status(statusCode).json(response);
  }

  /**
   * Creates pagination metadata
   *
   * @param params - Pagination parameters
   * @returns Pagination metadata
   */
  public static createPaginationMeta(
    params: PaginationParams
  ): NonNullable<ApiResponse<any>["meta"]>["pagination"] {
    const { page, limit, totalItems } = params;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Send a not found response
   *
   * @param res - Express Response object
   * @param message - Not found message
   * @param meta - Additional metadata
   */
  public static sendNotFound(
    res: Response,
    message: string = "Resource not found",
    meta?: Partial<ApiResponse<any>["meta"]>
  ): void {
    this.sendError(res, message, HttpStatus.NOT_FOUND, null, meta);
  }

  /**
   * Send a bad request response
   *
   * @param res - Express Response object
   * @param message - Bad request message
   * @param error - Error details
   * @param meta - Additional metadata
   */
  public static sendBadRequest(
    res: Response,
    message: string = "Bad request",
    error?: any,
    meta?: Partial<ApiResponse<any>["meta"]>
  ): void {
    this.sendError(res, message, HttpStatus.BAD_REQUEST, error, meta);
  }

  /**
   * Send an unauthorized response
   *
   * @param res - Express Response object
   * @param message - Unauthorized message
   * @param meta - Additional metadata
   */
  public static sendUnauthorized(
    res: Response,
    message: string = "Unauthorized",
    meta?: Partial<ApiResponse<any>["meta"]>
  ): void {
    this.sendError(res, message, HttpStatus.UNAUTHORIZED, null, meta);
  }

  /**
   * Send a forbidden response
   *
   * @param res - Express Response object
   * @param message - Forbidden message
   * @param meta - Additional metadata
   */
  public static sendForbidden(
    res: Response,
    message: string = "Forbidden",
    meta?: Partial<ApiResponse<any>["meta"]>
  ): void {
    this.sendError(res, message, HttpStatus.FORBIDDEN, null, meta);
  }

  /**
   * Send a 409 Conflict response
   *
   * @param res - Express response object
   * @param message - Error message
   * @param additionalInfo - Additional error information
   */
  public static sendConflict(
    res: Response,
    message: string = "Conflict",
    additionalInfo: Record<string, any> = {}
  ): void {
    this.sendError(res, message, HttpStatus.CONFLICT, additionalInfo);
  }

  /**
   * Send a 204 No Content response
   *
   * @param res - Express response object
   */
  public static sendNoContent(res: Response): void {
    res.status(HttpStatus.NO_CONTENT).end();
  }

  /**
   * Send a paginated response
   *
   * @param res - Express response object
   * @param data - Data array to include in response
   * @param pagination - Pagination metadata
   * @param message - Success message
   */
  public static sendPaginated(
    res: Response,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    },
    message: string = "Data retrieved successfully"
  ): void {
    res.status(HttpStatus.OK).json({
      success: true,
      message,
      data,
      pagination: {
        ...pagination,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
      },
    });
  }
}

export default ResponseUtil;
