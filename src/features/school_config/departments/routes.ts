import { Router } from "express";
import departmentController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import departmentValidationSchemas from "./validation";
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
 *   name: Departments
 *   description: Department management API
 */

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get a list of departments
 *     tags: [Departments]
 *     description: Retrieve a paginated list of departments with filtering options
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
 *         description: Number of departments per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering departments
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, facultyCount, studentCount, budget, createdAt]
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
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by school ID
 *       - in: query
 *         name: headOfDepartmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by head of department ID
 *       - in: query
 *         name: isDefault
 *         schema:
 *           type: boolean
 *         description: Filter by default status
 *       - in: query
 *         name: minFacultyCount
 *         schema:
 *           type: integer
 *         description: Filter by minimum faculty count
 *       - in: query
 *         name: maxFacultyCount
 *         schema:
 *           type: integer
 *         description: Filter by maximum faculty count
 *       - in: query
 *         name: minStudentCount
 *         schema:
 *           type: integer
 *         description: Filter by minimum student count
 *       - in: query
 *         name: maxStudentCount
 *         schema:
 *           type: integer
 *         description: Filter by maximum student count
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *         description: Filter by minimum budget
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *         description: Filter by maximum budget
 *     responses:
 *       200:
 *         description: A paginated list of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Departments retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     departments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DepartmentDetail'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
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
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(departmentValidationSchemas.getDepartmentList),
  asyncHandler(departmentController.getDepartmentList)
);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Departments]
 *     description: Retrieve detailed information about a department by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(departmentValidationSchemas.getDepartmentById),
  asyncHandler(departmentController.getDepartmentById)
);

