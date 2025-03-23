import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for School API endpoints
 */
export const schoolValidationSchemas = {
  // Create school validation
  createSchool: {
    body: Joi.object({
      name: Joi.string().max(200).required(),
      level: Joi.string()
        .valid("primary", "secondary", "high", "tertiary", "quaternary")
        .required(),
      isPublic: Joi.boolean().required(),
      motto: Joi.string().max(200).allow(null, "").optional(),
      principalId: ValidationUtil.SCHEMAS.ID.required(),
      adminId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      addressId: ValidationUtil.SCHEMAS.ID.required(),
      logoUrl: Joi.string().uri().max(255).allow(null, "").optional(),
      websiteUrl: Joi.string().uri().max(255).allow(null, "").optional(),
      shortName: Joi.string().max(50).required(),
      capacity: Joi.string().max(50).allow(null, "").optional(),
      yearOpened: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear())
        .required(),
      schoolCode: Joi.string().max(20).optional(),
      schoolType: Joi.string().valid("day", "boarding", "both").required(),
      contactNumber: Joi.string().max(50).required(),
      email: Joi.string().email().max(100).allow(null, "").optional(),
    }),
  },

  // Create school with address validation
  createSchoolWithAddress: {
    body: Joi.object({
      schoolData: Joi.object({
        name: Joi.string().max(200).required(),
        level: Joi.string()
          .valid("primary", "secondary", "high", "tertiary", "quaternary")
          .required(),
        isPublic: Joi.boolean().required(),
        motto: Joi.string().max(200).allow(null, "").optional(),
        principalId: ValidationUtil.SCHEMAS.ID.required(),
        adminId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
        logoUrl: Joi.string().uri().max(255).allow(null, "").optional(),
        websiteUrl: Joi.string().uri().max(255).allow(null, "").optional(),
        shortName: Joi.string().max(50).required(),
        capacity: Joi.string().max(50).allow(null, "").optional(),
        yearOpened: Joi.number()
          .integer()
          .min(1800)
          .max(new Date().getFullYear())
          .required(),
        schoolCode: Joi.string().max(20).optional(),
        schoolType: Joi.string().valid("day", "boarding", "both").required(),
        contactNumber: Joi.string().max(50).required(),
        email: Joi.string().email().max(100).allow(null, "").optional(),
      }).required(),
      addressData: Joi.object({
        buildingNumber: Joi.string().max(20).required(),
        street: Joi.string().max(100).required(),
        city: Joi.string().max(100).required(),
        province: Joi.string().max(100).required(),
        addressLine2: Joi.string().max(100).allow(null, "").optional(),
        postalCode: Joi.string().max(20).allow(null, "").optional(),
        country: Joi.string().max(100).required(),
      }).required(),
    }),
  },

  // Update school validation
  updateSchool: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(200).optional(),
      level: Joi.string()
        .valid("primary", "secondary", "high", "tertiary", "quaternary")
        .optional(),
      isPublic: Joi.boolean().optional(),
      motto: Joi.string().max(200).allow(null, "").optional(),
      principalId: ValidationUtil.SCHEMAS.ID.optional(),
      adminId: ValidationUtil.SCHEMAS.ID.allow(null).optional(),
      addressId: ValidationUtil.SCHEMAS.ID.optional(),
      logoUrl: Joi.string().uri().max(255).allow(null, "").optional(),
      websiteUrl: Joi.string().uri().max(255).allow(null, "").optional(),
      shortName: Joi.string().max(50).optional(),
      capacity: Joi.string().max(50).allow(null, "").optional(),
      yearOpened: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear())
        .optional(),
      schoolCode: Joi.string().max(20).optional(),
      schoolType: Joi.string().valid("day", "boarding", "both").optional(),
      contactNumber: Joi.string().max(50).optional(),
      email: Joi.string().email().max(100).allow(null, "").optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get school by ID validation
  getSchoolById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get school by code validation
  getSchoolByCode: {
    params: Joi.object({
      code: Joi.string().required(),
    }),
  },

  // Delete school validation
  deleteSchool: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get school list validation
  getSchoolList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "name",
          "level",
          "isPublic",
          "yearOpened",
          "schoolCode",
          "schoolType",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      level: Joi.string()
        .valid("primary", "secondary", "high", "tertiary", "quaternary")
        .optional(),
      isPublic: Joi.boolean().optional(),
      schoolType: Joi.string().valid("day", "boarding", "both").optional(),
      yearOpened: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear())
        .optional(),
    }),
  },

  // Get schools by principal validation
  getSchoolsByPrincipal: {
    params: Joi.object({
      principalId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get schools by admin validation
  getSchoolsByAdmin: {
    params: Joi.object({
      adminId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Generate school code validation
  generateSchoolCode: {
    query: Joi.object({
      name: Joi.string().required(),
      level: Joi.string()
        .valid("primary", "secondary", "high", "tertiary", "quaternary")
        .required(),
    }),
  },
};

export default schoolValidationSchemas;
