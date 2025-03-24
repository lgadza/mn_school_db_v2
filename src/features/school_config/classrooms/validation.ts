import Joi from "joi";
import ValidationUtil from "@/common/validators/validationUtil";

const VALID_ROOM_TYPES = [
  "standard",
  "laboratory",
  "computer_lab",
  "library",
  "auditorium",
  "gymnasium",
  "art_studio",
  "music_room",
  "staff_room",
  "other",
];

const VALID_STATUSES = [
  "active",
  "inactive",
  "maintenance",
  "renovation",
  "closed",
];

/**
 * Validation schemas for Classroom API endpoints
 */
export const classroomValidationSchemas = {
  // Create classroom validation
  createClassroom: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      roomType: Joi.string()
        .valid(...VALID_ROOM_TYPES)
        .required(),
      maxStudents: Joi.number().integer().min(1).required(),
      blockId: ValidationUtil.SCHEMAS.ID.required(),
      schoolId: ValidationUtil.SCHEMAS.ID.required(),
      details: Joi.string().allow(null, "").optional(),
      floor: Joi.number().integer().allow(null).optional(),
      features: Joi.array().items(Joi.string()).allow(null).optional(),
      status: Joi.string()
        .valid(...VALID_STATUSES)
        .allow(null)
        .optional(),
    }),
  },

  // Update classroom validation
  updateClassroom: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      roomType: Joi.string()
        .valid(...VALID_ROOM_TYPES)
        .optional(),
      maxStudents: Joi.number().integer().min(1).optional(),
      blockId: ValidationUtil.SCHEMAS.ID.optional(),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      details: Joi.string().allow(null, "").optional(),
      floor: Joi.number().integer().allow(null).optional(),
      features: Joi.array().items(Joi.string()).allow(null).optional(),
      status: Joi.string()
        .valid(...VALID_STATUSES)
        .allow(null)
        .optional(),
    })
      .min(1)
      .message("At least one field must be provided for update"),
  },

  // Get classroom by ID validation
  getClassroomById: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Delete classroom validation
  deleteClassroom: {
    params: Joi.object({
      id: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classroom list validation
  getClassroomList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(
          "name",
          "roomType",
          "maxStudents",
          "floor",
          "status",
          "createdAt"
        )
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
      schoolId: ValidationUtil.SCHEMAS.ID.optional(),
      blockId: ValidationUtil.SCHEMAS.ID.optional(),
      roomType: Joi.string()
        .valid(...VALID_ROOM_TYPES)
        .optional(),
      status: Joi.string()
        .valid(...VALID_STATUSES)
        .optional(),
      minCapacity: Joi.number().integer().min(1).optional(),
      maxCapacity: Joi.number().integer().optional(),
      floor: Joi.number().integer().optional(),
      feature: Joi.string().optional(),
    }),
  },

  // Get classrooms by school validation
  getClassroomsBySchool: {
    params: Joi.object({
      schoolId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classrooms by block validation
  getClassroomsByBlock: {
    params: Joi.object({
      blockId: ValidationUtil.SCHEMAS.ID,
    }),
  },

  // Get classroom statistics validation
  getClassroomStatistics: {
    query: Joi.object({}),
  },

  // Bulk create classrooms validation
  createClassroomsBulk: {
    body: Joi.object({
      classrooms: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            roomType: Joi.string()
              .valid(...VALID_ROOM_TYPES)
              .required(),
            maxStudents: Joi.number().integer().min(1).required(),
            blockId: ValidationUtil.SCHEMAS.ID.required(),
            schoolId: ValidationUtil.SCHEMAS.ID.required(),
            details: Joi.string().allow(null, "").optional(),
            floor: Joi.number().integer().allow(null).optional(),
            features: Joi.array().items(Joi.string()).allow(null).optional(),
            status: Joi.string()
              .valid(...VALID_STATUSES)
              .allow(null)
              .optional(),
          })
        )
        .min(1)
        .required(),
    }),
  },

  // Bulk delete classrooms validation
  deleteClassroomsBulk: {
    body: Joi.object({
      ids: Joi.array().items(ValidationUtil.SCHEMAS.ID).min(1).required(),
    }),
  },
};

export default classroomValidationSchemas;
