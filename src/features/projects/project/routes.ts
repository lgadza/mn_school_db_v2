import { Router } from "express";
import projectController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import projectValidationSchemas from "./validation";
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
 * tags:
 *   name: Projects
 *   description: Projects management API
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get a list of projects
 *     tags: [Projects]
 *     description: Retrieve a paginated list of projects with filtering options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of projects per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering projects
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, dueDate, status, difficulty]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A paginated list of projects
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.READ),
  ValidationUtil.validateRequest(projectValidationSchemas.getProjectList),
  asyncHandler(projectController.getProjectList)
);

/**
 * @swagger
 * /api/v1/projects/class/{classId}:
 *   get:
 *     summary: Get projects by class ID
 *     tags: [Projects]
 *     description: Retrieve all projects for a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Class ID
 *     responses:
 *       200:
 *         description: List of projects for the specified class
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/class/:classId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.READ),
  ValidationUtil.validateRequest(projectValidationSchemas.getProjectsByClassId),
  asyncHandler(projectController.getProjectsByClassId)
);

/**
 * @swagger
 * /api/v1/projects/subject/{subjectId}:
 *   get:
 *     summary: Get projects by subject ID
 *     tags: [Projects]
 *     description: Retrieve all projects for a specific subject
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: List of projects for the specified subject
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/subject/:subjectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectValidationSchemas.getProjectsBySubjectId
  ),
  asyncHandler(projectController.getProjectsBySubjectId)
);

/**
 * @swagger
 * /api/v1/projects/teacher/{teacherId}:
 *   get:
 *     summary: Get projects by teacher ID
 *     tags: [Projects]
 *     description: Retrieve all projects for a specific teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: List of projects for the specified teacher
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/teacher/:teacherId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.READ),
  ValidationUtil.validateRequest(
    projectValidationSchemas.getProjectsByTeacherId
  ),
  asyncHandler(projectController.getProjectsByTeacherId)
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     description: Retrieve project details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.READ),
  ValidationUtil.validateRequest(projectValidationSchemas.getProjectById),
  asyncHandler(projectController.getProjectById)
);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     description: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProject'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.CREATE),
  ValidationUtil.validateRequest(projectValidationSchemas.createProject),
  asyncHandler(projectController.createProject)
);

/**
 * @swagger
 * /api/v1/projects/bulk:
 *   post:
 *     summary: Bulk create projects
 *     tags: [Projects]
 *     description: Create multiple projects in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CreateProject'
 *     responses:
 *       201:
 *         description: Projects created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.CREATE),
  ValidationUtil.validateRequest(projectValidationSchemas.bulkCreateProjects),
  asyncHandler(projectController.bulkCreateProjects)
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     description: Update an existing project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProject'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(projectValidationSchemas.updateProject),
  asyncHandler(projectController.updateProject)
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     description: Delete a project by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.DELETE),
  ValidationUtil.validateRequest(projectValidationSchemas.deleteProject),
  asyncHandler(projectController.deleteProject)
);

/**
 * @swagger
 * /api/v1/projects/bulk-delete:
 *   post:
 *     summary: Bulk delete projects
 *     tags: [Projects]
 *     description: Delete multiple projects based on criteria
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDeleteProjects'
 *     responses:
 *       200:
 *         description: Projects deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/bulk-delete",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("project", PermissionAction.DELETE),
  ValidationUtil.validateRequest(projectValidationSchemas.bulkDeleteProjects),
  asyncHandler(projectController.bulkDeleteProjects)
);

export default router;
