import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Project API endpoints
 */
export const projectValidationSchemas = {
  // Create project validation
  createProject: {
    body: Joi.object({
      title: Joi.string().max(200).required(),
      description: Joi.string().allow(null, "").optional(),
      instructions: Joi.string().allow(null, "").optional(),
      dueDate: Joi.date().iso().allow(null).optional(),
      assignedDate: Joi.date().iso().allow(null).optional(),
      status: Joi.string()
        .valid("draft", "assigned", "in_progress", "completed", "archived")
        .default("draft"),
      subjectId: ValidationUtil.SCHEMAS.ID.required(),
      classId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      difficulty: Joi.string()
        .valid("easy", "medium", "hard", "advanced")
        .allow(null)
        .optional(),
      maxPoints: Joi.number().integer().min(0).allow(null).optional(),
      isGroupProject: Joi.boolean().default(false),
      createdById: ValidationUtil.SCHEMAS.ID.required(),
    }),
  },

  // Bulk create projects validation
  bulkCreateProjects: {
    body: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().max(200).required(),
          description: Joi.string().allow(null, "").optional(),
          instructions: Joi.string().allow(null, "").optional(),
          dueDate: Joi.date().iso().allow(null).optional(),
          assignedDate: Joi.date().iso().allow(null).optional(),
          status: Joi.string()
            .valid("draft", "assigned", "in_progress", "completed", "archived")
            .default("draft"),
          subjectId: ValidationUtil.SCHEMAS.ID.required(),
          classId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
          teacherId: ValidationUtil.SCHEMAS.ID.required(),
          schoolId: ValidationUtil.SCHEMAS.ID.required(),
          difficulty: Joi.string()
            .valid("easy", "medium", "hard", "advanced")
            .allow(null)
            .optional(),
          maxPoints: Joi.number().integer().min(0).allow(null).optional(),
          isGroupProject: Joi.boolean().default(false),
          createdById: ValidationUtil.SCHEMAS.ID.required(),
        })
      )
      .min(1)
      .max(100)
      .required(),
  },

  // Update project validation
  updateProject: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      title: Joi.string().max(200).optional(),
      description: Joi.string().allow(null, "").optional(),
      instructions: Joi.string().allow(null, "").optional(),
      dueDate: Joi.date().iso().allow(null).optional(),
      assignedDate: Joi.date().iso().allow(null).optional(),
      status: Joi.string()
        .valid("draft", "assigned", "in_progress", "completed", "archived")
        .optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.optional(),
      classId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      difficulty: Joi.string()
        .valid("easy", "medium", "hard", "advanced")
        .allow(null)
        .optional(),
      maxPoints: Joi.number().integer().min(0).allow(null).optional(),
      isGroupProject: Joi.boolean().optional(),
      modifiedById: ValidationUtil.SCHEMAS.ID.required(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get project by ID validation
  getProjectById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete project validation
  deleteProject: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Bulk delete projects validation
  bulkDeleteProjects: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).optional(),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
    })
      .min(1)
      .message("At least one deletion criteria must be provided"),
  },

  // Get project list validation
  getProjectList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "title",
          "createdAt",
          "updatedAt",
          "dueDate",
          "status",
          "difficulty"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      subjectId: ValidationUtil.SCHEMAS.ID.optional(),
      teacherId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      status: Joi.string()
        .valid("draft", "assigned", "in_progress", "completed", "archived")
        .optional(),
      difficulty: Joi.string()
        .valid("easy", "medium", "hard", "advanced")
        .optional(),
      isGroupProject: Joi.boolean().optional(),
      fromDueDate: Joi.date().iso().optional(),
      toDueDate: Joi.date().iso().optional(),
    }),
  },

  // Get projects by class ID validation
  getProjectsByClassId: {
    params: Joi.object({
      classId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get projects by subject ID validation
  getProjectsBySubjectId: {
    params: Joi.object({
      subjectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get projects by teacher ID validation
  getProjectsByTeacherId: {
    params: Joi.object({
      teacherId: ValidationUtil.SCHEMAS.ID,
    }),
  },
};

export default projectValidationSchemas;
