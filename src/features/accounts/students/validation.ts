import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Student API endpoints
 */
export const studentValidationSchemas = {
  // Create student validation
  createStudent: {
    body: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID.required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      gradeId: ValidationUtil.SCHEMAS.ID.required(),
      classId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      enrollmentDate: Joi.date().iso().required(),
      studentNumber: Joi.string().max(50).allow(null, "").optional(),
      guardianInfo: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      healthInfo: [
        Joi.object().allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      previousSchool: [
        Joi.object().allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      enrollmentNotes: Joi.string().allow(null, "").optional(),
      academicRecords: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      attendanceRecords: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      disciplinaryRecords: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      specialNeeds: [
        Joi.object().allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      extracurricularActivities: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      documents: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      activeStatus: Joi.boolean().default(true),
    }),
  },

  // Update student validation
  updateStudent: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      gradeId: ValidationUtil.SCHEMAS.ID.optional(),
      classId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      enrollmentDate: Joi.date().iso().optional(),
      studentNumber: Joi.string().max(50).allow(null, "").optional(),
      guardianInfo: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      healthInfo: [
        Joi.object().allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      previousSchool: [
        Joi.object().allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      enrollmentNotes: Joi.string().allow(null, "").optional(),
      academicRecords: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      attendanceRecords: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      disciplinaryRecords: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      specialNeeds: [
        Joi.object().allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      extracurricularActivities: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      documents: [
        Joi.array().items(Joi.object()).allow(null).optional(),
        Joi.string().allow(null, "").optional(),
      ],
      activeStatus: Joi.boolean().optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get student by ID validation
  getStudentById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get student by user ID validation
  getStudentByUserId: {
    params: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get student by student number validation
  getStudentByStudentNumber: {
    params: Joi.object({
      studentNumber: Joi.string().required(),
    }),
  },

  // Delete student validation
  deleteStudent: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get student list validation
  getStudentList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("enrollmentDate", "studentNumber", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      gradeId: ValidationUtil.SCHEMAS.ID.optional(),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      activeStatus: Joi.boolean().optional(),
      enrollmentDateFrom: Joi.date().iso().optional(),
      enrollmentDateTo: Joi.date().iso().optional(),
    }),
  },

  // Get students by school validation
  getStudentsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get students by grade validation
  getStudentsByGrade: {
    params: Joi.object({
      gradeId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get students by class validation
  getStudentsByClass: {
    params: Joi.object({
      classId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate student number validation
  generateStudentNumber: {
    query: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      gradeId: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Get student statistics validation
  getStudentStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },
};

export default studentValidationSchemas;
