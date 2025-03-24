import { Router } from "express";
import blockController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import blockValidationSchemas from "./validation";
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
 *     Block:
 *       type: object
 *       required:
 *         - id
 *         - schoolId
 *         - name
 *         - numberOfClassrooms
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the block
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this block belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         name:
 *           type: string
 *           description: The name of the block or building
 *           example: Science Block
 *         numberOfClassrooms:
 *           type: integer
 *           description: The number of classrooms in this block
 *           example: 10
 *         details:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the block
 *           example: Contains science labs and lecture halls
 *         location:
 *           type: string
 *           nullable: true
 *           description: Location within the school campus
 *           example: North Campus
 *         yearBuilt:
 *           type: integer
 *           nullable: true
 *           description: Year the block was constructed
 *           example: 1995
 *         status:
 *           type: string
 *           nullable: true
 *           description: Current status of the block
 *           example: active
 *           enum: [active, inactive, maintenance, planned, demolished]
 *
 *     BlockDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Block'
 *         - type: object
 *           properties:
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the block was created
 *               example: 2023-01-01T12:00:00Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the block was last updated
 *               example: 2023-01-10T15:30:00Z
 *             school:
 *               type: object
 *               description: The school this block belongs to
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 772e0600-g48d-71g6-d938-668877660222
 *                 name:
 *                   type: string
 *                   example: St. Mary's High School
 *                 type:
 *                   type: string
 *                   example: High School
 *                 address:
 *                   type: string
 *                   example: 123 Education St
 *                 city:
 *                   type: string
 *                   example: Springfield
 *                 state:
 *                   type: string
 *                   example: IL
 *                 country:
 *                   type: string
 *                   example: USA
 *                 zipCode:
 *                   type: string
 *                   example: "62701"
 *
 *     BlockStatistics:
 *       type: object
 *       properties:
 *         totalBlocks:
 *           type: integer
 *           description: Total number of blocks in the system
 *           example: 45
 *         blocksPerSchool:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of blocks per school
 *           example: {"772e0600-g48d-71g6-d938-668877660222": 5, "883f9600-h59e-81h7-e049-779988770333": 3}
 *         totalClassrooms:
 *           type: integer
 *           description: Total number of classrooms across all blocks
 *           example: 350
 *         averageClassroomsPerBlock:
 *           type: number
 *           format: float
 *           description: Average number of classrooms per block
 *           example: 7.8
 *         blocksByStatus:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of blocks by status
 *           example: {"active": 35, "maintenance": 5, "planned": 5}
 *         oldestBlock:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *               example: 550e8400-e29b-41d4-a716-446655440000
 *             name:
 *               type: string
 *               example: Main Building
 *             yearBuilt:
 *               type: integer
 *               example: 1970
 *         newestBlock:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *               example: 661f9500-f39c-51f5-c827-557766550111
 *             name:
 *               type: string
 *               example: STEM Wing
 *             yearBuilt:
 *               type: integer
 *               example: 2022
 */

/**
 * @swagger
 * tags:
 *   name: Blocks
 *   description: Block management API
 */

