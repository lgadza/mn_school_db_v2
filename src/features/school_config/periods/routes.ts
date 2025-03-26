import { Router } from "express";
import periodController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import periodValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * components:
 *   schemas:
 *     Period:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - startTime
 *         - endTime
 *         - duration
 *         - section
 *         - schoolId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the period
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           description: The name of the period
 *           example: Period 1
 *         startTime:
 *           type: string
 *           description: The start time of the period (HH:MM format)
 *           example: 08:00
 *         endTime:
 *           type: string
 *           description: The end time of the period (HH:MM format)
 *           example: 09:30
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *           example: 90
 *         section:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           description: The section of the day this period belongs to
 *           example: morning
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this period belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 */

// GET /periods - Get all periods with pagination and filtering
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.READ),
  ValidationUtil.validateRequest(periodValidationSchemas.getPeriodList),
  asyncHandler(periodController.getPeriodList)
);

// GET /periods/:id - Get period by ID
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.READ),
  ValidationUtil.validateRequest(periodValidationSchemas.getPeriodById),
  asyncHandler(periodController.getPeriodById)
);

// POST /periods - Create a new period
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.CREATE),
  ValidationUtil.validateRequest(periodValidationSchemas.createPeriod),
  asyncHandler(periodController.createPeriod)
);

// PUT /periods/:id - Update a period
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(periodValidationSchemas.updatePeriod),
  asyncHandler(periodController.updatePeriod)
);

// DELETE /periods/:id - Delete a period
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.DELETE),
  ValidationUtil.validateRequest(periodValidationSchemas.deletePeriod),
  asyncHandler(periodController.deletePeriod)
);

// GET /periods/school/:schoolId - Get periods by school
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.READ),
  ValidationUtil.validateRequest(periodValidationSchemas.getPeriodsBySchool),
  asyncHandler(periodController.getPeriodsBySchool)
);

// GET /periods/statistics - Get period statistics
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.READ),
  ValidationUtil.validateRequest(periodValidationSchemas.getPeriodStatistics),
  asyncHandler(periodController.getPeriodStatistics)
);

// POST /periods/bulk - Create multiple periods at once
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.CREATE),
  ValidationUtil.validateRequest(periodValidationSchemas.createPeriodsBulk),
  asyncHandler(periodController.createPeriodsBulk)
);

// DELETE /periods/bulk - Delete multiple periods at once
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("period", PermissionAction.DELETE),
  ValidationUtil.validateRequest(periodValidationSchemas.deletePeriodsBulk),
  asyncHandler(periodController.deletePeriodsBulk)
);

export default router;
