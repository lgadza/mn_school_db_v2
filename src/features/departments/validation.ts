import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Department API endpoints
 */
export const departmentValidationSchemas = {
  // Create department validation
  createDepartment: {
    body: Joi.object({
      name: Joi.string().max(150).required(),
      code: Joi.string().max(20).allow(null, "").optional(),
      description: Joi.string().allow(null, "").optional(),
      headOfDepartmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      contactEmail: Joi.string().email().max(100).allow(null, "").optional(),
      phoneNumber: Joi.string().max(50).allow(null, "").optional(),
      facultyCount: Joi.number().integer().min(0).allow(null).optional(),
      studentCount: Joi.number().integer().min(0).allow(null).optional(),
      location: Joi.string().max(150).allow(null, "").optional(),
      budget: Joi.number().precision(2).min(0).allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      isDefault: Joi.boolean().optional(),
    }),
  },

  // Update department validation
  updateDepartment: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(150).optional(),
      code: Joi.string().max(20).allow(null, "").optional(),
      description: Joi.string().allow(null, "").optional(),
      headOfDepartmentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      contactEmail: Joi.string().email().max(100).allow(null, "").optional(),
      phoneNumber: Joi.string().max(50).allow(null, "").optional(),
      facultyCount: Joi.number().integer().min(0).allow(null).optional(),
      studentCount: Joi.number().integer().min(0).allow(null).optional(),
      location: Joi.string().max(150).allow(null, "").optional(),
      budget: Joi.number().precision(2).min(0).allow(null).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      isDefault: Joi.boolean().optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get department by ID validation
  getDepartmentById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get department by code validation
  getDepartmentByCode: {
    params: Joi.object({
      code: Joi.string().required(),
    }),
  },

  // Delete department validation
  deleteDepartment: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get department list validation
  getDepartmentList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "name",
          "code",
          "facultyCount",
          "studentCount",
          "budget",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      headOfDepartmentId: ValidationUtil.SCHEMAS.ID.optional(),
      isDefault: Joi.boolean().optional(),
      minFacultyCount: Joi.number().integer().min(0).optional(),
      maxFacultyCount: Joi.number().integer().min(0).optional(),
      minStudentCount: Joi.number().integer().min(0).optional(),
      maxStudentCount: Joi.number().integer().min(0).optional(),
      minBudget: Joi.number().min(0).optional(),
      maxBudget: Joi.number().min(0).optional(),
    }),
  },

  // Get departments by school validation
  getDepartmentsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get departments by head validation
  getDepartmentsByHead: {
    params: Joi.object({
      headId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate department code validation
  generateDepartmentCode: {
    query: Joi.object({
      name: Joi.string().required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Get department statistics validation
  getDepartmentStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Get default department for school validation
  getDefaultDepartment: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Set default department validation
  setDefaultDepartment: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },
};

export default departmentValidationSchemas;
