import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";
import { InterestLevel } from "./interfaces/interfaces";

/**
 * Validation schemas for Prospect API endpoints
 */
export const prospectValidationSchemas = {
  // Create prospect validation
  createProspect: {
    body: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID.required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      roleId: ValidationUtil.SCHEMAS.ID.required(),
      addressId: ValidationUtil.SCHEMAS.ID.required(),
      interestLevel: Joi.string()
        .valid(...Object.values(InterestLevel))
        .default(InterestLevel.MEDIUM),
      contactDate: Joi.date().iso().required(),
      notes: Joi.string().allow(null, "").optional(),
      activeStatus: Joi.boolean().default(true),
    }),
  },

  // Update prospect validation
  updateProspect: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      roleId: ValidationUtil.SCHEMAS.ID.optional(),
      addressId: ValidationUtil.SCHEMAS.ID.optional(),
      interestLevel: Joi.string()
        .valid(...Object.values(InterestLevel))
        .optional(),
      contactDate: Joi.date().iso().optional(),
      notes: Joi.string().allow(null, "").optional(),
      activeStatus: Joi.boolean().optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get prospect by ID validation
  getProspectById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get prospect by user ID validation
  getProspectByUserId: {
    params: Joi.object({
      userId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete prospect validation
  deleteProspect: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get prospect list validation
  getProspectList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid("contactDate", "interestLevel", "createdAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      roleId: ValidationUtil.SCHEMAS.ID.optional(),
      interestLevel: Joi.string()
        .valid(...Object.values(InterestLevel))
        .optional(),
      activeStatus: Joi.boolean().optional(),
      contactDateFrom: Joi.date().iso().optional(),
      contactDateTo: Joi.date().iso().optional(),
    }),
  },

  // Get prospects by school validation
  getProspectsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get prospects by role validation
  getProspectsByRole: {
    params: Joi.object({
      roleId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get prospects by interest level validation
  getProspectsByInterestLevel: {
    params: Joi.object({
      interestLevel: Joi.string()
        .valid(...Object.values(InterestLevel))
        .required(),
    }),
  },

  // Get prospect statistics validation
  getProspectStatistics: {
    query: Joi.object({
      // No params needed for statistics
    }),
  },
};

export default prospectValidationSchemas;
