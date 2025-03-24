import { Router } from "express";
import teacherController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import teacherValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: Teacher management API
 */

/**
 * @swagger
 * /api/v1/teachers:
 *   get:
 *     summary: Get a list of teachers
 *     tags: [Teachers]
 *     description: Retrieve a paginated list of teachers with filtering options
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
 *         description: Number of teachers per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering teachers by name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [hireDate, title, contractType, yearsOfExperience, teachingLoad, currentStatus, createdAt]
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
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *       - in: query
 *         name: activeStatus
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: currentStatus
 *         schema:
 *           type: string
 *         description: Filter by current status (e.g., Active, On Leave)
 *       - in: query
 *         name: contractType
 *         schema:
 *           type: string
 *         description: Filter by contract type
 *       - in: query
 *         name: minYearsOfExperience
 *         schema:
 *           type: integer
 *         description: Filter by minimum years of experience
 *       - in: query
 *         name: maxYearsOfExperience
 *         schema:
 *           type: integer
 *         description: Filter by maximum years of experience
 *       - in: query
 *         name: minTeachingLoad
 *         schema:
 *           type: number
 *         description: Filter by minimum teaching load
 *       - in: query
 *         name: maxTeachingLoad
 *         schema:
 *           type: number
 *         description: Filter by maximum teaching load
 *       - in: query
 *         name: hireDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by hire date from (YYYY-MM-DD)
 *       - in: query
 *         name: hireDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by hire date to (YYYY-MM-DD)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *     responses:
 *       200:
 *         description: A paginated list of teachers
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
 *                   example: Teachers retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     teachers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeacherDetail'
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
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(teacherValidationSchemas.getTeacherList),
  asyncHandler(teacherController.getTeacherList)
);

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     description: Retrieve detailed information about a teacher by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher details retrieved successfully
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
 *                   example: Teacher retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TeacherDetail'
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
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(teacherValidationSchemas.getTeacherById),
  asyncHandler(teacherController.getTeacherById)
);

/**
 * @swagger
 * /api/v1/teachers/user/{userId}:
 *   get:
 *     summary: Get a teacher by user ID
 *     tags: [Teachers]
 *     description: Retrieve detailed information about a teacher by their user ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Teacher details retrieved successfully
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
 *                   example: Teacher retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TeacherDetail'
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
  "/user/:userId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(teacherValidationSchemas.getTeacherByUserId),
  asyncHandler(teacherController.getTeacherByUserId)
);

/**
 * @swagger
 * /api/v1/teachers/employee/{employeeId}:
 *   get:
 *     summary: Get a teacher by employee ID
 *     tags: [Teachers]
 *     description: Retrieve detailed information about a teacher by their employee ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Teacher details retrieved successfully
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
 *                   example: Teacher retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TeacherDetail'
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
  "/employee/:employeeId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(
    teacherValidationSchemas.getTeacherByEmployeeId
  ),
  asyncHandler(teacherController.getTeacherByEmployeeId)
);

/**
 * @swagger
 * /api/v1/teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     description: Create a new teacher record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - schoolId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               qualificationId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *               employeeId:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               contractType:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               specialization:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *               yearsOfExperience:
 *                 type: integer
 *                 nullable: true
 *               teachingLoad:
 *                 type: number
 *                 nullable: true
 *               officeLocation:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *               officeHours:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *               bio:
 *                 type: string
 *                 nullable: true
 *               salary:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *               emergencyContact:
 *                 type: string
 *                 nullable: true
 *               lastPromotionDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *               previousInstitutions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               publications:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               currentStatus:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               primarySubjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Teacher created successfully
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
 *                   example: Teacher created successfully
 *                 data:
 *                   $ref: '#/components/schemas/TeacherDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - user is already a teacher or employee ID already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.CREATE),
  ValidationUtil.validateRequest(teacherValidationSchemas.createTeacher),
  asyncHandler(teacherController.createTeacher)
);

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   put:
 *     summary: Update a teacher
 *     tags: [Teachers]
 *     description: Update an existing teacher's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               qualificationId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *               employeeId:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               contractType:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               specialization:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *               yearsOfExperience:
 *                 type: integer
 *                 nullable: true
 *               teachingLoad:
 *                 type: number
 *                 nullable: true
 *               officeLocation:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *               officeHours:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *               bio:
 *                 type: string
 *                 nullable: true
 *               salary:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *               emergencyContact:
 *                 type: string
 *                 nullable: true
 *               lastPromotionDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *               previousInstitutions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               publications:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               currentStatus:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               primarySubjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Teacher updated successfully
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
 *                   example: Teacher updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/TeacherDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Teacher not found
 *       409:
 *         description: Conflict - employee ID already taken
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(teacherValidationSchemas.updateTeacher),
  asyncHandler(teacherController.updateTeacher)
);

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     description: Delete a teacher record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
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
 *                   example: Teacher deleted successfully
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
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.DELETE),
  ValidationUtil.validateRequest(teacherValidationSchemas.deleteTeacher),
  asyncHandler(teacherController.deleteTeacher)
);

/**
 * @swagger
 * /api/v1/teachers/school/{schoolId}:
 *   get:
 *     summary: Get teachers by school
 *     tags: [Teachers]
 *     description: Retrieve all teachers associated with a specific school
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
 *         description: School's teachers retrieved successfully
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
 *                   example: School's teachers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeacherDetail'
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
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(teacherValidationSchemas.getTeachersBySchool),
  asyncHandler(teacherController.getTeachersBySchool)
);

/**
 * @swagger
 * /api/v1/teachers/department/{departmentId}:
 *   get:
 *     summary: Get teachers by department
 *     tags: [Teachers]
 *     description: Retrieve all teachers associated with a specific department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department's teachers retrieved successfully
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
 *                   example: Department's teachers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeacherDetail'
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
  "/department/:departmentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(
    teacherValidationSchemas.getTeachersByDepartment
  ),
  asyncHandler(teacherController.getTeachersByDepartment)
);

/**
 * @swagger
 * /api/v1/teachers/statistics:
 *   get:
 *     summary: Get teacher statistics
 *     tags: [Teachers]
 *     description: Retrieve statistics about teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher statistics retrieved successfully
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
 *                   example: Teacher statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TeacherStatistics'
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
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(teacherValidationSchemas.getTeacherStatistics),
  asyncHandler(teacherController.getTeacherStatistics)
);

/**
 * @swagger
 * /api/v1/teachers/generate-employee-id:
 *   get:
 *     summary: Generate a employee ID
 *     tags: [Teachers]
 *     description: Generate a unique employee ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: Employee ID generated successfully
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
 *                   example: Employee ID generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                       example: GH-23-001
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
  "/generate-employee-id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("teacher", PermissionAction.READ),
  ValidationUtil.validateRequest(teacherValidationSchemas.generateEmployeeId),
  asyncHandler(teacherController.generateEmployeeId)
);

export default router;
