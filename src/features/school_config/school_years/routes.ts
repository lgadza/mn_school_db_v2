import { Router } from "express";
import schoolYearController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import schoolYearValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Get school year by ID
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolYearValidationSchemas.getSchoolYearById),
  asyncHandler(schoolYearController.getSchoolYearById)
);

// Get all school years with filtering and pagination
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolYearValidationSchemas.getSchoolYearList),
  asyncHandler(schoolYearController.getSchoolYearList)
);

// Create a new school year
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.CREATE),
  ValidationUtil.validateRequest(schoolYearValidationSchemas.createSchoolYear),
  asyncHandler(schoolYearController.createSchoolYear)
);

// Update a school year
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(schoolYearValidationSchemas.updateSchoolYear),
  asyncHandler(schoolYearController.updateSchoolYear)
);

// Delete a school year
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.DELETE),
  ValidationUtil.validateRequest(schoolYearValidationSchemas.deleteSchoolYear),
  asyncHandler(schoolYearController.deleteSchoolYear)
);

// Get school years by school
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.getSchoolYearsBySchool
  ),
  asyncHandler(schoolYearController.getSchoolYearsBySchool)
);

// Get active school year for a school
router.get(
  "/active/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.getActiveSchoolYear
  ),
  asyncHandler(schoolYearController.getActiveSchoolYear)
);

// Get current school year (based on current date)
router.get(
  "/current/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.getActiveSchoolYear
  ),
  asyncHandler(schoolYearController.getCurrentSchoolYear)
);

// Get school year statistics
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.READ),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.getSchoolYearStatistics
  ),
  asyncHandler(schoolYearController.getSchoolYearStatistics)
);

// Set a school year as active
router.patch(
  "/activate/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.setActiveSchoolYear
  ),
  asyncHandler(schoolYearController.setActiveSchoolYear)
);

// Create multiple school years at once
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.createSchoolYearsBulk
  ),
  asyncHandler(schoolYearController.createSchoolYearsBulk)
);

// Generate school years for a school
router.post(
  "/generate",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("schoolYear", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    schoolYearValidationSchemas.generateSchoolYears
  ),
  asyncHandler(schoolYearController.generateSchoolYears)
);

export default router;
