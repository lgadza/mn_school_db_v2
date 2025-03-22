import Joi from "joi";

const roleSchemas = {
  createRole: {
    body: Joi.object({
      name: Joi.string().min(3).max(50).required(),
      description: Joi.string().max(255).optional(),
    }),
  },

  updateRole: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      name: Joi.string().min(3).max(50).optional(),
      description: Joi.string().max(255).optional(),
    }).min(1), // At least one field must be provided
  },

  getRoleById: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  deleteRole: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  addPermissions: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      permissionIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    }),
  },

  removePermissions: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      permissionIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    }),
  },
};

export default roleSchemas;
