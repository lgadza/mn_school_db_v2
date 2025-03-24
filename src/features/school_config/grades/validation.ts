import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Grade API endpoints
 */
export const gradeValidationSchemas = {
  // Create grade validation
  createGrade: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      details: Joi.string().allow(null, "").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      applicationOpen: Joi.boolean().optional().default(false),
      minAge: Joi.number().integer().min(0).allow(null).optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      maxAge: Joi.number().integer().min(0).allow(null).optional(),
    }),
  },

  // Update grade validation
  updateGrade: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      details: Joi.string().allow(null, "").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      applicationOpen: Joi.boolean().optional(),
      minAge: Joi.number().integer().min(0).allow(null).optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      maxAge: Joi.number().integer().min(0).allow(null).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get grade by ID validation
  getGradeById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete grade validation
  deleteGrade: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grade list validation
  getGradeList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "minAge", "maxAge", "applicationOpen", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      applicationOpen: Joi.boolean().optional(),
      minAgeFrom: Joi.number().integer().min(0).optional(),
      minAgeTo: Joi.number().integer().min(0).optional(),
      maxAgeFrom: Joi.number().integer().min(0).optional(),
      maxAgeTo: Joi.number().integer().min(0).optional(),
    }),
  },

  // Get grades by school validation
  getGradesBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grades by teacher validation
  getGradesByTeacher: {
    params: Joi.object({
      teacherId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grade statistics validation
  getGradeStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create grades validation
  createGradesBulk: {
    body: Joi.object({
      grades: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            details: Joi.string().allow(null, "").optional(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            applicationOpen: Joi.boolean().optional().default(false),
            minAge: Joi.number().integer().min(0).allow(null).optional(),
            teacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            maxAge: Joi.number().integer().min(0).allow(null).optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete grades validation
  deleteGradesBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default gradeValidationSchemas;
