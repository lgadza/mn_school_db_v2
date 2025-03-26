import { Router } from "express";
import projectFeedbackController from "../feedback/controller";
import ValidationUtil from "@/common/validators/validationUtil";
import projectFeedbackValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Get feedback by project ID
router.get(
  "/:projectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFeedback", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.getFeedbackByProjectId
  ),
  asyncHandler(projectFeedbackController.getFeedbackByProjectId)
);

// Get replies to a feedback
router.get(
  "/replies/:parentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFeedback", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.getRepliesByParentId
  ),
  asyncHandler(projectFeedbackController.getRepliesByParentId)
);

// Get a specific feedback by ID
router.get(
  "/single/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFeedback", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.getFeedbackById
  ),
  asyncHandler(projectFeedbackController.getFeedbackById)
);

// Create a new feedback
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission(
    "projectFeedback",
    PermissionAction.CREATE
  ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.createFeedback
  ),
  asyncHandler(projectFeedbackController.createFeedback)
);

// Update a feedback
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission(
    "projectFeedback",
    PermissionAction.UPDATE
  ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.updateFeedback
  ),
  asyncHandler(projectFeedbackController.updateFeedback)
);

// Delete a feedback
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission(
    "projectFeedback",
    PermissionAction.DELETE
  ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.deleteFeedback
  ),
  asyncHandler(projectFeedbackController.deleteFeedback)
);

// Bulk delete feedback for a project
router.delete(
  "/project/:projectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission(
    "projectFeedback",
    PermissionAction.DELETE
  ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.bulkDeleteFeedback
  ),
  asyncHandler(projectFeedbackController.bulkDeleteFeedback)
);

// Get a filtered list of feedback
router.get(
  "/list",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFeedback", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFeedbackValidationSchemas.getFeedbackList
  ),
  asyncHandler(projectFeedbackController.getFeedbackList)
);

export default router;
