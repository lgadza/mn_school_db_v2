import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

/**
 * Validation schemas for User API endpoints
 */
export const userValidationSchemas = {
  // Create user validation
  createUser: {
    body: Joi.object({
      email: ValidationUtil.SCHEMAS.EMAIL,
      username: Joi.string().min(3).max(30).optional(),
      password: ValidationUtil.SCHEMAS.PASSWORD,
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      phoneNumber: ValidationUtil.SCHEMAS.PHONE,
      gender: Joi.string()
        .valid("male", "female", "other", "prefer-not-to-say")
        .optional(),
      dateOfBirth: ValidationUtil.SCHEMAS.DATE.optional(),
      countryCode: Joi.string().min(2).max(3).optional(),
      isActive: Joi.boolean().default(true),
      roles: Joi.array().items(Joi.string().uuid()).optional(),
      schoolId: Joi.string().uuid().optional(),
      avatar: Joi.string().uri().optional(),
    }),
  },

  // Update user validation
  updateUser: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      email: Joi.string().email().optional(),
      username: Joi.string().min(3).max(30).optional(),
      firstName: Joi.string().min(2).max(50).optional(),
      lastName: Joi.string().min(2).max(50).optional(),
      phoneNumber: ValidationUtil.SCHEMAS.PHONE.optional(),
      gender: Joi.string()
        .valid("male", "female", "other", "prefer-not-to-say")
        .optional(),
      dateOfBirth: ValidationUtil.SCHEMAS.DATE.optional(),
      countryCode: Joi.string().min(2).max(3).optional(),
      isActive: Joi.boolean().optional(),
      roles: Joi.array().items(Joi.string().uuid()).optional(),
      schoolId: Joi.string().uuid().optional().allow(null),
      avatar: Joi.string().uri().optional().allow(null),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get user by ID validation
  getUserById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete user validation
  deleteUser: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Update user password validation (for users)
  updatePassword: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: ValidationUtil.SCHEMAS.PASSWORD,
      confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({ "any.only": "Passwords do not match" }),
    }),
  },

  // Admin update user password validation
  adminUpdatePassword: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      password: ValidationUtil.SCHEMAS.PASSWORD,
      sendEmail: Joi.boolean().default(true),
    }),
  },

  // Get user list validation
  getUserList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "firstName",
          "lastName",
          "email",
          "username",
          "createdAt",
          "lastLogin",
          "isActive"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      isActive: Joi.boolean().optional(),
      role: Joi.string().optional(),
      createdAfter: ValidationUtil.SCHEMAS.DATE.optional(),
      createdBefore: ValidationUtil.SCHEMAS.DATE.optional(),
    }),
  },

  // Update user roles validation
  updateUserRoles: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      roles: Joi.array().items(Joi.string().uuid()).min(1).required(),
      operation: Joi.string().valid("add", "remove", "set").required(),
    }),
  },

  // Upload user avatar validation
  uploadAvatar: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },
};

export default userValidationSchemas;
