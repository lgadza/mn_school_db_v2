import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";
import { BookStatus } from "../interfaces/interfaces";

/**
 * Validation schemas for Book API endpoints
 */
export const bookValidationSchemas = {
  // Create book validation
  createBook: {
    body: Joi.object({
      title: Joi.string().max(200).required(),
      genre: Joi.string().max(100).required(),
      available: Joi.boolean().optional(),
      publishYear: Joi.string()
        .max(4)
        .pattern(/^\d{4}$/)
        .allow(null, "")
        .optional(),
      author: Joi.string().max(200).allow(null, "").optional(),
      coverUrl: Joi.string().uri().max(255).allow(null, "").optional(),
      description: Joi.string().max(2000).allow(null, "").optional(),
      copiesAvailable: Joi.number().integer().min(0).optional(),
      copiesTotal: Joi.number().integer().min(0).optional(),
      isbn: Joi.string().max(20).allow(null, "").optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      publisher: Joi.string().max(200).allow(null, "").optional(),
      language: Joi.string().max(50).optional(),
      pageCount: Joi.number().integer().min(1).allow(null).optional(),
      deweyDecimal: Joi.string().max(20).allow(null, "").optional(),
      tags: Joi.array().items(Joi.string()).allow(null).optional(),
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .optional(),
    }),
  },

  // Update book validation
  updateBook: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      title: Joi.string().max(200).optional(),
      genre: Joi.string().max(100).optional(),
      available: Joi.boolean().optional(),
      publishYear: Joi.string()
        .max(4)
        .pattern(/^\d{4}$/)
        .allow(null, "")
        .optional(),
      author: Joi.string().max(200).allow(null, "").optional(),
      coverUrl: Joi.string().uri().max(255).allow(null, "").optional(),
      description: Joi.string().max(2000).allow(null, "").optional(),
      copiesAvailable: Joi.number().integer().min(0).optional(),
      copiesTotal: Joi.number().integer().min(0).optional(),
      isbn: Joi.string().max(20).allow(null, "").optional(),
      publisher: Joi.string().max(200).allow(null, "").optional(),
      language: Joi.string().max(50).optional(),
      pageCount: Joi.number().integer().min(1).allow(null).optional(),
      deweyDecimal: Joi.string().max(20).allow(null, "").optional(),
      tags: Joi.array().items(Joi.string()).allow(null).optional(),
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get book by ID validation
  getBookById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get book by ISBN validation
  getBookByISBN: {
    params: Joi.object({
      isbn: Joi.string().required(),
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete book validation
  deleteBook: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Change book status validation
  changeBookStatus: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .required(),
    }),
  },

  // Get book list validation
  getBookList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "title",
          "genre",
          "author",
          "publishYear",
          "copiesAvailable",
          "createdAt"
        )
        .default("title"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
      genre: Joi.string().optional(),
      author: Joi.string().optional(),
      publishYear: Joi.string().optional(),
      available: Joi.boolean().optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .optional(),
      language: Joi.string().optional(),
    }),
  },

  // Get books by school validation
  getBooksBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "title",
          "genre",
          "author",
          "publishYear",
          "copiesAvailable",
          "createdAt"
        )
        .default("title"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
      genre: Joi.string().optional(),
      author: Joi.string().optional(),
      publishYear: Joi.string().optional(),
      available: Joi.boolean().optional(),
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .optional(),
      language: Joi.string().optional(),
    }),
  },

  // Get books by genre validation
  getBooksByGenre: {
    params: Joi.object({
      genre: Joi.string().required(),
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("title", "author", "publishYear", "copiesAvailable", "createdAt")
        .default("title"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
      author: Joi.string().optional(),
      publishYear: Joi.string().optional(),
      available: Joi.boolean().optional(),
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .optional(),
      language: Joi.string().optional(),
    }),
  },

  // Search books validation
  searchBooks: {
    params: Joi.object({
      query: Joi.string().required(),
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string()
        .valid(
          "title",
          "genre",
          "author",
          "publishYear",
          "copiesAvailable",
          "createdAt"
        )
        .default("title"),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
      genre: Joi.string().optional(),
      author: Joi.string().optional(),
      publishYear: Joi.string().optional(),
      available: Joi.boolean().optional(),
      status: Joi.string()
        .valid(...Object.values(BookStatus))
        .optional(),
      language: Joi.string().optional(),
    }),
  },

  // Checkout book validation
  checkoutBook: {
    body: Joi.object({
      bookId: ValidationUtil.SCHEMAS.ID.required(),
      userId: ValidationUtil.SCHEMAS.ID.required(),
      dueDate: Joi.date().iso().greater("now").required(),
      notes: Joi.string().max(500).allow(null, "").optional(),
    }),
  },

  // Checkin book validation
  checkinBook: {
    params: Joi.object({
      loanId: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      notes: Joi.string().max(500).allow(null, "").optional(),
    }).optional(),
  },
};

export default bookValidationSchemas;