/**
 * @swagger
 * /api/v1/departments/code/{code}:
 *   get:
 *     summary: Get a department by its code
 *     tags: [Departments]
 *     description: Retrieve detailed information about a department by its code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Department code
 *     responses:
 *       200:
 *         description: Department details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/code/:code",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.getDepartmentByCode
  ),
  asyncHandler(departmentController.getDepartmentByCode)
);

/**
 * @swagger
 * /api/v1/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     description: Create a new department record
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
 *               - schoolId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *                 example: Computer Science
 *               code:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: CS-DEP-101
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Department of Computer Science and Technology
 *               headOfDepartmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 nullable: true
 *                 example: cs.dept@example.edu
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: +1-555-123-4567
 *               facultyCount:
 *                 type: integer
 *                 nullable: true
 *                 example: 25
 *               studentCount:
 *                 type: integer
 *                 nullable: true
 *                 example: 500
 *               location:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *                 example: Science Building, East Wing, 3rd Floor
 *               budget:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 example: 250000.00
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department created successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - department code already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.CREATE),
  ValidationUtil.validateRequest(departmentValidationSchemas.createDepartment),
  asyncHandler(departmentController.createDepartment)
);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   put:
 *     summary: Update a department
 *     tags: [Departments]
 *     description: Update an existing department's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *                 example: Advanced Computer Science
 *               code:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: ACS-DEP-102
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Updated department description
 *               headOfDepartmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 661e9500-f39c-51f5-c827-557766550111
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 nullable: true
 *                 example: acs.dept@example.edu
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: +1-555-987-6543
 *               facultyCount:
 *                 type: integer
 *                 nullable: true
 *                 example: 30
 *               studentCount:
 *                 type: integer
 *                 nullable: true
 *                 example: 600
 *               location:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *                 example: Technology Building, West Wing, 2nd Floor
 *               budget:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 example: 300000.00
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 883f9600-h59e-81h7-e049-779988770333
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 *       409:
 *         description: Conflict - department code already taken
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(departmentValidationSchemas.updateDepartment),
  asyncHandler(departmentController.updateDepartment)
);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags: [Departments]
 *     description: Delete a department record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.DELETE),
  ValidationUtil.validateRequest(departmentValidationSchemas.deleteDepartment),
  asyncHandler(departmentController.deleteDepartment)
);

/**
 * @swagger
 * /api/v1/departments/school/{schoolId}:
 *   get:
 *     summary: Get departments by school
 *     tags: [Departments]
 *     description: Retrieve all departments associated with a specific school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: School's departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School's departments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DepartmentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: School not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.getDepartmentsBySchool
  ),
  asyncHandler(departmentController.getDepartmentsBySchool)
);

/**
 * @swagger
 * /api/v1/departments/head/{headId}:
 *   get:
 *     summary: Get departments by head
 *     tags: [Departments]
 *     description: Retrieve all departments associated with a specific head of department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Head of Department ID
 *     responses:
 *       200:
 *         description: Head's departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Head's departments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DepartmentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/head/:headId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.getDepartmentsByHead
  ),
  asyncHandler(departmentController.getDepartmentsByHead)
);

/**
 * @swagger
 * /api/v1/departments/statistics:
 *   get:
 *     summary: Get department statistics
 *     tags: [Departments]
 *     description: Retrieve statistics about departments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentStatistics'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.getDepartmentStatistics
  ),
  asyncHandler(departmentController.getDepartmentStatistics)
);

/**
 * @swagger
 * /api/v1/departments/default/{schoolId}:
 *   get:
 *     summary: Get default department for a school
 *     tags: [Departments]
 *     description: Retrieve the default department for a specific school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: Default department retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Default department retrieved successfully
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/DepartmentDetail'
 *                     - type: null
 *                       description: No default department found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: School not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/default/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.getDefaultDepartment
  ),
  asyncHandler(departmentController.getDefaultDepartment)
);

/**
 * @swagger
 * /api/v1/departments/{id}/set-default:
 *   post:
 *     summary: Set a department as default for a school
 *     tags: [Departments]
 *     description: Set a department as the default department for a school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolId
 *             properties:
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *     responses:
 *       200:
 *         description: Department set as default successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department set as default successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentDetail'
 *       400:
 *         description: Bad request - department does not belong to school
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department or school not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/set-default",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.setDefaultDepartment
  ),
  asyncHandler(departmentController.setDefaultDepartment)
);

/**
 * @swagger
 * /api/v1/departments/generate-code:
 *   get:
 *     summary: Generate a department code
 *     tags: [Departments]
 *     description: Generate a unique department code based on department name and school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Department name
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: Department code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department code generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     departmentCode:
 *                       type: string
 *                       example: GH-CSC-123
 *       400:
 *         description: Bad request - missing required parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/generate-code",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.READ),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.generateDepartmentCode
  ),
  asyncHandler(departmentController.generateDepartmentCode)
);

/**
 * @swagger
 * /api/v1/departments/bulk:
 *   post:
 *     summary: Create multiple departments at once
 *     tags: [Departments]
 *     description: Create multiple department records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departments
 *             properties:
 *               departments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - schoolId
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 150
 *                       example: Computer Science
 *                     code:
 *                       type: string
 *                       maxLength: 20
 *                       nullable: true
 *                       example: CS-DEP-101
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: Department of Computer Science and Technology
 *                     headOfDepartmentId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     contactEmail:
 *                       type: string
 *                       format: email
 *                       maxLength: 100
 *                       nullable: true
 *                       example: cs.dept@example.edu
 *                     phoneNumber:
 *                       type: string
 *                       maxLength: 50
 *                       nullable: true
 *                       example: +1-555-123-4567
 *                     facultyCount:
 *                       type: integer
 *                       nullable: true
 *                       example: 25
 *                     studentCount:
 *                       type: integer
 *                       nullable: true
 *                       example: 500
 *                     location:
 *                       type: string
 *                       maxLength: 150
 *                       nullable: true
 *                       example: Science Building, East Wing, 3rd Floor
 *                     budget:
 *                       type: number
 *                       format: float
 *                       nullable: true
 *                       example: 250000.00
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     isDefault:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       201:
 *         description: Departments created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Departments created successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DepartmentDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - one or more department codes already exist
 *       500:
 *         description: Internal server error
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.createDepartmentsBulk
  ),
  asyncHandler(departmentController.createDepartmentsBulk)
);

/**
 * @swagger
 * /api/v1/departments/bulk:
 *   delete:
 *     summary: Delete multiple departments at once
 *     tags: [Departments]
 *     description: Delete multiple department records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "661f9500-f39c-51f5-c827-557766550111"]
 *     responses:
 *       200:
 *         description: Departments deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Departments deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     failedIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                       description: IDs of departments that could not be deleted (e.g., default departments)
 *       400:
 *         description: Bad request - validation error or trying to delete default departments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("department", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    departmentValidationSchemas.deleteDepartmentsBulk
  ),
  asyncHandler(departmentController.deleteDepartmentsBulk)
);

export default router;
