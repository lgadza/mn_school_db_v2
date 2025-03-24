import { Router } from "express";
import rentalRuleController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import rentalRuleValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "@/features/rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * tags:
 *   name: RentalRules
 *   description: Rental rule management API
 */

/**
 * @swagger
 * /api/v1/rental-rules:
 *   get:
 *     summary: Get rental rules list
 *     tags: [RentalRules]
 *     description: Retrieve a paginated list of rental rules with filtering options
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
 *         description: Number of rules per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering rules
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rentalPeriodDays, maxBooksPerStudent, createdAt]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by school ID
 *     responses:
 *       200:
 *         description: Rental rules list retrieved successfully
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
 *                   example: Rental rules retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedRentalRuleList'
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
  PermissionMiddleware.hasPermission("rental_rule", PermissionAction.READ),
  ValidationUtil.validateRequest(rentalRuleValidationSchemas.getRentalRuleList),
  asyncHandler(rentalRuleController.getRuleList)
);

/**
 * @swagger
 * /api/v1/rental-rules/{id}:
 *   get:
 *     summary: Get rental rule by ID
 *     tags: [RentalRules]
 *     description: Retrieve detailed information about a rental rule by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Rental Rule ID
 *     responses:
 *       200:
 *         description: Rental rule retrieved successfully
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
 *                   example: Rental rule retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/RentalRule'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Rental rule not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("rental_rule", PermissionAction.READ),
  ValidationUtil.validateRequest(rentalRuleValidationSchemas.getRentalRuleById),
  asyncHandler(rentalRuleController.getRuleById)
);

/**
 * @swagger
 * /api/v1/rental-rules/school/{schoolId}:
 *   get:
 *     summary: Get rental rules by school
 *     tags: [RentalRules]
 *     description: Retrieve rental rules for a specific school
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
 *         description: Number of rules per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering rules
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rentalPeriodDays, maxBooksPerStudent, createdAt]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: School rental rules retrieved successfully
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
 *                   example: School rental rules retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedRentalRuleList'
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
  PermissionMiddleware.hasPermission("rental_rule", PermissionAction.READ),
  ValidationUtil.validateRequest(
    rentalRuleValidationSchemas.getRentalRulesBySchool
  ),
  asyncHandler(rentalRuleController.getRulesBySchool)
);

/**
 * @swagger
 * /api/v1/rental-rules:
 *   post:
 *     summary: Create a new rental rule
 *     tags: [RentalRules]
 *     description: Create a new rental rule for book loans
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
 *               - rentalPeriodDays
 *               - maxBooksPerStudent
 *               - renewalAllowed
 *               - schoolId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Standard 2-Week Loan
 *               rentalPeriodDays:
 *                 type: integer
 *                 minimum: 1
 *                 example: 14
 *               maxBooksPerStudent:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               renewalAllowed:
 *                 type: boolean
 *                 example: true
 *               lateFeePerDay:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 0.5
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440001
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: Standard loan period for most books
 *               renewalLimit:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *                 example: 2
 *     responses:
 *       201:
 *         description: Rental rule created successfully
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
 *                   example: Rental rule created successfully
 *                 data:
 *                   $ref: '#/components/schemas/RentalRule'
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
  PermissionMiddleware.hasPermission("rental_rule", PermissionAction.CREATE),
  ValidationUtil.validateRequest(rentalRuleValidationSchemas.createRentalRule),
  asyncHandler(rentalRuleController.createRule)
);

/**
 * @swagger
 * /api/v1/rental-rules/{id}:
 *   put:
 *     summary: Update a rental rule
 *     tags: [RentalRules]
 *     description: Update an existing rental rule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Rental Rule ID
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
 *                 example: Extended 4-Week Loan
 *               rentalPeriodDays:
 *                 type: integer
 *                 minimum: 1
 *                 example: 28
 *               maxBooksPerStudent:
 *                 type: integer
 *                 minimum: 1
 *                 example: 8
 *               renewalAllowed:
 *                 type: boolean
 *                 example: true
 *               lateFeePerDay:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 0.25
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: Extended loan period for research projects
 *               renewalLimit:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       200:
 *         description: Rental rule updated successfully
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
 *                   example: Rental rule updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/RentalRule'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Rental rule not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("rental_rule", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(rentalRuleValidationSchemas.updateRentalRule),
  asyncHandler(rentalRuleController.updateRule)
);

/**
 * @swagger
 * /api/v1/rental-rules/{id}:
 *   delete:
 *     summary: Delete a rental rule
 *     tags: [RentalRules]
 *     description: Delete a rental rule from the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Rental Rule ID
 *     responses:
 *       200:
 *         description: Rental rule deleted successfully
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
 *                   example: Rental rule deleted successfully
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
 *         description: Rental rule not found
 *       409:
 *         description: Conflict - rental rule is used by active loans
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("rental_rule", PermissionAction.DELETE),
  ValidationUtil.validateRequest(rentalRuleValidationSchemas.deleteRentalRule),
  asyncHandler(rentalRuleController.deleteRule)
);

/**
 * @swagger
 * components:
 *   schemas:
 *     RentalRule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           example: Standard 2-Week Loan
 *         rentalPeriodDays:
 *           type: integer
 *           example: 14
 *         maxBooksPerStudent:
 *           type: integer
 *           example: 5
 *         renewalAllowed:
 *           type: boolean
 *           example: true
 *         lateFeePerDay:
 *           type: number
 *           nullable: true
 *           example: 0.5
 *         schoolId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440001
 *         description:
 *           type: string
 *           nullable: true
 *           example: Standard loan period for most books
 *         renewalLimit:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-15T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-15T12:00:00Z
 *
 *     PaginatedRentalRuleList:
 *       type: object
 *       properties:
 *         rules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RentalRule'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             totalItems:
 *               type: integer
 *               example: 15
 *             totalPages:
 *               type: integer
 *               example: 2
 *             hasNextPage:
 *               type: boolean
 *               example: true
 *             hasPrevPage:
 *               type: boolean
 *               example: false
 */

export default router;
