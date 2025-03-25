import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";
import { SchoolYearStatus } from "./interfaces/interfaces";

/**
 * Validation schemas for SchoolYear API endpoints
 */
export const schoolYearValidationSchemas = {
  // Create school year validation
  createSchoolYear: {
    body: Joi.object({
      year: Joi.string()
        .max(50)
        .required()
        .pattern(/^\d{4}-\d{4}$/)
        .message("Year must be in format YYYY-YYYY"),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
      status: Joi.string()
        .valid(...Object.values(SchoolYearStatus))
        .allow(null)
        .optional(),
    }).custom((value, helpers) => {
      // Validate startDate is before endDate
      const startDate = new Date(value.startDate);
      const endDate = new Date(value.endDate);

      if (startDate >= endDate) {
        return helpers.error("date.startBeforeEnd");
      }

      // Validate that year format matches the actual dates (approximately)
      const [startYear, endYear] = value.year.split("-").map(Number);
      const startDateYear = startDate.getFullYear();
      const endDateYear = endDate.getFullYear();

      if (startYear !== startDateYear || endYear !== endDateYear) {
        return helpers.error("date.yearMismatch");
      }

      return value;
    }, "validate dates and year"),
  },

  // Update school year validation
  updateSchoolYear: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      year: Joi.string()
        .max(50)
        .optional()
        .pattern(/^\d{4}-\d{4}$/)
        .message("Year must be in format YYYY-YYYY"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      status: Joi.string()
        .valid(...Object.values(SchoolYearStatus))
        .allow(null)
        .optional(),
    })
      .min(1)
      .message("At least one field must be provided for update")
      .custom((value, helpers) => {
        // Only validate if both dates are provided
        if (value.startDate && value.endDate) {
          const startDate = new Date(value.startDate);
          const endDate = new Date(value.endDate);

          if (startDate >= endDate) {
            return helpers.error("date.startBeforeEnd");
          }
        }

        // Validate that year format matches the actual dates (approximately) if all are provided
        if (value.year && value.startDate && value.endDate) {
          const [startYear, endYear] = value.year.split("-").map(Number);
          const startDate = new Date(value.startDate);
          const endDate = new Date(value.endDate);
          const startDateYear = startDate.getFullYear();
          const endDateYear = endDate.getFullYear();

          if (startYear !== startDateYear || endYear !== endDateYear) {
            return helpers.error("date.yearMismatch");
          }
        }

        return value;
      }, "validate dates and year"),
  },

  // Get school year by ID validation
  getSchoolYearById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete school year validation
  deleteSchoolYear: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get school year list validation
  getSchoolYearList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("year", "startDate", "endDate", "status", "createdAt")
        .default("startDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      status: Joi.string()
        .valid(...Object.values(SchoolYearStatus))
        .optional(),
      year: Joi.string().optional(),
      currentOnly: Joi.boolean().optional(),
    }),
  },

  // Get school years by school validation
  getSchoolYearsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get active school year validation
  getActiveSchoolYear: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get school year statistics validation
  getSchoolYearStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Set active school year validation
  setActiveSchoolYear: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Bulk create school years validation
  createSchoolYearsBulk: {
    body: Joi.object({
      schoolYears: Joi.array()
        .items(
          Joi.object({
            year: Joi.string()
              .max(50)
              .required()
              .pattern(/^\d{4}-\d{4}$/)
              .message("Year must be in format YYYY-YYYY"),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            startDate: Joi.date().iso().required(),
            endDate: Joi.date().iso().required(),
            status: Joi.string()
              .valid(...Object.values(SchoolYearStatus))
              .allow(null)
              .optional(),
          }).custom((value, helpers) => {
            // Validate startDate is before endDate
            const startDate = new Date(value.startDate);
            const endDate = new Date(value.endDate);

            if (startDate >= endDate) {
              return helpers.error("date.startBeforeEnd");
            }

            // Validate that year format matches the actual dates (approximately)
            const [startYear, endYear] = value.year.split("-").map(Number);
            const startDateYear = startDate.getFullYear();
            const endDateYear = endDate.getFullYear();

            if (startYear !== startDateYear || endYear !== endDateYear) {
              return helpers.error("date.yearMismatch");
            }

            return value;
          }, "validate dates and year")
        )
        .min(1)
        .required(),
    }),
  },

  // Generate years for school validation
  generateSchoolYears: {
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      startYear: Joi.number().integer().min(2000).max(2100).required(),
      numberOfYears: Joi.number().integer().min(1).max(50).required(),
      yearStartMonth: Joi.number().integer().min(1).max(12).default(9), // September default
      yearStartDay: Joi.number().integer().min(1).max(31).default(1), // 1st default
      yearEndMonth: Joi.number().integer().min(1).max(12).default(6), // June default
      yearEndDay: Joi.number().integer().min(1).max(31).default(30), // 30th default
    }).custom((value, helpers) => {
      // Validate start/end month and day combinations
      if (value.yearStartMonth === 2 && value.yearStartDay > 29) {
        return helpers.error("date.invalidFebruaryDay");
      }
      if (
        [4, 6, 9, 11].includes(value.yearStartMonth) &&
        value.yearStartDay > 30
      ) {
        return helpers.error("date.invalidMonthDay");
      }

      if (value.yearEndMonth === 2 && value.yearEndDay > 29) {
        return helpers.error("date.invalidFebruaryDay");
      }
      if ([4, 6, 9, 11].includes(value.yearEndMonth) && value.yearEndDay > 30) {
        return helpers.error("date.invalidMonthDay");
      }

      return value;
    }, "validate month-day combinations"),
  },
};

export default schoolYearValidationSchemas;
