import { Router } from "express";
import subjectController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import subjectValidationSchemas from "./validation";
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
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - level
 *         - schoolId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the subject
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           description: The name of the subject
 *           example: Physics
 *         sortOrder:
 *           type: integer
 *           nullable: true
 *           description: Order in which subjects should be displayed
 *           example: 1
 *         code:
 *           type: string
 *           nullable: true
 *           description: Subject code for identification purposes
 *           example: PHYS-101
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the subject
 *           example: An introductory course to mechanics and thermodynamics
 *         level:
 *           type: string
 *           description: The academic level of the subject
 *           example: Beginner
 *         isDefault:
 *           type: boolean
 *           description: Whether this is a default subject for the school
 *           example: true
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this subject belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         categoryId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: The ID of the category this subject belongs to
 *           example: 883f9600-h59e-81h7-e049-779988770333
 *         prerequisite:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: The ID of another subject that is a prerequisite for this subject
 *           example: 994g0700-i60f-91i8-f150-880099880444
 *         departmentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: The ID of the department this subject belongs to
 *           example: 661f9500-f39c-51f5-c827-557766550111
 *         credits:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: The number of credits this subject is worth
 *           example: 3.5
 *         compulsory:
 *           type: boolean
 *           description: Whether this subject is compulsory
 *           example: true
 *         syllabus:
 *           type: string
 *           nullable: true
 *           description: The syllabus for this subject
 *           example: "Week 1: Introduction to Physics, Week 2: Kinematics..."
 *
 *     SubjectDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Subject'
 *         - type: object
 *           properties:
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the subject was created
 *               example: 2023-01-01T12:00:00Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the subject was last updated
 *               example: 2023-01-10T15:30:00Z
 *             school:
 *               type: object
 *               description: The school this subject belongs to
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 772e0600-g48d-71g6-d938-668877660222
 *                 name:
 *                   type: string
 *                   example: St. Mary's High School
 *             category:
 *               type: object
 *               description: The category this subject belongs to
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 883f9600-h59e-81h7-e049-779988770333
 *                 name:
 *                   type: string
 *                   example: Sciences
 *             department:
 *               type: object
 *               description: The department this subject belongs to
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 661f9500-f39c-51f5-c827-557766550111
 *                 name:
 *                   type: string
 *                   example: Physics Department
 *             prerequisiteSubject:
 *               type: object
 *               description: The prerequisite subject
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 994g0700-i60f-91i8-f150-880099880444
 *                 name:
 *                   type: string
 *                   example: Introduction to Mathematics
 *
 *     SubjectStatistics:
 *       type: object
 *       properties:
 *         totalSubjects:
 *           type: integer
 *           description: Total number of subjects in the system
 *           example: 150
 *         subjectsPerSchool:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of subjects per school
 *           example: {"772e0600-g48d-71g6-d938-668877660222": 25, "883f9600-h59e-81h7-e049-779988770333": 30}
 *         subjectsPerCategory:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of subjects per category
 *           example: {"883f9600-h59e-81h7-e049-779988770333": 15, "994g0700-i60f-91i8-f150-880099880444": 20}
 *         subjectsPerDepartment:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of subjects per department
 *           example: {"661f9500-f39c-51f5-c827-557766550111": 12, "772g0600-g40g-62g6-e938-668877660222": 18}
 *         subjectsByLevel:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of subjects by level
 *           example: {"Beginner": 50, "Intermediate": 70, "Advanced": 30}
 *         compulsorySubjectsCount:
 *           type: integer
 *           description: Number of compulsory subjects
 *           example: 80
 *         averageCredits:
 *           type: number
 *           format: float
 *           description: Average number of credits across all subjects
 *           example: 3.2
 */

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management API
 */

