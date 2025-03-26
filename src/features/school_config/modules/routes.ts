import { Router } from "express";
import moduleController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import moduleValidationSchemas from "./validation";
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
 *   name: Modules
 *   description: Module management API
 */

/**
 * @swagger
 * /api/v1/modules:
 *   get:
 *     summary: Get a list of modules
 *     tags: [Modules]
 *     description: Retrieve a paginated list of modules with filtering options
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
 *         description: Number of modules per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering modules
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, totalStudents]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class ID
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by subject ID
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by teacher ID
 *       - in: query
 *         name: assistantTeacherId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assistant teacher ID
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by school ID
 *       - in: query
 *         name: classroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by classroom ID
 *       - in: query
 *         name: termId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by term ID
 *       - in: query
 *         name: classType
 *         schema:
 *           type: string
 *         description: Filter by class type
 *     responses:
 *       200:
 *         description: A paginated list of modules
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.READ),
  ValidationUtil.validateRequest(moduleValidationSchemas.getModuleList),
  asyncHandler(moduleController.getModuleList)
);

/**
 * @swagger
 * /api/v1/modules/{id}:
 *   get:
 *     summary: Get a module by ID
 *     tags: [Modules]
 *     description: Retrieve detailed information about a module by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Module not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.READ),
  ValidationUtil.validateRequest(moduleValidationSchemas.getModuleById),
  asyncHandler(moduleController.getModuleById)
);

/**
 * @swagger
 * /api/v1/modules/class/{classId}:
 *   get:
 *     summary: Get modules by class ID
 *     tags: [Modules]
 *     description: Retrieve all modules associated with a specific class
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
 *         description: Class modules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/class/:classId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.READ),
  ValidationUtil.validateRequest(moduleValidationSchemas.getModulesByClassId),
  asyncHandler(moduleController.getModulesByClassId)
);

/**
 * @swagger
 * /api/v1/modules/subject/{subjectId}:
 *   get:
 *     summary: Get modules by subject ID
 *     tags: [Modules]
 *     description: Retrieve all modules associated with a specific subject
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
 *         description: Subject modules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/subject/:subjectId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.READ),
  ValidationUtil.validateRequest(moduleValidationSchemas.getModulesBySubjectId),
  asyncHandler(moduleController.getModulesBySubjectId)
);

/**
 * @swagger
 * /api/v1/modules/teacher/{teacherId}:
 *   get:
 *     summary: Get modules by teacher ID
 *     tags: [Modules]
 *     description: Retrieve all modules taught by a specific teacher
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
 *         description: Teacher modules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/teacher/:teacherId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.READ),
  ValidationUtil.validateRequest(moduleValidationSchemas.getModulesByTeacherId),
  asyncHandler(moduleController.getModulesByTeacherId)
);

/**
 * @swagger
 * /api/v1/modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
 *     description: Create a new module record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subjectId
 *               - classId
 *               - teacherId
 *               - schoolId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *                 example: Advanced Mathematics
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: This module covers advanced mathematical concepts
 *               subjectId:
 *                 type: string
 *                 format: uuid
 *                 example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 example: b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22
 *               teacherId:
 *                 type: string
 *                 format: uuid
 *                 example: c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33
 *               assistantTeacherId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55
 *               classType:
 *                 type: string
 *                 nullable: true
 *                 example: hybrid
 *               classroomId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66
 *               materials:
 *                 type: string
 *                 nullable: true
 *                 example: Textbook, Calculator, Graph paper
 *               studentGroupId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77
 *               termId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88
 *               totalStudents:
 *                 type: integer
 *                 nullable: true
 *                 example: 30
 *     responses:
 *       201:
 *         description: Module created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - module name already exists in this class
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.CREATE),
  ValidationUtil.validateRequest(moduleValidationSchemas.createModule),
  asyncHandler(moduleController.createModule)
);

/**
 * @swagger
 * /api/v1/modules/bulk:
 *   post:
 *     summary: Bulk create modules
 *     tags: [Modules]
 *     description: Create multiple modules in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - name
 *                 - subjectId
 *                 - classId
 *                 - teacherId
 *                 - schoolId
 *               properties:
 *                 name:
 *                   type: string
 *                   maxLength: 150
 *                   example: Physics Module
 *                 description:
 *                   type: string
 *                   nullable: true
 *                   example: Basic physics concepts
 *                 subjectId:
 *                   type: string
 *                   format: uuid
 *                 classId:
 *                   type: string
 *                   format: uuid
 *                 teacherId:
 *                   type: string
 *                   format: uuid
 *                 schoolId:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Modules created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - one or more module names already exist
 *       500:
 *         description: Internal server error
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.CREATE),
  ValidationUtil.validateRequest(moduleValidationSchemas.bulkCreateModules),
  asyncHandler(moduleController.bulkCreateModules)
);

/**
 * @swagger
 * /api/v1/modules/{id}:
 *   put:
 *     summary: Update a module
 *     tags: [Modules]
 *     description: Update an existing module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *               description:
 *                 type: string
 *                 nullable: true
 *               subjectId:
 *                 type: string
 *                 format: uuid
 *               classId:
 *                 type: string
 *                 format: uuid
 *               teacherId:
 *                 type: string
 *                 format: uuid
 *               assistantTeacherId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               classType:
 *                 type: string
 *                 nullable: true
 *               classroomId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               materials:
 *                 type: string
 *                 nullable: true
 *               studentGroupId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               termId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               totalStudents:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Module updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Module not found
 *       409:
 *         description: Conflict - module name already exists in this class
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(moduleValidationSchemas.updateModule),
  asyncHandler(moduleController.updateModule)
);

/**
 * @swagger
 * /api/v1/modules/{id}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Modules]
 *     description: Delete a module by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Module not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.DELETE),
  ValidationUtil.validateRequest(moduleValidationSchemas.deleteModule),
  asyncHandler(moduleController.deleteModule)
);

/**
 * @swagger
 * /api/v1/modules/bulk-delete:
 *   post:
 *     summary: Bulk delete modules
 *     tags: [Modules]
 *     description: Delete multiple modules based on criteria
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"]
 *               classId:
 *                 type: string
 *                 format: uuid
 *               subjectId:
 *                 type: string
 *                 format: uuid
 *               teacherId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               termId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Modules deleted successfully
 *       400:
 *         description: Bad request - validation error or no criteria provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/bulk-delete",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("module", PermissionAction.DELETE),
  ValidationUtil.validateRequest(moduleValidationSchemas.bulkDeleteModules),
  asyncHandler(moduleController.bulkDeleteModules)
);

export default router;
