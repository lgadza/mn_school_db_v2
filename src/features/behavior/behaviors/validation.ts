import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Behavior API endpoints
 */
export const behaviorValidationSchemas = {
  // Create behavior validation
  createBehavior: {
    body: Joi.object({
      studentId: ValidationUtil.SCHEMAS.ID.required(),
      studentName: Joi.string().max(255).required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      behaviorTypeId: ValidationUtil.SCHEMAS.ID.required(),
      classId: ValidationUtil.SCHEMAS.ID.required(),
      moduleId: ValidationUtil.SCHEMAS.ID.optional(),
      lessonId: ValidationUtil.SCHEMAS.ID.optional(),
      dateOfIncident: Joi.date().iso().required(),
      description: Joi.string().allow(null, "").optional(),
      actionTaken: Joi.string().allow(null, "").optional(),
      staffId: ValidationUtil.SCHEMAS.ID.required(),
      resolutionStatus: Joi.string()
        .valid("Pending", "Resolved", "Dismissed", "Under Investigation")
        .default("Pending")
        .optional(),
      priority: Joi.string()
        .valid("High", "Medium", "Low")
        .default("Medium")
        .optional(),
      attachments: Joi.string().allow(null, "").optional(),
      createdById: ValidationUtil.SCHEMAS.ID.optional(),
    }),
  },

  // Update behavior validation
  updateBehavior: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      studentId: ValidationUtil.SCHEMAS.ID.optional(),
      studentName: Joi.string().max(255).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      behaviorTypeId: ValidationUtil.SCHEMAS.ID.optional(),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      moduleId: ValidationUtil.SCHEMAS.ID.optional().allow(null),
      lessonId: ValidationUtil.SCHEMAS.ID.optional().allow(null),
      dateOfIncident: Joi.date().iso().optional(),
      description: Joi.string().allow(null, "").optional(),
      actionTaken: Joi.string().allow(null, "").optional(),
      staffId: ValidationUtil.SCHEMAS.ID.optional(),
      resolutionStatus: Joi.string()
        .valid("Pending", "Resolved", "Dismissed", "Under Investigation")
        .optional(),
      priority: Joi.string().valid("High", "Medium", "Low").optional(),
      attachments: Joi.string().allow(null, "").optional(),
      modifiedById: ValidationUtil.SCHEMAS.ID.optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get behavior by ID validation
  getBehaviorById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete behavior validation
  deleteBehavior: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behavior list validation
  getBehaviorList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("dateOfIncident", "priority", "resolutionStatus", "createdAt")
        .default("dateOfIncident"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      classId: ValidationUtil.SCHEMAS.ID.optional(),
      studentId: ValidationUtil.SCHEMAS.ID.optional(),
      behaviorTypeId: ValidationUtil.SCHEMAS.ID.optional(),
      staffId: ValidationUtil.SCHEMAS.ID.optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      resolutionStatus: Joi.string()
        .valid("Pending", "Resolved", "Dismissed", "Under Investigation")
        .optional(),
      priority: Joi.string().valid("High", "Medium", "Low").optional(),
      category: Joi.string().valid("POSITIVE", "NEGATIVE").optional(),
    }).custom((value, helpers) => {
      // Validate startDate is before endDate if both are provided
      if (value.startDate && value.endDate) {
        const startDate = new Date(value.startDate);
        const endDate = new Date(value.endDate);

        if (startDate > endDate) {
          return helpers.error("date.startBeforeEnd");
        }
      }
      return value;
    }, "validate dates"),
  },

  // Get behaviors by school validation
  getBehaviorsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behaviors by student validation
  getBehaviorsByStudent: {
    params: Joi.object({
      studentId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behaviors by class validation
  getBehaviorsByClass: {
    params: Joi.object({
      classId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behaviors by behavior type validation
  getBehaviorsByBehaviorType: {
    params: Joi.object({
      behaviorTypeId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get behavior statistics validation
  getBehaviorStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create behaviors validation
  createBehaviorsBulk: {
    body: Joi.object({
      behaviors: Joi.array()
        .items(
          Joi.object({
            studentId: ValidationUtil.SCHEMAS.ID.required(),
            studentName: Joi.string().max(255).required(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            behaviorTypeId: ValidationUtil.SCHEMAS.ID.required(),
            classId: ValidationUtil.SCHEMAS.ID.required(),
            moduleId: ValidationUtil.SCHEMAS.ID.optional(),
            lessonId: ValidationUtil.SCHEMAS.ID.optional(),
            dateOfIncident: Joi.date().iso().required(),
            description: Joi.string().allow(null, "").optional(),
            actionTaken: Joi.string().allow(null, "").optional(),
            staffId: ValidationUtil.SCHEMAS.ID.required(),
            resolutionStatus: Joi.string()
              .valid("Pending", "Resolved", "Dismissed", "Under Investigation")
              .default("Pending")
              .optional(),
            priority: Joi.string()
              .valid("High", "Medium", "Low")
              .default("Medium")
              .optional(),
            attachments: Joi.string().allow(null, "").optional(),
            createdById: ValidationUtil.SCHEMAS.ID.optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete behaviors validation
  deleteBehaviorsBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default behaviorValidationSchemas;
