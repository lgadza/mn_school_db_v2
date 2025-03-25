import { Router } from "express";
import behaviorController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import behaviorValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Get behavior list
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(behaviorValidationSchemas.getBehaviorList),
  asyncHandler(behaviorController.getBehaviorList)
);

// Get behavior by ID
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(behaviorValidationSchemas.getBehaviorById),
  asyncHandler(behaviorController.getBehaviorById)
);

// Create a new behavior
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.CREATE),
  ValidationUtil.validateRequest(behaviorValidationSchemas.createBehavior),
  asyncHandler(behaviorController.createBehavior)
);

// Update a behavior
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(behaviorValidationSchemas.updateBehavior),
  asyncHandler(behaviorController.updateBehavior)
);

// Delete a behavior
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.DELETE),
  ValidationUtil.validateRequest(behaviorValidationSchemas.deleteBehavior),
  asyncHandler(behaviorController.deleteBehavior)
);

// Get behaviors by school
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorValidationSchemas.getBehaviorsBySchool
  ),
  asyncHandler(behaviorController.getBehaviorsBySchool)
);

// Get behaviors by student
router.get(
  "/student/:studentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorValidationSchemas.getBehaviorsByStudent
  ),
  asyncHandler(behaviorController.getBehaviorsByStudent)
);

// Get behaviors by class
router.get(
  "/class/:classId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(behaviorValidationSchemas.getBehaviorsByClass),
  asyncHandler(behaviorController.getBehaviorsByClass)
);

// Get behaviors by behavior type
router.get(
  "/type/:behaviorTypeId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorValidationSchemas.getBehaviorsByBehaviorType
  ),
  asyncHandler(behaviorController.getBehaviorsByBehaviorType)
);

// Get behavior statistics
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.READ),
  ValidationUtil.validateRequest(
    behaviorValidationSchemas.getBehaviorStatistics
  ),
  asyncHandler(behaviorController.getBehaviorStatistics)
);

// Create multiple behaviors at once
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.CREATE),
  ValidationUtil.validateRequest(behaviorValidationSchemas.createBehaviorsBulk),
  asyncHandler(behaviorController.createBehaviorsBulk)
);

// Delete multiple behaviors at once
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("behavior", PermissionAction.DELETE),
  ValidationUtil.validateRequest(behaviorValidationSchemas.deleteBehaviorsBulk),
  asyncHandler(behaviorController.deleteBehaviorsBulk)
);

export default router;
