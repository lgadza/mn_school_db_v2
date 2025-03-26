import { Router } from "express";
import prospectController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import prospectValidationSchemas from "./validation";
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
 *   name: Prospects
 *   description: Prospect management API
 */

/**
 * @swagger
 * /api/v1/prospects:
 *   get:
 *     summary: Get a list of prospects
 *     tags: [Prospects]
 *     description: Retrieve a paginated list of prospects with filtering options
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
 *         description: Number of prospects per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering prospects by name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [contactDate, interestLevel, createdAt]
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
 *         name: roleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by role ID
 *       - in: query
 *         name: interestLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by interest level
 *       - in: query
 *         name: activeStatus
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: contactDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by contact date from (YYYY-MM-DD)
 *       - in: query
 *         name: contactDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by contact date to (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: A paginated list of prospects
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
 *                   example: Prospects retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     prospects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProspectDetail'
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
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(prospectValidationSchemas.getProspectList),
  asyncHandler(prospectController.getProspectList)
);

/**
 * @swagger
 * /api/v1/prospects/{id}:
 *   get:
 *     summary: Get a prospect by ID
 *     tags: [Prospects]
 *     description: Retrieve detailed information about a prospect by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Prospect ID
 *     responses:
 *       200:
 *         description: Prospect details retrieved successfully
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
 *                   example: Prospect retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ProspectDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Prospect not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(prospectValidationSchemas.getProspectById),
  asyncHandler(prospectController.getProspectById)
);

/**
 * @swagger
 * /api/v1/prospects/user/{userId}:
 *   get:
 *     summary: Get a prospect by user ID
 *     tags: [Prospects]
 *     description: Retrieve detailed information about a prospect by their user ID
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
 *         description: Prospect details retrieved successfully
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
 *                   example: Prospect retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ProspectDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Prospect not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:userId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(prospectValidationSchemas.getProspectByUserId),
  asyncHandler(prospectController.getProspectByUserId)
);

/**
 * @swagger
 * /api/v1/prospects:
 *   post:
 *     summary: Create a new prospect
 *     tags: [Prospects]
 *     description: Create a new prospect record
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
 *               - roleId
 *               - addressId
 *               - contactDate
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               roleId:
 *                 type: string
 *                 format: uuid
 *               addressId:
 *                 type: string
 *                 format: uuid
 *               interestLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               contactDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *                 nullable: true
 *               activeStatus:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Prospect created successfully
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
 *                   example: Prospect created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ProspectDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - user is already a prospect
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.CREATE),
  ValidationUtil.validateRequest(prospectValidationSchemas.createProspect),
  asyncHandler(prospectController.createProspect)
);

/**
 * @swagger
 * /api/v1/prospects/{id}:
 *   put:
 *     summary: Update a prospect
 *     tags: [Prospects]
 *     description: Update an existing prospect's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Prospect ID
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
 *               roleId:
 *                 type: string
 *                 format: uuid
 *               addressId:
 *                 type: string
 *                 format: uuid
 *               interestLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *               contactDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *                 nullable: true
 *               activeStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Prospect updated successfully
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
 *                   example: Prospect updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ProspectDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Prospect not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(prospectValidationSchemas.updateProspect),
  asyncHandler(prospectController.updateProspect)
);

/**
 * @swagger
 * /api/v1/prospects/{id}:
 *   delete:
 *     summary: Delete a prospect
 *     tags: [Prospects]
 *     description: Delete a prospect record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Prospect ID
 *     responses:
 *       200:
 *         description: Prospect deleted successfully
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
 *                   example: Prospect deleted successfully
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
 *         description: Prospect not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.DELETE),
  ValidationUtil.validateRequest(prospectValidationSchemas.deleteProspect),
  asyncHandler(prospectController.deleteProspect)
);

/**
 * @swagger
 * /api/v1/prospects/school/{schoolId}:
 *   get:
 *     summary: Get prospects by school
 *     tags: [Prospects]
 *     description: Retrieve all prospects associated with a specific school
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
 *         description: School's prospects retrieved successfully
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
 *                   example: School's prospects retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProspectDetail'
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
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(
    prospectValidationSchemas.getProspectsBySchool
  ),
  asyncHandler(prospectController.getProspectsBySchool)
);

/**
 * @swagger
 * /api/v1/prospects/role/{roleId}:
 *   get:
 *     summary: Get prospects by role
 *     tags: [Prospects]
 *     description: Retrieve all prospects associated with a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role's prospects retrieved successfully
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
 *                   example: Role's prospects retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProspectDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/role/:roleId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(prospectValidationSchemas.getProspectsByRole),
  asyncHandler(prospectController.getProspectsByRole)
);

/**
 * @swagger
 * /api/v1/prospects/interest-level/{interestLevel}:
 *   get:
 *     summary: Get prospects by interest level
 *     tags: [Prospects]
 *     description: Retrieve all prospects with a specific interest level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interestLevel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Interest level
 *     responses:
 *       200:
 *         description: Prospects with specified interest level retrieved successfully
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
 *                   example: Prospects with interest level 'high' retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProspectDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/interest-level/:interestLevel",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(
    prospectValidationSchemas.getProspectsByInterestLevel
  ),
  asyncHandler(prospectController.getProspectsByInterestLevel)
);

/**
 * @swagger
 * /api/v1/prospects/statistics:
 *   get:
 *     summary: Get prospect statistics
 *     tags: [Prospects]
 *     description: Retrieve statistics about prospects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prospect statistics retrieved successfully
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
 *                   example: Prospect statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ProspectStatistics'
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
  PermissionMiddleware.hasPermission("prospect", PermissionAction.READ),
  ValidationUtil.validateRequest(
    prospectValidationSchemas.getProspectStatistics
  ),
  asyncHandler(prospectController.getProspectStatistics)
);

export default router;
