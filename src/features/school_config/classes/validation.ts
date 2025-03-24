import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Class API endpoints
 */
export const classValidationSchemas = {
  // Create class validation
  createClass: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      teacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      gradeId: ValidationUtil.SCHEMAS.ID.required(),
      sectionId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      capacity: Joi.number().integer().min(0).allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      details: Joi.string().allow(null, "").optional(),
      color: Joi.string().max(20).allow(null, "").optional(),
      scheduleId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      classroomId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      schoolYearId: ValidationUtil.SCHEMAS.ID.required(),
      classType: Joi.string().max(50).allow(null, "").optional(),
      combination: Joi.string().max(100).optional(),
      status: Joi.string().valid("active", "archived").default("active"),
    }),
  },

  // Update class validation
  updateClass: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      gradeId: ValidationUtil.SCHEMAS.ID.optional(),
      sectionId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      capacity: Joi.number().integer().min(0).allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      details: Joi.string().allow(null, "").optional(),
      color: Joi.string().max(20).allow(null, "").optional(),
      studentCount: Joi.number().integer().min(0).allow(null).optional(),
      scheduleId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      classroomId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      schoolYearId: ValidationUtil.SCHEMAS.ID.optional(),
      classType: Joi.string().max(50).allow(null, "").optional(),
      combination: Joi.string().max(100).optional(),
      status: Joi.string().valid("active", "archived").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get class by ID validation
  getClassById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete class validation
  deleteClass: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get class list validation
  getClassList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "name",
          "capacity",
          "studentCount",
          "classType",
          "createdAt",
          "status"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      gradeId: ValidationUtil.SCHEMAS.ID.optional(),
      sectionId: ValidationUtil.SCHEMAS.ID.optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.optional(),
      classroomId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolYearId: ValidationUtil.SCHEMAS.ID.optional(),
      classType: Joi.string().optional(),
      status: Joi.string().valid("active", "archived").optional(),
      capacityFrom: Joi.number().integer().min(0).optional(),
      capacityTo: Joi.number().integer().min(0).optional(),
      studentCountFrom: Joi.number().integer().min(0).optional(),
      studentCountTo: Joi.number().integer().min(0).optional(),
    }),
  },

  // Get classes by school validation
  getClassesBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classes by teacher validation
  getClassesByTeacher: {
    params: Joi.object({
      teacherId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classes by grade validation
  getClassesByGrade: {
    params: Joi.object({
      gradeId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classes by section validation
  getClassesBySection: {
    params: Joi.object({
      sectionId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classes by department validation
  getClassesByDepartment: {
    params: Joi.object({
      departmentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classes by classroom validation
  getClassesByClassroom: {
    params: Joi.object({
      classroomId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classes by school year validation
  getClassesBySchoolYear: {
    params: Joi.object({
      schoolYearId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get class statistics validation
  getClassStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create classes validation
  createClassesBulk: {
    body: Joi.object({
      classes: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            teacherId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            gradeId: ValidationUtil.SCHEMAS.ID.required(),
            sectionId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            capacity: Joi.number().integer().min(0).allow(null).optional(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            details: Joi.string().allow(null, "").optional(),
            color: Joi.string().max(20).allow(null, "").optional(),
            scheduleId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            classroomId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
            schoolYearId: ValidationUtil.SCHEMAS.ID.required(),
            classType: Joi.string().max(50).allow(null, "").optional(),
            combination: Joi.string().max(100).optional(),
            status: Joi.string().valid("active", "archived").default("active"),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete classes validation
  deleteClassesBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default classValidationSchemas;
