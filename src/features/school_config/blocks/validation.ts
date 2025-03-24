import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Block API endpoints
 */
export const blockValidationSchemas = {
  // Create block validation
  createBlock: {
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      name: Joi.string().max(100).required(),
      numberOfClassrooms: Joi.number().integer().min(1).required(),
      details: Joi.string().allow(null, "").optional(),
      location: Joi.string().max(255).allow(null, "").optional(),
      yearBuilt: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear() + 10) // Allow planning up to 10 years ahead
        .allow(null)
        .optional(),
      status: Joi.string()
        .valid("active", "inactive", "maintenance", "planned", "demolished")
        .allow(null)
        .optional(),
    }),
  },

  // Update block validation
  updateBlock: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      name: Joi.string().max(100).optional(),
      numberOfClassrooms: Joi.number().integer().min(1).optional(),
      details: Joi.string().allow(null, "").optional(),
      location: Joi.string().max(255).allow(null, "").optional(),
      yearBuilt: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear() + 10)
        .allow(null)
        .optional(),
      status: Joi.string()
        .valid("active", "inactive", "maintenance", "planned", "demolished")
        .allow(null)
        .optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get block by ID validation
  getBlockById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete block validation
  deleteBlock: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get block list validation
  getBlockList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "numberOfClassrooms", "yearBuilt", "status", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      status: Joi.string()
        .valid("active", "inactive", "maintenance", "planned", "demolished")
        .optional(),
      yearBuiltMin: Joi.number().integer().min(1800).optional(),
      yearBuiltMax: Joi.number()
        .integer()
        .max(new Date().getFullYear() + 10)
        .optional(),
      minClassrooms: Joi.number().integer().min(1).optional(),
      maxClassrooms: Joi.number().integer().optional(),
    }),
  },

  // Get blocks by school validation
  getBlocksBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get block statistics validation
  getBlockStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create blocks validation
  createBlocksBulk: {
    body: Joi.object({
      blocks: Joi.array()
        .items(
          Joi.object({
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            name: Joi.string().max(100).required(),
            numberOfClassrooms: Joi.number().integer().min(1).required(),
            details: Joi.string().allow(null, "").optional(),
            location: Joi.string().max(255).allow(null, "").optional(),
            yearBuilt: Joi.number()
              .integer()
              .min(1800)
              .max(new Date().getFullYear() + 10)
              .allow(null)
              .optional(),
            status: Joi.string()
              .valid(
                "active",
                "inactive",
                "maintenance",
                "planned",
                "demolished"
              )
              .allow(null)
              .optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete blocks validation
  deleteBlocksBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default blockValidationSchemas;
