import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "@/common/utils/logging/logger";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";

/**
 * Validation error response interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation schemas type
 */
export type ValidationSchemas = {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
};

/**
 * Validation options interface
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

/**
 * Validation Utility
 * Provides standardized methods for validating data
 */
export class ValidationUtil {
  /**
   * Default validation options
   */
  private static readonly DEFAULT_OPTIONS: ValidationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  /**
   * Common validation schemas
   */
  public static readonly SCHEMAS = {
    ID: Joi.string().uuid().required(),
    EMAIL: Joi.string().email().required(),
    PASSWORD: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .message(
        "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    PHONE: Joi.string()
      .pattern(/^\+[1-9]\d{1,14}$/)
      .message("Phone number must be in E.164 format (e.g., +1234567890)"),
    DATE: Joi.date().iso(),
    URL: Joi.string().uri(),
    PAGINATION: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sort: Joi.string().default("createdAt:desc"),
    }),
  };

  /**
   * Create an Express middleware for request validation
   *
   * @param schemas - Validation schemas for request body, query, and params
   * @param options - Validation options
   * @returns Express middleware
   */
  public static validateRequest(
    schemas: ValidationSchemas,
    options: ValidationOptions = this.DEFAULT_OPTIONS
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const validationErrors: ValidationError[] = [];

      // Validate request body
      if (schemas.body && req.body) {
        const { error } = schemas.body.validate(req.body, options);
        if (error) {
          this.extractValidationErrors(error, validationErrors);
        }
      }

      // Validate query parameters
      if (schemas.query && req.query) {
        const { error } = schemas.query.validate(req.query, options);
        if (error) {
          this.extractValidationErrors(error, validationErrors);
        }
      }

      // Validate path parameters
      if (schemas.params && req.params) {
        const { error } = schemas.params.validate(req.params, options);
        if (error) {
          this.extractValidationErrors(error, validationErrors);
        }
      }

      // If there are validation errors, return a 400 Bad Request response
      if (validationErrors.length > 0) {
        logger.warn("Request validation failed", {
          path: req.path,
          method: req.method,
          errors: validationErrors,
        });
        return ResponseUtil.sendBadRequest(
          res,
          "Validation failed",
          validationErrors
        );
      }

      next();
    };
  }

  /**
   * Validate data against a schema
   *
   * @param data - Data to validate
   * @param schema - Joi schema
   * @param options - Validation options
   * @returns Validation result
   */
  public static validate<T>(
    data: any,
    schema: Joi.Schema,
    options: ValidationOptions = this.DEFAULT_OPTIONS
  ): { isValid: boolean; value?: T; errors?: ValidationError[] } {
    const { error, value } = schema.validate(data, options);

    if (error) {
      const errors: ValidationError[] = [];
      this.extractValidationErrors(error, errors);
      return { isValid: false, errors };
    }

    return { isValid: true, value: value as T };
  }

  /**
   * Extract validation errors from Joi error
   *
   * @param error - Joi validation error
   * @param errors - Array to store validation errors
   */
  private static extractValidationErrors(
    error: Joi.ValidationError,
    errors: ValidationError[]
  ): void {
    error.details.forEach((detail) => {
      // Get field path (e.g., "user.name" -> "user.name")
      const field = detail.path.join(".");

      errors.push({
        field,
        message: detail.message,
      });
    });
  }

  /**
   * Create a schema for a model
   *
   * @param schemaMap - Object with field definitions
   * @returns Joi schema
   */
  public static createModelSchema(
    schemaMap: Record<string, Joi.Schema>
  ): Joi.Schema {
    return Joi.object(schemaMap);
  }

  /**
   * Email validation
   *
   * @param email - Email to validate
   * @returns Whether the email is valid
   */
  public static isValidEmail(email: string): boolean {
    return this.SCHEMAS.EMAIL.validate(email).error === undefined;
  }

  /**
   * UUID validation
   *
   * @param id - UUID to validate
   * @returns Whether the UUID is valid
   */
  public static isValidUUID(id: string): boolean {
    return this.SCHEMAS.ID.validate(id).error === undefined;
  }

  /**
   * Password strength validation
   *
   * @param password - Password to validate
   * @returns Password validation result
   */
  public static validatePasswordStrength(password: string): {
    isValid: boolean;
    message?: string;
  } {
    const result = this.SCHEMAS.PASSWORD.validate(password);

    if (result.error) {
      return {
        isValid: false,
        message: result.error.details[0].message,
      };
    }

    return { isValid: true };
  }
}

export default ValidationUtil;
