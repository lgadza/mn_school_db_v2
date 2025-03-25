import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for BehaviorType API endpoints
 */
export const behaviorTypeValidationSchemas = {
  // Create behavior type validation
  createBehaviorType: {
    body: Joi.object({
      description: Joi.string().max(255).required(),
      category: Joi.string().valid("POSITIVE", "NEGATIVE").required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Update behavior type validation
  updateBehaviorType: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      description: Joi.string().max(255).optional(),
      category: Joi.string().valid("POSITIVE", "NEGATIVE").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get behavior type by ID validation
  getBehaviorTypeById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete behavior type validation
  deleteBehaviorType: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behavior type list validation
  getBehaviorTypeList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("description", "category", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      category: Joi.string().valid("POSITIVE", "NEGATIVE").optional(),
    }),
  },

  // Get behavior types by school validation
  getBehaviorTypesBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behavior types by category validation
  getBehaviorTypesByCategory: {
    params: Joi.object({
      category: Joi.string().valid("POSITIVE", "NEGATIVE").required(),
    }),
  },

  // Get behavior type statistics validation
  getBehaviorTypeStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create behavior types validation
  createBehaviorTypesBulk: {
    body: Joi.object({
      behaviorTypes: Joi.array()
        .items(
          Joi.object({
            description: Joi.string().max(255).required(),
            category: Joi.string().valid("POSITIVE", "NEGATIVE").required(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete behavior types validation
  deleteBehaviorTypesBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default behaviorTypeValidationSchemas;