/**
 * @swagger
 * /api/v1/subjects:
 *   get:
 *     summary: Get a list of subjects
 *     tags: [Subjects]
 *     description: Retrieve a paginated list of subjects with filtering options
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
 *         description: Number of subjects per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering subjects
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, sortOrder, code, level, credits, createdAt]
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
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by subject level
 *       - in: query
 *         name: compulsory
 *         schema:
 *           type: boolean
 *         description: Filter by compulsory status
 *       - in: query
 *         name: hasPrerequisite
 *         schema:
 *           type: boolean
 *         description: Filter subjects that have or don't have prerequisites
 *       - in: query
 *         name: isDefault
 *         schema:
 *           type: boolean
 *         description: Filter by default status
 *       - in: query
 *         name: minCredits
 *         schema:
 *           type: number
 *         description: Filter by minimum credits
 *       - in: query
 *         name: maxCredits
 *         schema:
 *           type: number
 *         description: Filter by maximum credits
 *     responses:
 *       200:
 *         description: A paginated list of subjects
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
 *                   example: "Subjects retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subjects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubjectDetail'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(subjectValidationSchemas.getSubjectList),
  asyncHandler(subjectController.getSubjectList)
);

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Subjects]
 *     description: Retrieve detailed information about a subject by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject details retrieved successfully
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
 *                   example: "Subject retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: Subject not found
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(subjectValidationSchemas.getSubjectById),
  asyncHandler(subjectController.getSubjectById)
);

/**
 * @swagger
 * /api/v1/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     description: Create a new subject record
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
 *               - level
 *               - schoolId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *                 example: Physics
 *               sortOrder:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               code:
 *                 type: string
 *                 maxLength: 30
 *                 nullable: true
 *                 example: PHYS-101
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: An introductory course to mechanics and thermodynamics
 *               level:
 *                 type: string
 *                 maxLength: 50
 *                 example: Beginner
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 883f9600-h59e-81h7-e049-779988770333
 *               prerequisite:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 994g0700-i60f-91i8-f150-880099880444
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 661f9500-f39c-51f5-c827-557766550111
 *               credits:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 example: 3.5
 *               compulsory:
 *                 type: boolean
 *                 example: true
 *               syllabus:
 *                 type: string
 *                 nullable: true
 *                 example: "Week 1: Introduction to Physics, Week 2: Kinematics..."
 *     responses:
 *       201:
 *         description: Subject created successfully
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
 *                   example: "Subject created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SubjectDetail'
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.CREATE),
  ValidationUtil.validateRequest(subjectValidationSchemas.createSubject),
  asyncHandler(subjectController.createSubject)
);

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Subjects]
 *     description: Update an existing subject's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subject ID
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
 *                 example: Advanced Physics
 *               sortOrder:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               code:
 *                 type: string
 *                 maxLength: 30
 *                 nullable: true
 *                 example: PHYS-201
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: An advanced course in physics covering electricity and magnetism
 *               level:
 *                 type: string
 *                 maxLength: 50
 *                 example: Intermediate
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 883f9600-h59e-81h7-e049-779988770333
 *               prerequisite:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 994g0700-i60f-91i8-f150-880099880444
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 661f9500-f39c-51f5-c827-557766550111
 *               credits:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 example: 4.0
 *               compulsory:
 *                 type: boolean
 *                 example: false
 *               syllabus:
 *                 type: string
 *                 nullable: true
 *                 example: "Week 1: Electrostatics, Week 2: Electric Fields..."
 *     responses:
 *       200:
 *         description: Subject updated successfully
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
 *                   example: "Subject updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: Subject not found
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(subjectValidationSchemas.updateSubject),
  asyncHandler(subjectController.updateSubject)
);

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subjects]
 *     description: Delete a subject record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
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
 *                   example: "Subject deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Subject not found
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.DELETE),
  ValidationUtil.validateRequest(subjectValidationSchemas.deleteSubject),
  asyncHandler(subjectController.deleteSubject)
);

/**
 * @swagger
 * /api/v1/subjects/school/{schoolId}:
 *   get:
 *     summary: Get subjects by school
 *     tags: [Subjects]
 *     description: Retrieve all subjects associated with a specific school
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
 *         description: School's subjects retrieved successfully
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
 *                   example: "School's subjects retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: School not found
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(subjectValidationSchemas.getSubjectsBySchool),
  asyncHandler(subjectController.getSubjectsBySchool)
);

/**
 * @swagger
 * /api/v1/subjects/category/{categoryId}:
 *   get:
 *     summary: Get subjects by category
 *     tags: [Subjects]
 *     description: Retrieve all subjects associated with a specific category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category's subjects retrieved successfully
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
 *                   example: "Category's subjects retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: Category not found
 */
