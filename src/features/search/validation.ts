import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Search API endpoints
 */
export const searchValidationSchemas = {
  // Global search validation
  globalSearch: {
    query: Joi.object({
      q: Joi.string().required().min(1).max(100),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      types: Joi.string().pattern(/^[a-zA-Z,]+$/),
      fuzzy: Joi.boolean().default(true),
      sortBy: Joi.string().default("relevance"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      filters: Joi.string().optional(),
    }),
  },

  // Entity-specific search validation
  searchEntities: {
    params: Joi.object({
      entityTypes: Joi.string()
        .required()
        .pattern(/^[a-zA-Z,]+$/),
    }),
    query: Joi.object({
      q: Joi.string().required().min(1).max(100),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      fuzzy: Joi.boolean().default(true),
      sortBy: Joi.string().default("relevance"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      filters: Joi.string().optional(),
    }),
  },

  // Get suggestions validation
  getSuggestions: {
    query: Joi.object({
      q: Joi.string().required().min(1).max(100),
      types: Joi.string().pattern(/^[a-zA-Z,]+$/),
    }),
  },

  // Index entity validation
  indexEntity: {
    params: Joi.object({
      entityType: Joi.string().required(),
      entityId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Rebuild indexes validation
  rebuildIndexes: {
    // No parameters required
  },
};

export default searchValidationSchemas;
