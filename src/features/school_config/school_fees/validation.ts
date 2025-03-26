import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for SchoolFee API endpoints
 */
export const schoolFeeValidationSchemas = {
  // Create school fee validation
  createSchoolFee: {
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      name: Joi.string().max(100).required().description("Fee name"),
      description: Joi.string().allow(null, "").optional(),
      amount: Joi.number().precision(2).positive().required(),
      currency: Joi.string().length(4).default("USD").optional(),
      frequency: Joi.string()
        .valid("one-time", "term", "semester", "annual", "monthly", "quarterly")
        .default("term")
        .optional(),
      dueDate: Joi.date().allow(null).optional(),
      isOptional: Joi.boolean().default(false).optional(),
      appliesTo: Joi.string()
        .valid(
          "all",
          "new-students",
          "returning-students",
          "transfer-students",
          "selected-grades"
        )
        .default("all")
        .optional(),
      status: Joi.string()
        .valid("active", "inactive", "pending", "archived")
        .default("active")
        .optional(),
      startDate: Joi.date().allow(null).optional(),
      endDate: Joi.date().allow(null).optional(),
      category: Joi.string()
        .valid(
          "tuition",
          "books",
          "lab",
          "sports",
          "extracurricular",
          "transportation",
          "uniform",
          "examination",
          "development",
          "other"
        )
        .default("tuition")
        .optional(),
      lateFee: Joi.number().precision(2).positive().allow(null).optional(),
      discountEligible: Joi.boolean().default(true).optional(),
      taxable: Joi.boolean().default(false).optional(),
    }).custom((value, helpers) => {
      // Additional validations if needed
      if (
        value.startDate &&
        value.endDate &&
        new Date(value.startDate) > new Date(value.endDate)
      ) {
        return helpers.error("custom.dateRange", {
          message: "End date must be after start date",
        });
      }
      return value;
    }),
  },

  // Update school fee validation
  updateSchoolFee: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      name: Joi.string().max(100).optional(),
      description: Joi.string().allow(null, "").optional(),
      amount: Joi.number().precision(2).positive().optional(),
      currency: Joi.string().length(4).optional(),
      frequency: Joi.string()
        .valid("one-time", "term", "semester", "annual", "monthly", "quarterly")
        .optional(),
      dueDate: Joi.date().allow(null).optional(),
      isOptional: Joi.boolean().optional(),
      appliesTo: Joi.string()
        .valid(
          "all",
          "new-students",
          "returning-students",
          "transfer-students",
          "selected-grades"
        )
        .optional(),
      status: Joi.string()
        .valid("active", "inactive", "pending", "archived")
        .optional(),
      startDate: Joi.date().allow(null).optional(),
      endDate: Joi.date().allow(null).optional(),
      category: Joi.string()
        .valid(
          "tuition",
          "books",
          "lab",
          "sports",
          "extracurricular",
          "transportation",
          "uniform",
          "examination",
          "development",
          "other"
        )
        .optional(),
      lateFee: Joi.number().precision(2).positive().allow(null).optional(),
      discountEligible: Joi.boolean().optional(),
      taxable: Joi.boolean().optional(),
    })
      .min(1)
      .message("At least one field must be provided for update")
      .custom((value, helpers) => {
        // Additional validations
        if (
          value.startDate &&
          value.endDate &&
          new Date(value.startDate) > new Date(value.endDate)
        ) {
          return helpers.error("custom.dateRange", {
            message: "End date must be after start date",
          });
        }
        return value;
      }),
  },

  // Get school fee by ID validation
  getSchoolFeeById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete school fee validation
  deleteSchoolFee: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get school fee list validation
  getSchoolFeeList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "name",
          "amount",
          "currency",
          "frequency",
          "category",
          "status",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      category: Joi.string().optional(),
      frequency: Joi.string().optional(),
      status: Joi.string().optional(),
      isOptional: Joi.boolean().optional(),
      minAmount: Joi.number().min(0).optional(),
      maxAmount: Joi.number().min(0).optional(),
      currency: Joi.string().optional(),
      appliesTo: Joi.string().optional(),
      discountEligible: Joi.boolean().optional(),
      taxable: Joi.boolean().optional(),
    }),
  },

  // Get school fees by school validation
  getSchoolFeesBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get school fees by category validation
  getSchoolFeesByCategory: {
    params: Joi.object({
      category: Joi.string().required(),
    }),
  },

  // Get school fee statistics validation
  getSchoolFeeStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },

  // Bulk create school fees validation
  createSchoolFeesBulk: {
    body: Joi.object({
      schoolFees: Joi.array()
        .items(
          Joi.object({
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            name: Joi.string().max(100).required().description("Fee name"),
            description: Joi.string().allow(null, "").optional(),
            amount: Joi.number().precision(2).positive().required(),
            currency: Joi.string().length(4).default("USD").optional(),
            frequency: Joi.string()
              .valid(
                "one-time",
                "term",
                "semester",
                "annual",
                "monthly",
                "quarterly"
              )
              .default("term")
              .optional(),
            dueDate: Joi.date().allow(null).optional(),
            isOptional: Joi.boolean().default(false).optional(),
            appliesTo: Joi.string()
              .valid(
                "all",
                "new-students",
                "returning-students",
                "transfer-students",
                "selected-grades"
              )
              .default("all")
              .optional(),
            status: Joi.string()
              .valid("active", "inactive", "pending", "archived")
              .default("active")
              .optional(),
            startDate: Joi.date().allow(null).optional(),
            endDate: Joi.date().allow(null).optional(),
            category: Joi.string()
              .valid(
                "tuition",
                "books",
                "lab",
                "sports",
                "extracurricular",
                "transportation",
                "uniform",
                "examination",
                "development",
                "other"
              )
              .default("tuition")
              .optional(),
            lateFee: Joi.number()
              .precision(2)
              .positive()
              .allow(null)
              .optional(),
            discountEligible: Joi.boolean().default(true).optional(),
            taxable: Joi.boolean().default(false).optional(),
          }).custom((value, helpers) => {
            if (
              value.startDate &&
              value.endDate &&
              new Date(value.startDate) > new Date(value.endDate)
            ) {
              return helpers.error("custom.dateRange", {
                message: `For fee "${value.name}": End date must be after start date`,
              });
            }
            return value;
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete school fees validation
  deleteSchoolFeesBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default schoolFeeValidationSchemas;
