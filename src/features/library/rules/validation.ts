import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Rental Rule API endpoints
 */
export const rentalRuleValidationSchemas = {
  // Create rental rule validation
  createRentalRule: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      rentalPeriodDays: Joi.number().integer().min(1).required(),
      maxBooksPerStudent: Joi.number().integer().min(1).required(),
      renewalAllowed: Joi.boolean().required(),
      lateFeePerDay: Joi.number().min(0).allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      description: Joi.string().max(1000).allow(null, "").optional(),
      renewalLimit: Joi.number().integer().min(0).allow(null).optional(),
    }),
  },

  // Update rental rule validation
  updateRentalRule: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      rentalPeriodDays: Joi.number().integer().min(1).optional(),
      maxBooksPerStudent: Joi.number().integer().min(1).optional(),
      renewalAllowed: Joi.boolean().optional(),
      lateFeePerDay: Joi.number().min(0).allow(null).optional(),
      description: Joi.string().max(1000).allow(null, "").optional(),
      renewalLimit: Joi.number().integer().min(0).allow(null).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get rental rule by ID validation
  getRentalRuleById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete rental rule validation
  deleteRentalRule: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get rental rule list validation
  getRentalRuleList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "rentalPeriodDays", "maxBooksPerStudent", "createdAt")
        .default("name"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
    }),
  },

  // Get rental rules by school validation
  getRentalRulesBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "rentalPeriodDays", "maxBooksPerStudent", "createdAt")
        .default("name"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
    }),
  },
};

export default rentalRuleValidationSchemas;
