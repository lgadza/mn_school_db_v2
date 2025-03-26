import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Period API endpoints
 */
export const periodValidationSchemas = {
  // Create period validation
  createPeriod: {
    body: Joi.object({
      name: Joi.string()
        .max(100)
        .required()
        .description("Period name. Must be unique within a school."),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          "string.pattern.base":
            "Start time must be in format HH:MM (e.g., 08:30)",
        }),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          "string.pattern.base":
            "End time must be in format HH:MM (e.g., 09:30)",
        }),
      duration: Joi.number().integer().min(1).optional(),
      section: Joi.string().valid("morning", "afternoon", "evening").required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
    }).custom((value, helpers) => {
      // Validate startTime is before endTime
      const convertToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const startMinutes = convertToMinutes(value.startTime);
      const endMinutes = convertToMinutes(value.endTime);

      if (startMinutes >= endMinutes) {
        // Use a generic validation error
        return {
          value,
          errors: helpers.error("any.custom", {
            message: `End time (${value.endTime}) must be after start time (${value.startTime})`,
          }),
        };
      }

      // Validate that provided duration matches calculated duration
      const calculatedDuration = endMinutes - startMinutes;
      if (value.duration && value.duration !== calculatedDuration) {
        return {
          value,
          errors: helpers.error("any.custom", {
            message: `Provided duration (${value.duration} minutes) does not match the time difference between start and end time (${calculatedDuration} minutes)`,
          }),
        };
      }

      return value;
    }, "validate times"),
  },

  // Update period validation
  updatePeriod: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string()
        .max(100)
        .optional()
        .description("Period name. Must be unique within a school."),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          "string.pattern.base":
            "Start time must be in format HH:MM (e.g., 08:30)",
        }),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
          "string.pattern.base":
            "End time must be in format HH:MM (e.g., 09:30)",
        }),
      duration: Joi.number().integer().min(1).optional(),
      section: Joi.string().valid("morning", "afternoon", "evening").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
    })
      .min(1)
      .message("At least one field must be provided for update")
      .custom((value, helpers) => {
        // Validate startTime is before endTime if both are provided
        if (value.startTime && value.endTime) {
          const convertToMinutes = (time: string): number => {
            const [hours, minutes] = time.split(":").map(Number);
            return hours * 60 + minutes;
          };

          const startMinutes = convertToMinutes(value.startTime);
          const endMinutes = convertToMinutes(value.endTime);

          if (startMinutes >= endMinutes) {
            return {
              value,
              errors: helpers.error("any.custom", {
                message: `End time (${value.endTime}) must be after start time (${value.startTime})`,
              }),
            };
          }

          // Validate duration matches start/end time if all three are provided
          if (value.duration) {
            const calculatedDuration = endMinutes - startMinutes;
            if (value.duration !== calculatedDuration) {
              return {
                value,
                errors: helpers.error("any.custom", {
                  message: `Provided duration (${value.duration} minutes) does not match the time difference between start and end time (${calculatedDuration} minutes)`,
                }),
              };
            }
          }
        }

        return value;
      }, "validate times"),
  },

  // Get period by ID validation
  getPeriodById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete period validation
  deletePeriod: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get period list validation
  getPeriodList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "name",
          "startTime",
          "endTime",
          "duration",
          "section",
          "createdAt"
        )
        .default("startTime"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      section: Joi.string().valid("morning", "afternoon", "evening").optional(),
      durationMin: Joi.number().integer().min(1).optional(),
      durationMax: Joi.number().integer().min(1).optional(),
      startTimeFrom: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      startTimeTo: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      endTimeFrom: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      endTimeTo: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    }),
  },

  // Get periods by school validation
  getPeriodsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get period statistics validation
  getPeriodStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create periods validation
  createPeriodsBulk: {
    body: Joi.object({
      periods: Joi.array()
        .items(
          Joi.object({
            name: Joi.string()
              .max(100)
              .required()
              .description("Period name. Must be unique within a school."),
            startTime: Joi.string()
              .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
              .required()
              .messages({
                "string.pattern.base":
                  "Start time must be in format HH:MM (e.g., 08:30)",
              }),
            endTime: Joi.string()
              .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
              .required()
              .messages({
                "string.pattern.base":
                  "End time must be in format HH:MM (e.g., 09:30)",
              }),
            duration: Joi.number().integer().min(1).optional(),
            section: Joi.string()
              .valid("morning", "afternoon", "evening")
              .required(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
          }).custom((value, helpers) => {
            // Validate startTime is before endTime
            const convertToMinutes = (time: string): number => {
              const [hours, minutes] = time.split(":").map(Number);
              return hours * 60 + minutes;
            };

            const startMinutes = convertToMinutes(value.startTime);
            const endMinutes = convertToMinutes(value.endTime);

            if (startMinutes >= endMinutes) {
              return {
                value,
                errors: helpers.error("any.custom", {
                  message: `End time (${value.endTime}) must be after start time (${value.startTime})`,
                }),
              };
            }

            // Validate that provided duration matches calculated duration
            const calculatedDuration = endMinutes - startMinutes;
            if (value.duration && value.duration !== calculatedDuration) {
              return {
                value,
                errors: helpers.error("any.custom", {
                  message: `For period "${value.name}": Provided duration (${value.duration} minutes) does not match the time difference between start and end time (${calculatedDuration} minutes)`,
                }),
              };
            }

            return value;
          }, "validate times")
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete periods validation
  deletePeriodsBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default periodValidationSchemas;
