import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Module API endpoints
 */
export const moduleValidationSchemas = {
  // Create module validation
  createModule: {
    body: Joi.object({
      name: Joi.string().max(150).required(),
      description: Joi.string().allow(null, "").optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.required(),
      classId: ValidationUtil.SCHEMAS.ID.required(),
      teacherId: ValidationUtil.SCHEMAS.ID.required(),
      assistantTeacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      createdById: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      classType: Joi.string().max(50).allow(null, "").optional(),
      classroomId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      materials: Joi.string().allow(null, "").optional(),
      studentGroupId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      termId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      totalStudents: Joi.number().integer().min(0).allow(null).optional(),
    }),
  },

  // Bulk create modules validation
  bulkCreateModules: {
    body: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().max(150).required(),
          description: Joi.string().allow(null, "").optional(),
          subjectId: ValidationUtil.SCHEMAS.ID.required(),
          classId: ValidationUtil.SCHEMAS.ID.required(),
          teacherId: ValidationUtil.SCHEMAS.ID.required(),
          assistantTeacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
          schoolId: ValidationUtil.SCHEMAS.ID.required(),
          createdById: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
          classType: Joi.string().max(50).allow(null, "").optional(),
          classroomId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
          materials: Joi.string().allow(null, "").optional(),
          studentGroupId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
          termId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
          totalStudents: Joi.number().integer().min(0).allow(null).optional(),
        })
      )
      .min(1)
      .max(100)
      .required(),
  },

  // Update module validation
  updateModule: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(150).optional(),
      description: Joi.string().allow(null, "").optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.optional(),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      assistantTeacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      modifiedById: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      classType: Joi.string().max(50).allow(null, "").optional(),
      classroomId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      materials: Joi.string().allow(null, "").optional(),
      studentGroupId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      termId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      totalStudents: Joi.number().integer().min(0).allow(null).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get module by ID validation
  getModuleById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete module validation
  deleteModule: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Bulk delete modules validation
  bulkDeleteModules: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).optional(),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      termId: ValidationUtil.SCHEMAS.ID.optional(),
    })
      .min(1)
      .message("At least one deletion criteria must be provided"),
  },

  // Get module list validation
  getModuleList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "createdAt", "updatedAt", "totalStudents")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      assistantTeacherId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      classroomId: ValidationUtil.SCHEMAS.ID.optional(),
      termId: ValidationUtil.SCHEMAS.ID.optional(),
      classType: Joi.string().max(50).optional(),
    }),
  },

  // Get modules by class ID validation
  getModulesByClassId: {
    params: Joi.object({
      classId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get modules by subject ID validation
  getModulesBySubjectId: {
    params: Joi.object({
      subjectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get modules by teacher ID validation
  getModulesByTeacherId: {
    params: Joi.object({
      teacherId: ValidationUtil.SCHEMAS.ID,
    }),
  },
};

export default moduleValidationSchemas;
