import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Category API endpoints
 */
export const categoryValidationSchemas = {
  // Create category validation
  createCategory: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      code: Joi.string().max(50).allow(null, "").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      description: Joi.string().allow(null, "").optional(),
    }),
  },

  // Update category validation
  updateCategory: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      code: Joi.string().max(50).allow(null, "").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      description: Joi.string().allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get category by ID validation
  getCategoryById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete category validation
  deleteCategory: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get category list validation
  getCategoryList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "code", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      code: Joi.string().optional(),
    }),
  },

  // Get categories by school validation
  getCategoriesBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get category statistics validation
  getCategoryStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create categories validation
  createCategoriesBulk: {
    body: Joi.object({
      categories: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            code: Joi.string().max(50).allow(null, "").optional(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            description: Joi.string().allow(null, "").optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete categories validation
  deleteCategoriesBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },

  // Get category by code validation
  getCategoryByCode: {
    params: Joi.object({
      code: Joi.string().required(),
    }),
    query: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
    }),
  },
};

export default categoryValidationSchemas;
