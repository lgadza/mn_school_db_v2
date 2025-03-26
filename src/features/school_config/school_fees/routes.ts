import { Router } from "express";
import schoolFeeController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import schoolFeeValidationSchemas from "./validation";
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
 *     SchoolFee:
 *       type: object
 *       required:
 *         - id
 *         - schoolId
 *         - name
 *         - amount
 *         - currency
 *         - frequency
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the school fee
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this fee belongs to
 *         name:
 *           type: string
 *           description: The name of the fee
 *           example: "Tuition Fee"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the fee
 *         amount:
 *           type: number
 *           format: decimal
 *           description: The fee amount
 *           example: 500.00
 *         currency:
 *           type: string
 *           description: The currency of the fee
 *           example: "USD"
 *         frequency:
 *           type: string
 *           enum: [one-time, term, semester, annual, monthly, quarterly]
 *           description: How often the fee is charged
 *           example: "term"
 */

// GET /school-fees - Get all school fees with pagination and filtering
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolFeeValidationSchemas.getSchoolFeeList),
  asyncHandler(schoolFeeController.getSchoolFeeList)
);

// GET /school-fees/:id - Get school fee by ID
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolFeeValidationSchemas.getSchoolFeeById),
  asyncHandler(schoolFeeController.getSchoolFeeById)
);

// POST /school-fees - Create a new school fee
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.CREATE),
  ValidationUtil.validateRequest(schoolFeeValidationSchemas.createSchoolFee),
  asyncHandler(schoolFeeController.createSchoolFee)
);

// PUT /school-fees/:id - Update a school fee
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(schoolFeeValidationSchemas.updateSchoolFee),
  asyncHandler(schoolFeeController.updateSchoolFee)
);

// DELETE /school-fees/:id - Delete a school fee
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.DELETE),
  ValidationUtil.validateRequest(schoolFeeValidationSchemas.deleteSchoolFee),
  asyncHandler(schoolFeeController.deleteSchoolFee)
);

// GET /school-fees/school/:schoolId - Get school fees by school
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolFeeValidationSchemas.getSchoolFeesBySchool
  ),
  asyncHandler(schoolFeeController.getSchoolFeesBySchool)
);

// GET /school-fees/category/:category - Get school fees by category
router.get(
  "/category/:category",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolFeeValidationSchemas.getSchoolFeesByCategory
  ),
  asyncHandler(schoolFeeController.getSchoolFeesByCategory)
);

// GET /school-fees/statistics - Get school fee statistics
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolFeeValidationSchemas.getSchoolFeeStatistics
  ),
  asyncHandler(schoolFeeController.getSchoolFeeStatistics)
);

// POST /school-fees/bulk - Create multiple school fees at once
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    schoolFeeValidationSchemas.createSchoolFeesBulk
  ),
  asyncHandler(schoolFeeController.createSchoolFeesBulk)
);

// DELETE /school-fees/bulk - Delete multiple school fees at once
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolFee", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    schoolFeeValidationSchemas.deleteSchoolFeesBulk
  ),
  asyncHandler(schoolFeeController.deleteSchoolFeesBulk)
);

export default router;