/**
 * @swagger
 * /api/v1/blocks:
 *   get:
 *     summary: Get a list of blocks
 *     tags: [Blocks]
 *     description: Retrieve a paginated list of blocks with filtering options
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
 *         description: Number of blocks per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering blocks
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, numberOfClassrooms, yearBuilt, status, createdAt]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, planned, demolished]
 *         description: Filter by status
 *       - in: query
 *         name: yearBuiltMin
 *         schema:
 *           type: integer
 *         description: Filter by minimum year built
 *       - in: query
 *         name: yearBuiltMax
 *         schema:
 *           type: integer
 *         description: Filter by maximum year built
 *       - in: query
 *         name: minClassrooms
 *         schema:
 *           type: integer
 *         description: Filter by minimum number of classrooms
 *       - in: query
 *         name: maxClassrooms
 *         schema:
 *           type: integer
 *         description: Filter by maximum number of classrooms
 *     responses:
 *       200:
 *         description: A paginated list of blocks
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
 *                   example: Blocks retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     blocks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BlockDetail'
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
  PermissionMiddleware.hasPermission("block", PermissionAction.READ),
  ValidationUtil.validateRequest(blockValidationSchemas.getBlockList),
  asyncHandler(blockController.getBlockList)
);

/**
 * @swagger
 * /api/v1/blocks/{id}:
 *   get:
 *     summary: Get a block by ID
 *     tags: [Blocks]
 *     description: Retrieve detailed information about a block by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Block ID
 *     responses:
 *       200:
 *         description: Block details retrieved successfully
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
 *                   example: Block retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/BlockDetail'
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("block", PermissionAction.READ),
  ValidationUtil.validateRequest(blockValidationSchemas.getBlockById),
  asyncHandler(blockController.getBlockById)
);

/**
 * @swagger
 * /api/v1/blocks:
 *   post:
 *     summary: Create a new block
 *     tags: [Blocks]
 *     description: Create a new block record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolId
 *               - name
 *               - numberOfClassrooms
 *             properties:
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Science Block
 *               numberOfClassrooms:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: Contains science labs and lecture halls
 *               location:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: North Campus
 *               yearBuilt:
 *                 type: integer
 *                 nullable: true
 *                 example: 1995
 *               status:
 *                 type: string
 *                 nullable: true
 *                 example: active
 *                 enum: [active, inactive, maintenance, planned, demolished]
 *     responses:
 *       201:
 *         description: Block created successfully
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
 *                   example: Block created successfully
 *                 data:
 *                   $ref: '#/components/schemas/BlockDetail'
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("block", PermissionAction.CREATE),
  ValidationUtil.validateRequest(blockValidationSchemas.createBlock),
  asyncHandler(blockController.createBlock)
);

/**
 * @swagger
 * /api/v1/blocks/{id}:
 *   put:
 *     summary: Update a block
 *     tags: [Blocks]
 *     description: Update an existing block's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Block ID
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
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Updated Science Block
 *               numberOfClassrooms:
 *                 type: integer
 *                 minimum: 1
 *                 example: 12
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: Updated details about the block
 *               location:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: Northwest Campus
 *               yearBuilt:
 *                 type: integer
 *                 nullable: true
 *                 example: 1996
 *               status:
 *                 type: string
 *                 nullable: true
 *                 example: maintenance
 *                 enum: [active, inactive, maintenance, planned, demolished]
 *     responses:
 *       200:
 *         description: Block updated successfully
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
 *                   example: Block updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/BlockDetail'
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("block", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(blockValidationSchemas.updateBlock),
  asyncHandler(blockController.updateBlock)
);

/**
 * @swagger
 * /api/v1/blocks/{id}:
 *   delete:
 *     summary: Delete a block
 *     tags: [Blocks]
 *     description: Delete a block record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Block ID
 *     responses:
 *       200:
 *         description: Block deleted successfully
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
 *                   example: Block deleted successfully
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
  PermissionMiddleware.hasPermission("block", PermissionAction.DELETE),
  ValidationUtil.validateRequest(blockValidationSchemas.deleteBlock),
  asyncHandler(blockController.deleteBlock)
);

/**
 * @swagger
 * /api/v1/blocks/school/{schoolId}:
 *   get:
 *     summary: Get blocks by school
 *     tags: [Blocks]
 *     description: Retrieve all blocks associated with a specific school
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
 *         description: School's blocks retrieved successfully
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
 *                   example: School's blocks retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlockDetail'
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("block", PermissionAction.READ),
  ValidationUtil.validateRequest(blockValidationSchemas.getBlocksBySchool),
  asyncHandler(blockController.getBlocksBySchool)
);

/**
 * @swagger
 * /api/v1/blocks/statistics:
 *   get:
 *     summary: Get block statistics
 *     tags: [Blocks]
 *     description: Retrieve statistics about blocks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Block statistics retrieved successfully
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
 *                   example: Block statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/BlockStatistics'
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("block", PermissionAction.READ),
  ValidationUtil.validateRequest(blockValidationSchemas.getBlockStatistics),
  asyncHandler(blockController.getBlockStatistics)
);

/**
 * @swagger
 * /api/v1/blocks/bulk:
 *   post:
 *     summary: Create multiple blocks at once
 *     tags: [Blocks]
 *     description: Create multiple block records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blocks
 *             properties:
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - schoolId
 *                     - name
 *                     - numberOfClassrooms
 *                   properties:
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: Science Block
 *                     numberOfClassrooms:
 *                       type: integer
 *                       minimum: 1
 *                       example: 10
 *                     details:
 *                       type: string
 *                       nullable: true
 *                       example: Contains science labs
 *                     location:
 *                       type: string
 *                       maxLength: 255
 *                       nullable: true
 *                       example: North Campus
 *                     yearBuilt:
 *                       type: integer
 *                       nullable: true
 *                       example: 1995
 *                     status:
 *                       type: string
 *                       nullable: true
 *                       example: active
 *                       enum: [active, inactive, maintenance, planned, demolished]
 *     responses:
 *       201:
 *         description: Blocks created successfully
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
 *                   example: Blocks created successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlockDetail'
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("block", PermissionAction.CREATE),
  ValidationUtil.validateRequest(blockValidationSchemas.createBlocksBulk),
  asyncHandler(blockController.createBlocksBulk)
);

/**
 * @swagger
 * /api/v1/blocks/bulk:
 *   delete:
 *     summary: Delete multiple blocks at once
 *     tags: [Blocks]
 *     description: Delete multiple block records in a single request
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
 *         description: Blocks deleted successfully
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
 *                   example: Blocks deleted successfully
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
  PermissionMiddleware.hasPermission("block", PermissionAction.DELETE),
  ValidationUtil.validateRequest(blockValidationSchemas.deleteBlocksBulk),
  asyncHandler(blockController.deleteBlocksBulk)
);

export default router;
