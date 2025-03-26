import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Project Grade API endpoints
 */
export const projectGradeValidationSchemas = {
  // Get grade by ID validation
  getGradeById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grades by project ID validation
  getGradesByProjectId: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grades by student ID validation
  getGradesByStudentId: {
    params: Joi.object({
      studentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grade by project and student validation
  getGradeByProjectAndStudent: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
      studentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Create grade validation
  createGrade: {
    body: Joi.object({
      projectId: Joi.string().required().messages({
        "any.required": "Project ID is required",
        "string.empty": "Project ID cannot be empty",
      }),
      studentId: Joi.string().required().messages({
        "any.required": "Student ID is required",
        "string.empty": "Student ID cannot be empty",
      }),
      graderId: Joi.string().required().messages({
        "any.required": "Grader ID is required",
        "string.empty": "Grader ID cannot be empty",
      }),
      score: Joi.number().min(0).max(100).required().messages({
        "any.required": "Score is required",
        "number.base": "Score must be a number",
        "number.min": "Score must be at least 0",
        "number.max": "Score must be at most 100",
      }),
      comments: Joi.string().allow(null, "").optional(),
      submissionDate: Joi.date().iso().allow(null).optional(),
      gradedDate: Joi.date().iso().default(new Date()),
      status: Joi.string()
        .valid("pending", "graded", "revised", "final")
        .default("graded"),
    }),
  },

  // Update grade validation
  updateGrade: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      score: Joi.number().min(0).optional(),
      maxScore: Joi.number().min(0).optional(),
      comments: Joi.string().allow(null, "").optional(),
      submissionDate: Joi.date().iso().allow(null).optional(),
      gradedDate: Joi.date().iso().optional(),
      status: Joi.string()
        .valid("pending", "graded", "revised", "final")
        .optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete grade validation
  deleteGrade: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Bulk delete grades validation
  bulkDeleteGrades: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get grade list validation
  getGradeList: {
    query: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID.optional(),
      studentId: ValidationUtil.SCHEMAS.ID.optional(),
      graderId: ValidationUtil.SCHEMAS.ID.optional(),
      status: Joi.string()
        .valid("pending", "graded", "revised", "final")
        .optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string()
        .valid("score", "gradedDate", "createdAt", "updatedAt")
        .default("gradedDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      minScore: Joi.number().min(0).optional(),
      maxScore: Joi.number().min(0).optional(),
      includeAll: Joi.boolean()
        .default(false)
        .description("If true, returns all grades regardless of other filters"),
    }).custom((obj, helpers) => {
      // Skip validation if includeAll is true
      if (obj.includeAll) {
        return obj;
      }

      // Check if at least one of projectId, studentId, or graderId is provided
      if (!obj.projectId && !obj.studentId && !obj.graderId) {
        return helpers.error("object.missing", {
          peers: ["projectId", "studentId", "graderId"],
          message:
            "At least one of projectId, studentId, or graderId must be provided unless includeAll is true",
        });
      }
      return obj;
    }),
  },
};

export default projectGradeValidationSchemas;
