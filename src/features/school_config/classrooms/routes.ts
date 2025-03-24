import { Router } from "express";
import classroomController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import classroomValidationSchemas from "./validation";
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
 *     Classroom:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - roomType
 *         - maxStudents
 *         - blockId
 *         - schoolId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the classroom
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           description: The name of the classroom
 *           example: Room 101
 *         roomType:
 *           type: string
 *           description: The type of room
 *           example: standard
 *           enum: [standard, laboratory, computer_lab, library, auditorium, gymnasium, art_studio, music_room, staff_room, other]
 *         maxStudents:
 *           type: integer
 *           description: Maximum number of students that can fit in the classroom
 *           example: 30
 *         blockId:
 *           type: string
 *           format: uuid
 *           description: The ID of the block this classroom belongs to
 *           example: 661f9500-f39c-51f5-c827-557766550111
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this classroom belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         details:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the classroom
 *           example: Standard classroom with whiteboard and projector
 *         floor:
 *           type: integer
 *           nullable: true
 *           description: Floor number where the classroom is located
 *           example: 2
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *           description: Special features or equipment in the classroom
 *           example: ["projector", "smart_board", "air_conditioning"]
 *         status:
 *           type: string
 *           nullable: true
 *           description: Current status of the classroom
 *           example: active
 *           enum: [active, inactive, maintenance, renovation, closed]
 *
 *     ClassroomDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Classroom'
 *         - type: object
 *           properties:
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the classroom was created
 *               example: 2023-01-01T12:00:00Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the classroom was last updated
 *               example: 2023-01-10T15:30:00Z
 *             block:
 *               type: object
 *               description: Basic information about the block this classroom belongs to
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 661f9500-f39c-51f5-c827-557766550111
 *                 name:
 *                   type: string
 *                   example: Science Block
 *                 schoolId:
 *                   type: string
 *                   format: uuid
 *                   example: 772e0600-g48d-71g6-d938-668877660222
 *
 *     ClassroomStatistics:
 *       type: object
 *       properties:
 *         totalClassrooms:
 *           type: integer
 *           description: Total number of classrooms in the system
 *           example: 120
 *         classroomsPerSchool:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of classrooms per school
 *           example: {"772e0600-g48d-71g6-d938-668877660222": 75, "883f9600-h59e-81h7-e049-779988770333": 45}
 *         classroomsPerBlock:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of classrooms per block
 *           example: {"661f9500-f39c-51f5-c827-557766550111": 10, "772g0600-g48d-71g6-d938-668877660333": 12}
 *         totalCapacity:
 *           type: integer
 *           description: Total student capacity across all classrooms
 *           example: 3500
 *         averageCapacity:
 *           type: number
 *           format: float
 *           description: Average capacity per classroom
 *           example: 29.2
 *         classroomsByType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of classrooms by type
 *           example: {"standard": 80, "laboratory": 15, "computer_lab": 10, "library": 5}
 *         classroomsByStatus:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of classrooms by status
 *           example: {"active": 100, "maintenance": 10, "renovation": 5, "inactive": 5}
 *         featuresDistribution:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Distribution of features across classrooms
 *           example: {"projector": 90, "smart_board": 45, "air_conditioning": 70}
 */

/**
 * @swagger
 * tags:
 *   name: Classrooms
 *   description: Classroom management API
 */

