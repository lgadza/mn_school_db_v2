import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Teacher API endpoints
 */
export const teacherValidationSchemas = {
  // Create teacher validation
  createTeacher: {
    body: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID.required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      hireDate: Joi.date().iso().allow(null).optional(),
      qualificationId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      title: Joi.string().max(100).allow(null, "").optional(),
      employeeId: Joi.string().max(50).allow(null, "").optional(),
      contractType: Joi.string().max(50).allow(null, "").optional(),
      specialization: Joi.string().max(150).allow(null, "").optional(),
      yearsOfExperience: Joi.number().integer().min(0).allow(null).optional(),
      teachingLoad: Joi.number().min(0).allow(null).optional(),
      officeLocation: Joi.string().max(100).allow(null, "").optional(),
      officeHours: Joi.string().max(200).allow(null, "").optional(),
      bio: Joi.string().allow(null, "").optional(),
      salary: Joi.number().precision(2).min(0).allow(null).optional(),
      emergencyContact: Joi.string().allow(null, "").optional(),
      lastPromotionDate: Joi.date().iso().allow(null).optional(),
      notes: Joi.string().allow(null, "").optional(),
      previousInstitutions: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      certifications: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      achievements: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      publications: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      currentStatus: Joi.string().max(50).allow(null, "").optional(),
      primarySubjects: [
        Joi.array().items(Joi.string()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      activeStatus: Joi.boolean().default(true),
    }),
  },

  // Update teacher validation
  updateTeacher: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      hireDate: Joi.date().iso().allow(null).optional(),
      qualificationId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      title: Joi.string().max(100).allow(null, "").optional(),
      employeeId: Joi.string().max(50).allow(null, "").optional(),
      contractType: Joi.string().max(50).allow(null, "").optional(),
      specialization: Joi.string().max(150).allow(null, "").optional(),
      yearsOfExperience: Joi.number().integer().min(0).allow(null).optional(),
      teachingLoad: Joi.number().min(0).allow(null).optional(),
      officeLocation: Joi.string().max(100).allow(null, "").optional(),
      officeHours: Joi.string().max(200).allow(null, "").optional(),
      bio: Joi.string().allow(null, "").optional(),
      salary: Joi.number().precision(2).min(0).allow(null).optional(),
      emergencyContact: Joi.string().allow(null, "").optional(),
      lastPromotionDate: Joi.date().iso().allow(null).optional(),
      notes: Joi.string().allow(null, "").optional(),
      previousInstitutions: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      certifications: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      achievements: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      publications: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      currentStatus: Joi.string().max(50).allow(null, "").optional(),
      primarySubjects: [
        Joi.array().items(Joi.string()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      activeStatus: Joi.boolean().optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get teacher by ID validation
  getTeacherById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get teacher by user ID validation
  getTeacherByUserId: {
    params: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get teacher by employee ID validation
  getTeacherByEmployeeId: {
    params: Joi.object({
      employeeId: Joi.string().required(),
    }),
  },

  // Delete teacher validation
  deleteTeacher: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get teacher list validation
  getTeacherList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "hireDate",
          "title",
          "contractType",
          "yearsOfExperience",
          "teachingLoad",
          "currentStatus",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      departmentId: ValidationUtil.SCHEMAS.ID.optional(),
      activeStatus: Joi.boolean().optional(),
      currentStatus: Joi.string().optional(),
      contractType: Joi.string().optional(),
      minYearsOfExperience: Joi.number().integer().min(0).optional(),
      maxYearsOfExperience: Joi.number().integer().min(0).optional(),
      minTeachingLoad: Joi.number().min(0).optional(),
      maxTeachingLoad: Joi.number().min(0).optional(),
      hireDateFrom: Joi.date().iso().optional(),
      hireDateTo: Joi.date().iso().optional(),
      title: Joi.string().optional(),
      specialization: Joi.string().optional(),
    }),
  },

  // Get teachers by school validation
  getTeachersBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get teachers by department validation
  getTeachersByDepartment: {
    params: Joi.object({
      departmentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate employee ID validation
  generateEmployeeId: {
    query: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Get teacher statistics validation
  getTeacherStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },
};

export default teacherValidationSchemas;
