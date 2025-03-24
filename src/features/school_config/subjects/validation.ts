import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Subject API endpoints
 */
export const subjectValidationSchemas = {
  // Create subject validation
  createSubject: {
    body: Joi.object({
      name: Joi.string().max(150).required(),
      sortOrder: Joi.number().integer().min(0).allow(null).optional(),
      code: Joi.string().max(30).allow(null, "").optional(),
      description: Joi.string().allow(null, "").optional(),
      level: Joi.string().max(50).required(),
      isDefault: Joi.boolean().optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      categoryId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      prerequisite: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      credits: Joi.number().precision(2).min(0).allow(null).optional(),
      compulsory: Joi.boolean().optional(),
      syllabus: Joi.string().allow(null, "").optional(),
    }),
  },

  // Update subject validation
  updateSubject: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(150).optional(),
      sortOrder: Joi.number().integer().min(0).allow(null).optional(),
      code: Joi.string().max(30).allow(null, "").optional(),
      description: Joi.string().allow(null, "").optional(),
      level: Joi.string().max(50).optional(),
      isDefault: Joi.boolean().optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      categoryId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      prerequisite: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      credits: Joi.number().precision(2).min(0).allow(null).optional(),
      compulsory: Joi.boolean().optional(),
      syllabus: Joi.string().allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get subject by ID validation
  getSubjectById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete subject validation
  deleteSubject: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get subject list validation
  getSubjectList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "sortOrder", "code", "level", "credits", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      categoryId: ValidationUtil.SCHEMAS.ID.optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.optional(),
      level: Joi.string().optional(),
      compulsory: Joi.boolean().optional(),
      hasPrerequisite: Joi.boolean().optional(),
      isDefault: Joi.boolean().optional(),
      minCredits: Joi.number().min(0).optional(),
      maxCredits: Joi.number().min(0).optional(),
    }),
  },

  // Get subjects by school validation
  getSubjectsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get subjects by category validation
  getSubjectsByCategory: {
    params: Joi.object({
      categoryId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get subjects by department validation
  getSubjectsByDepartment: {
    params: Joi.object({
      departmentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get subject by code validation
  getSubjectByCode: {
    params: Joi.object({
      code: Joi.string().required(),
    }),
    query: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
    }),
  },

  // Get subject statistics validation
  getSubjectStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create subjects validation
  createSubjectsBulk: {
    body: Joi.object({
      subjects: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(150).required(),
            sortOrder: Joi.number().integer().min(0).allow(null).optional(),
            code: Joi.string().max(30).allow(null, "").optional(),
            description: Joi.string().allow(null, "").optional(),
            level: Joi.string().max(50).required(),
            isDefault: Joi.boolean().optional(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            categoryId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            prerequisite: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            credits: Joi.number().precision(2).min(0).allow(null).optional(),
            compulsory: Joi.boolean().optional(),
            syllabus: Joi.string().allow(null, "").optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete subjects validation
  deleteSubjectsBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default subjectValidationSchemas;