/**
 * @swagger
 * /api/v1/classrooms:
 *   get:
 *     summary: Get a list of classrooms
 *     tags: [Classrooms]
 *     description: Retrieve a paginated list of classrooms with filtering options
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
 *         description: Number of classrooms per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering classrooms
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, roomType, maxStudents, floor, status, createdAt]
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
 *         name: blockId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by block ID
 *       - in: query
 *         name: roomType
 *         schema:
 *           type: string
 *           enum: [standard, laboratory, computer_lab, library, auditorium, gymnasium, art_studio, music_room, staff_room, other]
 *         description: Filter by room type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, renovation, closed]
 *         description: Filter by status
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *         description: Filter by minimum capacity
 *       - in: query
 *         name: maxCapacity
 *         schema:
 *           type: integer
 *         description: Filter by maximum capacity
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *         description: Filter by floor number
 *       - in: query
 *         name: feature
 *         schema:
 *           type: string
 *         description: Filter by classroom feature
 *     responses:
 *       200:
 *         description: A paginated list of classrooms
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
 *                   example: Classrooms retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     classrooms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ClassroomDetail'
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
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
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
  PermissionMiddleware.hasPermission("classroom", PermissionAction.READ),
  ValidationUtil.validateRequest(classroomValidationSchemas.getClassroomList),
  asyncHandler(classroomController.getClassroomList)
);

/**
 * @swagger
 * /api/v1/classrooms/{id}:
 *   get:
 *     summary: Get a classroom by ID
 *     tags: [Classrooms]
 *     description: Retrieve detailed information about a classroom by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom details retrieved successfully
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
 *                   example: Classroom retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ClassroomDetail'
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.READ),
  ValidationUtil.validateRequest(classroomValidationSchemas.getClassroomById),
  asyncHandler(classroomController.getClassroomById)
);

/**
 * @swagger
 * /api/v1/classrooms:
 *   post:
 *     summary: Create a new classroom
 *     tags: [Classrooms]
 *     description: Create a new classroom record
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
 *               - roomType
 *               - maxStudents
 *               - blockId
 *               - schoolId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Room 101
 *               roomType:
 *                 type: string
 *                 example: standard
 *                 enum: [standard, laboratory, computer_lab, library, auditorium, gymnasium, art_studio, music_room, staff_room, other]
 *               maxStudents:
 *                 type: integer
 *                 minimum: 1
 *                 example: 30
 *               blockId:
 *                 type: string
 *                 format: uuid
 *                 example: 661f9500-f39c-51f5-c827-557766550111
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: Standard classroom with whiteboard
 *               floor:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 example: ["projector", "smart_board", "air_conditioning"]
 *               status:
 *                 type: string
 *                 nullable: true
 *                 example: active
 *                 enum: [active, inactive, maintenance, renovation, closed]
 *     responses:
 *       201:
 *         description: Classroom created successfully
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
 *                   example: Classroom created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ClassroomDetail'
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.CREATE),
  ValidationUtil.validateRequest(classroomValidationSchemas.createClassroom),
  asyncHandler(classroomController.createClassroom)
);

/**
 * @swagger
 * /api/v1/classrooms/{id}:
 *   put:
 *     summary: Update a classroom
 *     tags: [Classrooms]
 *     description: Update an existing classroom's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Classroom ID
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
 *                 example: Updated Room 101
 *               roomType:
 *                 type: string
 *                 example: laboratory
 *                 enum: [standard, laboratory, computer_lab, library, auditorium, gymnasium, art_studio, music_room, staff_room, other]
 *               maxStudents:
 *                 type: integer
 *                 minimum: 1
 *                 example: 25
 *               blockId:
 *                 type: string
 *                 format: uuid
 *                 example: 661f9500-f39c-51f5-c827-557766550111
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: Updated details about the classroom
 *               floor:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 example: ["projector", "smart_board", "air_conditioning", "computers"]
 *               status:
 *                 type: string
 *                 nullable: true
 *                 example: maintenance
 *                 enum: [active, inactive, maintenance, renovation, closed]
 *     responses:
 *       200:
 *         description: Classroom updated successfully
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
 *                   example: Classroom updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ClassroomDetail'
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(classroomValidationSchemas.updateClassroom),
  asyncHandler(classroomController.updateClassroom)
);

/**
 * @swagger
 * /api/v1/classrooms/{id}:
 *   delete:
 *     summary: Delete a classroom
 *     tags: [Classrooms]
 *     description: Delete a classroom record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom deleted successfully
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
 *                   example: Classroom deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.DELETE),
  ValidationUtil.validateRequest(classroomValidationSchemas.deleteClassroom),
  asyncHandler(classroomController.deleteClassroom)
);

/**
 * @swagger
 * /api/v1/classrooms/school/{schoolId}:
 *   get:
 *     summary: Get classrooms by school
 *     tags: [Classrooms]
 *     description: Retrieve all classrooms associated with a specific school
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
 *         description: School's classrooms retrieved successfully
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
 *                   example: School's classrooms retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClassroomDetail'
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.READ),
  ValidationUtil.validateRequest(
    classroomValidationSchemas.getClassroomsBySchool
  ),
  asyncHandler(classroomController.getClassroomsBySchool)
);

/**
 * @swagger
 * /api/v1/classrooms/block/{blockId}:
 *   get:
 *     summary: Get classrooms by block
 *     tags: [Classrooms]
 *     description: Retrieve all classrooms associated with a specific block
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Block ID
 *     responses:
 *       200:
 *         description: Block's classrooms retrieved successfully
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
 *                   example: Block's classrooms retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClassroomDetail'
 */
