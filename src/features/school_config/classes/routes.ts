import { Router } from "express";
import classController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import classValidationSchemas from "./validation";
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
 * /api/v1/classes:
 *   get:
 *     summary: Get a list of classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, capacity, studentCount, classType, createdAt, status]
 *         description: Field to sort by
 *       - $ref: '#/components/parameters/SortOrderParam'
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
 *         name: gradeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by grade ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by section ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *       - in: query
 *         name: classroomId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by classroom ID
 *       - in: query
 *         name: schoolYearId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by school year ID
 *       - in: query
 *         name: classType
 *         schema:
 *           type: string
 *         description: Filter by class type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived]
 *         description: Filter by status
 *       - in: query
 *         name: capacityFrom
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by minimum capacity
 *       - in: query
 *         name: capacityTo
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by maximum capacity
 *       - in: query
 *         name: studentCountFrom
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by minimum student count
 *       - in: query
 *         name: studentCountTo
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by maximum student count
 *     responses:
 *       200:
 *         description: A paginated list of classes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassList),
  asyncHandler(classController.getClassList)
);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   get:
 *     summary: Get a class by ID
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDetailResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassById),
  asyncHandler(classController.getClassById)
);

/**
 * @swagger
 * /api/v1/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassRequest'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDetailResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.CREATE),
  ValidationUtil.validateRequest(classValidationSchemas.createClass),
  asyncHandler(classController.createClass)
);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   put:
 *     summary: Update a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClassRequest'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDetailResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(classValidationSchemas.updateClass),
  asyncHandler(classController.updateClass)
);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.DELETE),
  ValidationUtil.validateRequest(classValidationSchemas.deleteClass),
  asyncHandler(classController.deleteClass)
);

/**
 * @swagger
 * /api/v1/classes/school/{schoolId}:
 *   get:
 *     summary: Get classes by school
 *     tags: [Classes]
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
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesBySchool),
  asyncHandler(classController.getClassesBySchool)
);

/**
 * @swagger
 * /api/v1/classes/teacher/{teacherId}:
 *   get:
 *     summary: Get classes by teacher
 *     tags: [Classes]
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
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/teacher/:teacherId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesByTeacher),
  asyncHandler(classController.getClassesByTeacher)
);

/**
 * @swagger
 * /api/v1/classes/grade/{gradeId}:
 *   get:
 *     summary: Get classes by grade
 *     tags: [Classes]
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
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/grade/:gradeId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesByGrade),
  asyncHandler(classController.getClassesByGrade)
);

/**
 * @swagger
 * /api/v1/classes/section/{sectionId}:
 *   get:
 *     summary: Get classes by section
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/section/:sectionId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesBySection),
  asyncHandler(classController.getClassesBySection)
);

/**
 * @swagger
 * /api/v1/classes/department/{departmentId}:
 *   get:
 *     summary: Get classes by department
 *     tags: [Classes]
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
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/department/:departmentId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesByDepartment),
  asyncHandler(classController.getClassesByDepartment)
);

/**
 * @swagger
 * /api/v1/classes/classroom/{classroomId}:
 *   get:
 *     summary: Get classes by classroom
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/classroom/:classroomId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesByClassroom),
  asyncHandler(classController.getClassesByClassroom)
);

/**
 * @swagger
 * /api/v1/classes/school-year/{schoolYearId}:
 *   get:
 *     summary: Get classes by school year
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolYearId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School Year ID
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/school-year/:schoolYearId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassesBySchoolYear),
  asyncHandler(classController.getClassesBySchoolYear)
);

/**
 * @swagger
 * /api/v1/classes/statistics:
 *   get:
 *     summary: Get class statistics
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Class statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassStatisticsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.READ),
  ValidationUtil.validateRequest(classValidationSchemas.getClassStatistics),
  asyncHandler(classController.getClassStatistics)
);

/**
 * @swagger
 * /api/v1/classes/bulk:
 *   post:
 *     summary: Create multiple classes at once
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCreateClassRequest'
 *     responses:
 *       201:
 *         description: Classes created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.CREATE),
  ValidationUtil.validateRequest(classValidationSchemas.createClassesBulk),
  asyncHandler(classController.createClassesBulk)
);

/**
 * @swagger
 * /api/v1/classes/bulk:
 *   delete:
 *     summary: Delete multiple classes at once
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDeleteRequest'
 *     responses:
 *       200:
 *         description: Classes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkDeleteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("class", PermissionAction.DELETE),
  ValidationUtil.validateRequest(classValidationSchemas.deleteClassesBulk),
  asyncHandler(classController.deleteClassesBulk)
);

export default router;
