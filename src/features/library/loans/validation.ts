import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Book Loan API endpoints
 */
export const bookLoanValidationSchemas = {
  // Check out book validation
  checkoutBook: {
    body: Joi.object({
      bookId: ValidationUtil.SCHEMAS.ID.required(),
      userId: ValidationUtil.SCHEMAS.ID.required(),
      dueDate: Joi.date().iso().greater("now").optional(),
      notes: Joi.string().max(500).allow(null, "").optional(),
      rentalRuleId: ValidationUtil.SCHEMAS.ID.optional(),
    }),
  },

  // Check in book validation
  checkinBook: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      notes: Joi.string().max(500).allow(null, "").optional(),
      condition: Joi.string()
        .valid("good", "damaged", "lost")
        .default("good")
        .optional(),
      applyLateFee: Joi.boolean().default(true).optional(),
    }).optional(),
  },

  // Renew book loan validation
  renewBookLoan: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      notes: Joi.string().max(500).allow(null, "").optional(),
      newDueDate: Joi.date().iso().greater("now").optional(),
    }).optional(),
  },

  // Get loan by ID validation
  getLoanById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get user's active loans validation
  getUserActiveLoans: {
    params: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string()
        .valid("dueDate", "rentalDate", "createdAt")
        .default("dueDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
    }),
  },

  // Get user's loan history validation
  getUserLoanHistory: {
    params: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.string().valid("active", "returned", "overdue").optional(),
      sortBy: Joi.string()
        .valid("dueDate", "rentalDate", "returnDate", "createdAt")
        .default("rentalDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
    }),
  },

  // Get book's loan history validation
  getBookLoanHistory: {
    params: Joi.object({
      bookId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.string().valid("active", "returned", "overdue").optional(),
      sortBy: Joi.string()
        .valid("dueDate", "rentalDate", "returnDate", "createdAt")
        .default("rentalDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
    }),
  },

  // Get all loans validation
  getAllLoans: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      status: Joi.string().valid("active", "returned", "overdue").optional(),
      sortBy: Joi.string()
        .valid("dueDate", "rentalDate", "returnDate", "createdAt")
        .default("rentalDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      userId: ValidationUtil.SCHEMAS.ID.optional(),
      bookId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
      overdue: Joi.boolean().optional(),
    }),
  },

  // Get school loans validation
  getSchoolLoans: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      status: Joi.string().valid("active", "returned", "overdue").optional(),
      sortBy: Joi.string()
        .valid("dueDate", "rentalDate", "returnDate", "createdAt")
        .default("rentalDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
      overdue: Joi.boolean().optional(),
    }),
  },

  // Get overdue loans validation
  getOverdueLoans: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      sortBy: Joi.string()
        .valid("dueDate", "rentalDate", "createdAt")
        .default("dueDate"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
    }),
  },

  // Update loan validation
  updateLoan: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      dueDate: Joi.date().iso().greater("now").optional(),
      notes: Joi.string().max(500).allow(null, "").optional(),
      status: Joi.string().valid("active", "returned", "overdue").optional(),
      lateFee: Joi.number().min(0).allow(null).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Delete loan validation
  deleteLoan: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get loan statistics validation
  getLoanStatistics: {
    query: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      fromDate: Joi.date().iso().optional(),
      toDate: Joi.date().iso().optional(),
      limit: Joi.number().integer().min(1).max(20).default(5),
    }),
  },
};

export default bookLoanValidationSchemas;
