import { Router } from "express";
import gradeController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import projectGradeValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Get grades by project ID
router.get(
  "/:projectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectGradeValidationSchemas.getGradesByProjectId
  ),
  asyncHandler(gradeController.getGradesByProjectId)
);

// Get grades by student ID
router.get(
  "/student/:studentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectGradeValidationSchemas.getGradesByStudentId
  ),
  asyncHandler(gradeController.getGradesByStudentId)
);

// Get grade by project and student
router.get(
  "/project/:projectId/student/:studentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectGradeValidationSchemas.getGradeByProjectAndStudent
  ),
  asyncHandler(gradeController.getGradeByProjectAndStudent)
);

// Get a specific grade by ID
router.get(
  "/single/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.READ),
  ValidationUtil.validateRequest(projectGradeValidationSchemas.getGradeById),
  asyncHandler(gradeController.getGradeById)
);

// Create a new grade
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.CREATE),
  ValidationUtil.validateRequest(projectGradeValidationSchemas.createGrade),
  asyncHandler(gradeController.createGrade)
);

// Update a grade
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(projectGradeValidationSchemas.updateGrade),
  asyncHandler(gradeController.updateGrade)
);

// Delete a grade
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.DELETE),
  ValidationUtil.validateRequest(projectGradeValidationSchemas.deleteGrade),
  asyncHandler(gradeController.deleteGrade)
);

// Bulk delete grades for a project
router.delete(
  "/project/:projectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    projectGradeValidationSchemas.bulkDeleteGrades
  ),
  asyncHandler(gradeController.bulkDeleteGrades)
);

// Get a filtered list of grades
router.get(
  "/list",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("projectGrade", PermissionAction.READ),
  ValidationUtil.validateRequest(projectGradeValidationSchemas.getGradeList),
  asyncHandler(gradeController.getGradeList)
);

export default router;
