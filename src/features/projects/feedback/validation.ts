import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Project Feedback API endpoints
 */
export const projectFeedbackValidationSchemas = {
  // Get feedback by ID validation
  getFeedbackById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get feedback by project ID validation
  getFeedbackByProjectId: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get replies to feedback validation
  getRepliesByParentId: {
    params: Joi.object({
      parentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Create feedback validation
  createFeedback: {
    body: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID.required(),
      content: Joi.string().required(),
      type: Joi.string()
        .valid("comment", "suggestion", "correction", "praise", "question")
        .default("comment"),
      authorId: ValidationUtil.SCHEMAS.ID.required(),
      parentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      isPrivate: Joi.boolean().default(false),
    }),
  },

  // Update feedback validation
  updateFeedback: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      content: Joi.string().optional(),
      type: Joi.string()
        .valid("comment", "suggestion", "correction", "praise", "question")
        .optional(),
      status: Joi.string().valid("active", "archived", "deleted").optional(),
      isPrivate: Joi.boolean().optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete feedback validation
  deleteFeedback: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Bulk delete feedback validation
  bulkDeleteFeedback: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get feedback list validation
  getFeedbackList: {
    query: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID.required(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      authorId: ValidationUtil.SCHEMAS.ID.optional(),
      parentId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      type: Joi.string()
        .valid("comment", "suggestion", "correction", "praise", "question")
        .optional(),
      status: Joi.string().valid("active", "archived", "deleted").optional(),
      sortBy: Joi.string().valid("createdAt", "updatedAt").default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
  },
};

export default projectFeedbackValidationSchemas;