router.get(
  "/block/:blockId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.READ),
  ValidationUtil.validateRequest(
    classroomValidationSchemas.getClassroomsByBlock
  ),
  asyncHandler(classroomController.getClassroomsByBlock)
);

/**
 * @swagger
 * /api/v1/classrooms/statistics:
 *   get:
 *     summary: Get classroom statistics
 *     tags: [Classrooms]
 *     description: Retrieve statistics about classrooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classroom statistics retrieved successfully
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
 *                   example: Classroom statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ClassroomStatistics'
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.READ),
  ValidationUtil.validateRequest(
    classroomValidationSchemas.getClassroomStatistics
  ),
  asyncHandler(classroomController.getClassroomStatistics)
);

/**
 * @swagger
 * /api/v1/classrooms/bulk:
 *   post:
 *     summary: Create multiple classrooms at once
 *     tags: [Classrooms]
 *     description: Create multiple classroom records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classrooms
 *             properties:
 *               classrooms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - roomType
 *                     - maxStudents
 *                     - blockId
 *                     - schoolId
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: Room 101
 *                     roomType:
 *                       type: string
 *                       example: standard
 *                       enum: [standard, laboratory, computer_lab, library, auditorium, gymnasium, art_studio, music_room, staff_room, other]
 *                     maxStudents:
 *                       type: integer
 *                       minimum: 1
 *                       example: 30
 *                     blockId:
 *                       type: string
 *                       format: uuid
 *                       example: 661f9500-f39c-51f5-c827-557766550111
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     details:
 *                       type: string
 *                       nullable: true
 *                       example: Standard classroom with whiteboard
 *                     floor:
 *                       type: integer
 *                       nullable: true
 *                       example: 2
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                       example: ["projector", "smart_board"]
 *                     status:
 *                       type: string
 *                       nullable: true
 *                       example: active
 *                       enum: [active, inactive, maintenance, renovation, closed]
 *     responses:
 *       201:
 *         description: Classrooms created successfully
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
 *                   example: Classrooms created successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClassroomDetail'
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("classroom", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    classroomValidationSchemas.createClassroomsBulk
  ),
  asyncHandler(classroomController.createClassroomsBulk)
);

/**
 * @swagger
 * /api/v1/classrooms/bulk:
 *   delete:
 *     summary: Delete multiple classrooms at once
 *     tags: [Classrooms]
 *     description: Delete multiple classroom records in a single request
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
 *         description: Classrooms deleted successfully
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
 *                   example: Classrooms deleted successfully
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
  PermissionMiddleware.hasPermission("classroom", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    classroomValidationSchemas.deleteClassroomsBulk
  ),
  asyncHandler(classroomController.deleteClassroomsBulk)
);

export default router;
