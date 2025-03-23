import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

export const authSchemas = {
  register: {
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
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },

  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  },

  resetPasswordRequest: {
    body: Joi.object({
      email: ValidationUtil.SCHEMAS.EMAIL,
    }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: ValidationUtil.SCHEMAS.PASSWORD,
    }),
  },

  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required(),
    }),
  },
};

export default authSchemas;