router.get(
  "/category/:categoryId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(
    subjectValidationSchemas.getSubjectsByCategory
  ),
  asyncHandler(subjectController.getSubjectsByCategory)
);

/**
 * @swagger
 * /api/v1/subjects/department/{departmentId}:
 *   get:
 *     summary: Get subjects by department
 *     tags: [Subjects]
 *     description: Retrieve all subjects associated with a specific department
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
 *         description: Department's subjects retrieved successfully
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
 *                   example: "Department's subjects retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: Department not found
 */
router.get(
  "/department/:departmentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(
    subjectValidationSchemas.getSubjectsByDepartment
  ),
  asyncHandler(subjectController.getSubjectsByDepartment)
);

/**
 * @swagger
 * /api/v1/subjects/code/{code}:
 *   get:
 *     summary: Get subject by code
 *     tags: [Subjects]
 *     description: Retrieve a subject by its code, optionally filtered by school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject code
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional school ID to filter by
 *     responses:
 *       200:
 *         description: Subject retrieved successfully
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
 *                   example: "Subject retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SubjectDetail'
 *       404:
 *         description: Subject not found
 */
router.get(
  "/code/:code",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(subjectValidationSchemas.getSubjectByCode),
  asyncHandler(subjectController.getSubjectByCode)
);

/**
 * @swagger
 * /api/v1/subjects/statistics:
 *   get:
 *     summary: Get subject statistics
 *     tags: [Subjects]
 *     description: Retrieve statistics about subjects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subject statistics retrieved successfully
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
 *                   example: "Subject statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SubjectStatistics'
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.READ),
  ValidationUtil.validateRequest(subjectValidationSchemas.getSubjectStatistics),
  asyncHandler(subjectController.getSubjectStatistics)
);

/**
 * @swagger
 * /api/v1/subjects/bulk:
 *   post:
 *     summary: Create multiple subjects at once
 *     tags: [Subjects]
 *     description: Create multiple subject records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjects
 *             properties:
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - level
 *                     - schoolId
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 150
 *                       example: Physics
 *                     sortOrder:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     code:
 *                       type: string
 *                       maxLength: 30
 *                       nullable: true
 *                       example: PHYS-101
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: An introductory course to mechanics and thermodynamics
 *                     level:
 *                       type: string
 *                       maxLength: 50
 *                       example: Beginner
 *                     isDefault:
 *                       type: boolean
 *                       example: false
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       example: 883f9600-h59e-81h7-e049-779988770333
 *                     prerequisite:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       example: 994g0700-i60f-91i8-f150-880099880444
 *                     departmentId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       example: 661f9500-f39c-51f5-c827-557766550111
 *                     credits:
 *                       type: number
 *                       format: float
 *                       nullable: true
 *                       example: 3.5
 *                     compulsory:
 *                       type: boolean
 *                       example: true
 *                     syllabus:
 *                       type: string
 *                       nullable: true
 *                       example: "Week 1: Introduction to Physics, Week 2: Kinematics..."
 *     responses:
 *       201:
 *         description: Subjects created successfully
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
 *                   example: "Subjects created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectDetail'
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.CREATE),
  ValidationUtil.validateRequest(subjectValidationSchemas.createSubjectsBulk),
  asyncHandler(subjectController.createSubjectsBulk)
);

/**
 * @swagger
 * /api/v1/subjects/bulk:
 *   delete:
 *     summary: Delete multiple subjects at once
 *     tags: [Subjects]
 *     description: Delete multiple subject records in a single request
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
 *         description: Subjects deleted successfully
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
 *                   example: "Subjects deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     count:
 *                       type: integer
 *                       example: 2
 */
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("subject", PermissionAction.DELETE),
  ValidationUtil.validateRequest(subjectValidationSchemas.deleteSubjectsBulk),
  asyncHandler(subjectController.deleteSubjectsBulk)
);

export default router;
