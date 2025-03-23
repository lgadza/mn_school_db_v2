import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for Address API endpoints
 */
export const addressValidationSchemas = {
  // Create address validation
  createAddress: {
    body: Joi.object({
      buildingNumber: Joi.string().max(20).required(),
      street: Joi.string().max(100).required(),
      city: Joi.string().max(100).required(),
      province: Joi.string().max(100).required(),
      addressLine2: Joi.string().max(100).allow(null, "").optional(),
      postalCode: Joi.string().max(20).allow(null, "").optional(),
      country: Joi.string().max(100).required(),
    }),
  },

  // Update address validation
  updateAddress: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      buildingNumber: Joi.string().max(20).optional(),
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(100).optional(),
      province: Joi.string().max(100).optional(),
      addressLine2: Joi.string().max(100).allow(null, "").optional(),
      postalCode: Joi.string().max(20).allow(null, "").optional(),
      country: Joi.string().max(100).optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get address by ID validation
  getAddressById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete address validation
  deleteAddress: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get address list validation
  getAddressList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "buildingNumber",
          "street",
          "city",
          "province",
          "country",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      city: Joi.string().optional(),
      province: Joi.string().optional(),
      country: Joi.string().optional(),
    }),
  },

  // Link address to entity validation
  linkAddressToEntity: {
    body: Joi.object({
      addressId: ValidationUtil.SCHEMAS.ID,
      entityId: ValidationUtil.SCHEMAS.ID,
      entityType: Joi.string().required(),
      addressType: Joi.string().required(),
      isPrimary: Joi.boolean().default(false),
    }),
  },

  // Create and link address validation
  createAndLinkAddress: {
    params: Joi.object({
      entityId: ValidationUtil.SCHEMAS.ID,
      entityType: Joi.string().required(),
      addressType: Joi.string().required(),
    }),
    body: Joi.object({
      address: Joi.object({
        buildingNumber: Joi.string().max(20).required(),
        street: Joi.string().max(100).required(),
        city: Joi.string().max(100).required(),
        province: Joi.string().max(100).required(),
        addressLine2: Joi.string().max(100).allow(null, "").optional(),
        postalCode: Joi.string().max(20).allow(null, "").optional(),
        country: Joi.string().max(100).required(),
      }).required(),
      isPrimary: Joi.boolean().default(false),
    }),
  },

  // Update address link validation
  updateAddressLink: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      isPrimary: Joi.boolean().required(),
    }),
  },

  // Unlink address validation
  unlinkAddress: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get entity addresses validation
  getEntityAddresses: {
    params: Joi.object({
      entityId: ValidationUtil.SCHEMAS.ID,
      entityType: Joi.string().required(),
    }),
  },

  // Get entity address by type validation
  getEntityAddressByType: {
    params: Joi.object({
      entityId: ValidationUtil.SCHEMAS.ID,
      entityType: Joi.string().required(),
      addressType: Joi.string().required(),
    }),
  },

  // Get entity primary address validation
  getEntityPrimaryAddress: {
    params: Joi.object({
      entityId: ValidationUtil.SCHEMAS.ID,
      entityType: Joi.string().required(),
    }),
    query: Joi.object({
      addressType: Joi.string().optional(),
    }),
  },

  // Validate postal code validation
  validatePostalCode: {
    query: Joi.object({
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    }),
  },
};

export default addressValidationSchemas;
