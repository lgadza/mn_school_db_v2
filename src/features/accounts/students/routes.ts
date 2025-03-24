import { Router } from "express";
import studentController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import studentValidationSchemas from "./validation";
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
 *   name: Students
 *   description: Student management API
 */

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Get a list of students
 *     tags: [Students]
 *     description: Retrieve a paginated list of students with filtering options
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
 *         description: Number of students per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering students by name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [enrollmentDate, studentNumber, createdAt]
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
 *         name: gradeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by grade ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class ID
 *       - in: query
 *         name: activeStatus
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: enrollmentDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by enrollment date from (YYYY-MM-DD)
 *       - in: query
 *         name: enrollmentDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by enrollment date to (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: A paginated list of students
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
 *                   example: Students retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudentDetail'
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
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentList),
  asyncHandler(studentController.getStudentList)
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     description: Retrieve detailed information about a student by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
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
 *                   example: Student retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/StudentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentById),
  asyncHandler(studentController.getStudentById)
);

/**
 * @swagger
 * /api/v1/students/user/{userId}:
 *   get:
 *     summary: Get a student by user ID
 *     tags: [Students]
 *     description: Retrieve detailed information about a student by their user ID
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
 *         description: Student details retrieved successfully
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
 *                   example: Student retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/StudentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:userId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentByUserId),
  asyncHandler(studentController.getStudentByUserId)
);

/**
 * @swagger
 * /api/v1/students/number/{studentNumber}:
 *   get:
 *     summary: Get a student by student number
 *     tags: [Students]
 *     description: Retrieve detailed information about a student by their student number
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Student number
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
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
 *                   example: Student retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/StudentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/number/:studentNumber",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(
    studentValidationSchemas.getStudentByStudentNumber
  ),
  asyncHandler(studentController.getStudentByStudentNumber)
);

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     description: Create a new student record
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
 *               - gradeId
 *               - enrollmentDate
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               gradeId:
 *                 type: string
 *                 format: uuid
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               enrollmentDate:
 *                 type: string
 *                 format: date
 *               studentNumber:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               guardianInfo:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               healthInfo:
 *                 type: object
 *                 nullable: true
 *               previousSchool:
 *                 type: object
 *                 nullable: true
 *               enrollmentNotes:
 *                 type: string
 *                 nullable: true
 *               academicRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               disciplinaryRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               specialNeeds:
 *                 type: object
 *                 nullable: true
 *               extracurricularActivities:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Student created successfully
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
 *                   example: Student created successfully
 *                 data:
 *                   $ref: '#/components/schemas/StudentDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - user is already a student or student number already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.CREATE),
  ValidationUtil.validateRequest(studentValidationSchemas.createStudent),
  asyncHandler(studentController.createStudent)
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     description: Update an existing student's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
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
 *               gradeId:
 *                 type: string
 *                 format: uuid
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               enrollmentDate:
 *                 type: string
 *                 format: date
 *               studentNumber:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               guardianInfo:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               healthInfo:
 *                 type: object
 *                 nullable: true
 *               previousSchool:
 *                 type: object
 *                 nullable: true
 *               enrollmentNotes:
 *                 type: string
 *                 nullable: true
 *               academicRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               disciplinaryRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               specialNeeds:
 *                 type: object
 *                 nullable: true
 *               extracurricularActivities:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                 nullable: true
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Student updated successfully
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
 *                   example: Student updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/StudentDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Student not found
 *       409:
 *         description: Conflict - student number already taken
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(studentValidationSchemas.updateStudent),
  asyncHandler(studentController.updateStudent)
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     description: Delete a student record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
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
 *                   example: Student deleted successfully
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
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.DELETE),
  ValidationUtil.validateRequest(studentValidationSchemas.deleteStudent),
  asyncHandler(studentController.deleteStudent)
);

/**
 * @swagger
 * /api/v1/students/school/{schoolId}:
 *   get:
 *     summary: Get students by school
 *     tags: [Students]
 *     description: Retrieve all students associated with a specific school
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
 *         description: School's students retrieved successfully
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
 *                   example: School's students retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentDetail'
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
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentsBySchool),
  asyncHandler(studentController.getStudentsBySchool)
);

/**
 * @swagger
 * /api/v1/students/grade/{gradeId}:
 *   get:
 *     summary: Get students by grade
 *     tags: [Students]
 *     description: Retrieve all students associated with a specific grade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade ID
 *     responses:
 *       200:
 *         description: Grade's students retrieved successfully
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
 *                   example: Grade's students retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentDetail'
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
  "/grade/:gradeId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentsByGrade),
  asyncHandler(studentController.getStudentsByGrade)
);

/**
 * @swagger
 * /api/v1/students/class/{classId}:
 *   get:
 *     summary: Get students by class
 *     tags: [Students]
 *     description: Retrieve all students associated with a specific class
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
 *         description: Class's students retrieved successfully
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
 *                   example: Class's students retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/class/:classId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentsByClass),
  asyncHandler(studentController.getStudentsByClass)
);

/**
 * @swagger
 * /api/v1/students/generate-student-number:
 *   get:
 *     summary: Generate a student number
 *     tags: [Students]
 *     description: Generate a unique student number
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
 *       - in: query
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade ID
 *     responses:
 *       200:
 *         description: Student number generated successfully
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
 *                   example: Student number generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentNumber:
 *                       type: string
 *                       example: GH-G1-23-001
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
  "/generate-student-number",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(
    studentValidationSchemas.generateStudentNumber
  ),
  asyncHandler(studentController.generateStudentNumber)
);

/**
 * @swagger
 * /api/v1/students/statistics:
 *   get:
 *     summary: Get student statistics
 *     tags: [Students]
 *     description: Retrieve statistics about students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student statistics retrieved successfully
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
 *                   example: Student statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/StudentStatistics'
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
  PermissionMiddleware.hasPermission("student", PermissionAction.READ),
  ValidationUtil.validateRequest(studentValidationSchemas.getStudentStatistics),
  asyncHandler(studentController.getStudentStatistics)
);

export default router;
