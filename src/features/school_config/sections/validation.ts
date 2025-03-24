import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Section API endpoints
 */
export const sectionValidationSchemas = {
  // Create section validation
  createSection: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      capacity: Joi.number().integer().min(0).allow(null).optional(),
      details: Joi.string().allow(null, "").optional(),
      color: Joi.string().max(50).allow(null, "").optional(),
      startDate: Joi.date().iso().allow(null).optional(),
      endDate: Joi.date().iso().allow(null).optional(),
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

  // Update section validation
  updateSection: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      capacity: Joi.number().integer().min(0).allow(null).optional(),
      details: Joi.string().allow(null, "").optional(),
      color: Joi.string().max(50).allow(null, "").optional(),
      startDate: Joi.date().iso().allow(null).optional(),
      endDate: Joi.date().iso().allow(null).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update")
      .custom((value, helpers) => {
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

  // Get section by ID validation
  getSectionById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete section validation
  deleteSection: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get section list validation
  getSectionList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("name", "capacity", "startDate", "endDate", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      color: Joi.string().optional(),
      capacityMin: Joi.number().integer().min(0).optional(),
      capacityMax: Joi.number().integer().min(0).optional(),
      active: Joi.boolean().optional(),
    }),
  },

  // Get sections by school validation
  getSectionsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get section statistics validation
  getSectionStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create sections validation
  createSectionsBulk: {
    body: Joi.object({
      sections: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            capacity: Joi.number().integer().min(0).allow(null).optional(),
            details: Joi.string().allow(null, "").optional(),
            color: Joi.string().max(50).allow(null, "").optional(),
            startDate: Joi.date().iso().allow(null).optional(),
            endDate: Joi.date().iso().allow(null).optional(),
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
          }, "validate dates")
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete sections validation
  deleteSectionsBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default sectionValidationSchemas;
