import { Router } from "express";
import projectFileController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import projectFileValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";
import multerMiddleware from "@/shared/middleware/multer";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Configure multer for file uploads
const uploadSingle = multerMiddleware.createMulterUpload("ANY").single("file");

// Get project files by project ID
router.get(
  "/:projectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.getProjectFilesByProjectId
  ),
  asyncHandler(projectFileController.getProjectFiles)
);

// Get a specific file by ID
router.get(
  "/file/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.getProjectFileById
  ),
  asyncHandler(projectFileController.getProjectFileById)
);

// Upload a file to a project
router.post(
  "/:projectId/upload",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.CREATE),
  uploadSingle,
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.uploadProjectFile
  ),
  asyncHandler(projectFileController.uploadProjectFile)
);

// Update a file
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.updateProjectFile
  ),
  asyncHandler(projectFileController.updateProjectFile)
);

// Delete a file
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.deleteProjectFile
  ),
  asyncHandler(projectFileController.deleteProjectFile)
);

// Bulk delete files for a project
router.delete(
  "/project/:projectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.bulkDeleteProjectFiles
  ),
  asyncHandler(projectFileController.bulkDeleteProjectFiles)
);

// Download a file
router.get(
  "/:id/download",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.downloadProjectFile
  ),
  asyncHandler(projectFileController.downloadProjectFile)
);

// Get a filtered list of files
router.get(
  "/list",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectFile", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectFileValidationSchemas.getProjectFileList
  ),
  asyncHandler(projectFileController.getProjectFileList)
);

export default router;
