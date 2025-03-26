import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Project Files API endpoints
 */
export const projectFileValidationSchemas = {
  // Get project file by ID validation
  getProjectFileById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get project files by project ID validation
  getProjectFilesByProjectId: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Upload project file validation
  uploadProjectFile: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      description: Joi.string().allow(null, "").optional(),
    }),
  },

  // Update project file validation
  updateProjectFile: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      filename: Joi.string().max(255).optional(),
      description: Joi.string().allow(null, "").optional(),
      thumbnailUrl: Joi.string().max(500).allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete project file validation
  deleteProjectFile: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Bulk delete project files validation
  bulkDeleteProjectFiles: {
    params: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Download project file validation
  downloadProjectFile: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get project file list validation
  getProjectFileList: {
    query: Joi.object({
      projectId: ValidationUtil.SCHEMAS.ID.required(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("filename", "createdAt", "fileSize", "downloadCount")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      fileType: Joi.string().optional(),
    }),
  },
};

export default projectFileValidationSchemas;
