import { Router } from "express";
import behaviorTypeController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import behaviorTypeValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Get behavior type list
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.getBehaviorTypeList
  ),
  asyncHandler(behaviorTypeController.getBehaviorTypeList)
);

// Get behavior type by ID
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.getBehaviorTypeById
  ),
  asyncHandler(behaviorTypeController.getBehaviorTypeById)
);

// Create a new behavior type
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.createBehaviorType
  ),
  asyncHandler(behaviorTypeController.createBehaviorType)
);

// Update a behavior type
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.updateBehaviorType
  ),
  asyncHandler(behaviorTypeController.updateBehaviorType)
);

// Delete a behavior type
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.deleteBehaviorType
  ),
  asyncHandler(behaviorTypeController.deleteBehaviorType)
);

// Get behavior types by school
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.getBehaviorTypesBySchool
  ),
  asyncHandler(behaviorTypeController.getBehaviorTypesBySchool)
);

// Get behavior types by category
router.get(
  "/category/:category",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.getBehaviorTypesByCategory
  ),
  asyncHandler(behaviorTypeController.getBehaviorTypesByCategory)
);

// Get behavior type statistics
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.getBehaviorTypeStatistics
  ),
  asyncHandler(behaviorTypeController.getBehaviorTypeStatistics)
);

// Create multiple behavior types at once
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.createBehaviorTypesBulk
  ),
  asyncHandler(behaviorTypeController.createBehaviorTypesBulk)
);

// Delete multiple behavior types at once
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behaviorType", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    behaviorTypeValidationSchemas.deleteBehaviorTypesBulk
  ),
  asyncHandler(behaviorTypeController.deleteBehaviorTypesBulk)
);

export default router;
