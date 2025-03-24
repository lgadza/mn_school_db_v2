import { Router } from "express";
import gradeController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import gradeValidationSchemas from "./validation";
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
 *   name: Grades
 *   description: Grade management API
 */

/**
 * @swagger
 * /api/v1/grades:
 *   get:
 *     summary: Get a list of grades
 *     tags: [Grades]
 *     description: Retrieve a paginated list of grades with filtering options
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
 *         description: Number of grades per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering grades
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, minAge, maxAge, applicationOpen, createdAt]
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
 *         name: teacherId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by teacher ID
 *       - in: query
 *         name: applicationOpen
 *         schema:
 *           type: boolean
 *         description: Filter by application status
 *       - in: query
 *         name: minAgeFrom
 *         schema:
 *           type: integer
 *         description: Filter by minimum age (lower bound)
 *       - in: query
 *         name: minAgeTo
 *         schema:
 *           type: integer
 *         description: Filter by minimum age (upper bound)
 *       - in: query
 *         name: maxAgeFrom
 *         schema:
 *           type: integer
 *         description: Filter by maximum age (lower bound)
 *       - in: query
 *         name: maxAgeTo
 *         schema:
 *           type: integer
 *         description: Filter by maximum age (upper bound)
 *     responses:
 *       200:
 *         description: A paginated list of grades
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
 *                   example: Grades retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     grades:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GradeDetail'
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
  PermissionMiddleware.hasPermission("grade", PermissionAction.READ),
  ValidationUtil.validateRequest(gradeValidationSchemas.getGradeList),
  asyncHandler(gradeController.getGradeList)
);

/**
 * @swagger
 * /api/v1/grades/{id}:
 *   get:
 *     summary: Get a grade by ID
 *     tags: [Grades]
 *     description: Retrieve detailed information about a grade by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade ID
 *     responses:
 *       200:
 *         description: Grade details retrieved successfully
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
 *                   example: Grade retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/GradeDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Grade not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.READ),
  ValidationUtil.validateRequest(gradeValidationSchemas.getGradeById),
  asyncHandler(gradeController.getGradeById)
);

/**
 * @swagger
 * /api/v1/grades:
 *   post:
 *     summary: Create a new grade
 *     tags: [Grades]
 *     description: Create a new grade record
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
 *                 maxLength: 100
 *                 example: Grade 1
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: First grade elementary education
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               applicationOpen:
 *                 type: boolean
 *                 example: true
 *               minAge:
 *                 type: integer
 *                 nullable: true
 *                 example: 6
 *               teacherId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               maxAge:
 *                 type: integer
 *                 nullable: true
 *                 example: 7
 *     responses:
 *       201:
 *         description: Grade created successfully
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
 *                   example: Grade created successfully
 *                 data:
 *                   $ref: '#/components/schemas/GradeDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.CREATE),
  ValidationUtil.validateRequest(gradeValidationSchemas.createGrade),
  asyncHandler(gradeController.createGrade)
);

/**
 * @swagger
 * /api/v1/grades/{id}:
 *   put:
 *     summary: Update a grade
 *     tags: [Grades]
 *     description: Update an existing grade's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade ID
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
 *                 maxLength: 100
 *                 example: Grade 1 Advanced
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: Updated first grade details
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 883f9600-h59e-81h7-e049-779988770333
 *               applicationOpen:
 *                 type: boolean
 *                 example: false
 *               minAge:
 *                 type: integer
 *                 nullable: true
 *                 example: 5
 *               teacherId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 661e9500-f39c-51f5-c827-557766550111
 *               maxAge:
 *                 type: integer
 *                 nullable: true
 *                 example: 8
 *     responses:
 *       200:
 *         description: Grade updated successfully
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
 *                   example: Grade updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/GradeDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Grade not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(gradeValidationSchemas.updateGrade),
  asyncHandler(gradeController.updateGrade)
);

/**
 * @swagger
 * /api/v1/grades/{id}:
 *   delete:
 *     summary: Delete a grade
 *     tags: [Grades]
 *     description: Delete a grade record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade ID
 *     responses:
 *       200:
 *         description: Grade deleted successfully
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
 *                   example: Grade deleted successfully
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
 *         description: Grade not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.DELETE),
  ValidationUtil.validateRequest(gradeValidationSchemas.deleteGrade),
  asyncHandler(gradeController.deleteGrade)
);

/**
 * @swagger
 * /api/v1/grades/school/{schoolId}:
 *   get:
 *     summary: Get grades by school
 *     tags: [Grades]
 *     description: Retrieve all grades associated with a specific school
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
 *         description: School's grades retrieved successfully
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
 *                   example: School's grades retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GradeDetail'
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
  PermissionMiddleware.hasPermission("grade", PermissionAction.READ),
  ValidationUtil.validateRequest(gradeValidationSchemas.getGradesBySchool),
  asyncHandler(gradeController.getGradesBySchool)
);

/**
 * @swagger
 * /api/v1/grades/teacher/{teacherId}:
 *   get:
 *     summary: Get grades by teacher
 *     tags: [Grades]
 *     description: Retrieve all grades associated with a specific teacher
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
 *         description: Teacher's grades retrieved successfully
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
 *                   example: Teacher's grades retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GradeDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/teacher/:teacherId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.READ),
  ValidationUtil.validateRequest(gradeValidationSchemas.getGradesByTeacher),
  asyncHandler(gradeController.getGradesByTeacher)
);

/**
 * @swagger
 * /api/v1/grades/statistics:
 *   get:
 *     summary: Get grade statistics
 *     tags: [Grades]
 *     description: Retrieve statistics about grades
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade statistics retrieved successfully
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
 *                   example: Grade statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/GradeStatistics'
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
  PermissionMiddleware.hasPermission("grade", PermissionAction.READ),
  ValidationUtil.validateRequest(gradeValidationSchemas.getGradeStatistics),
  asyncHandler(gradeController.getGradeStatistics)
);

/**
 * @swagger
 * /api/v1/grades/bulk:
 *   post:
 *     summary: Create multiple grades at once
 *     tags: [Grades]
 *     description: Create multiple grade records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grades
 *             properties:
 *               grades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - schoolId
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: Grade 1
 *                     details:
 *                       type: string
 *                       nullable: true
 *                       example: First grade elementary education
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     applicationOpen:
 *                       type: boolean
 *                       example: true
 *                     minAge:
 *                       type: integer
 *                       nullable: true
 *                       example: 6
 *                     teacherId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     maxAge:
 *                       type: integer
 *                       nullable: true
 *                       example: 7
 *     responses:
 *       201:
 *         description: Grades created successfully
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
 *                   example: Grades created successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GradeDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.CREATE),
  ValidationUtil.validateRequest(gradeValidationSchemas.createGradesBulk),
  asyncHandler(gradeController.createGradesBulk)
);

/**
 * @swagger
 * /api/v1/grades/bulk:
 *   delete:
 *     summary: Delete multiple grades at once
 *     tags: [Grades]
 *     description: Delete multiple grade records in a single request
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
 *         description: Grades deleted successfully
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
 *                   example: Grades deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     count:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: None of the specified grades found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("grade", PermissionAction.DELETE),
  ValidationUtil.validateRequest(gradeValidationSchemas.deleteGradesBulk),
  asyncHandler(gradeController.deleteGradesBulk)
);

export default router;
