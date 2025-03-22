import { Router } from "express";
import RoleController from "../controllers/roles.controller";
import ValidationUtil from "@/common/validators/validationUtil";
import roleSchemas from "../schema/roles.schema";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";

const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Auth middleware for all routes
const auth = AuthMiddleware.verifyToken;

// Permission middleware checks
const canManageRoles = PermissionMiddleware.hasPermission("roles", "manage");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Role unique identifier
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         name: admin
 *         description: Administrator role with full system access
 *         createdAt: '2023-01-01T08:00:00.000Z'
 *         updatedAt: '2023-01-01T08:00:00.000Z'
 *
 *     CreateRole:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *       example:
 *         name: teacher
 *         description: School teacher role
 *
 *     UpdateRole:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *       example:
 *         description: Updated description for teacher role
 *
 *     PermissionIds:
 *       type: object
 *       required:
 *         - permissionIds
 *       properties:
 *         permissionIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of permission IDs
 *       example:
 *         permissionIds: ['d290f1ee-6c54-4b01-90e6-d701748f0851', '7c0b0d7a-8e3c-4b1a-b77f-7812e4c7c51d']
 */

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Roles retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 *                     count:
 *                       type: number
 *                       example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/", auth, canManageRoles, asyncHandler(RoleController.getAllRoles));

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Role retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
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
  "/:id",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.getRoleById),
  asyncHandler(RoleController.getRoleById)
);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRole'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Role created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad request - validation error or role already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.createRole),
  asyncHandler(RoleController.createRole)
);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRole'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Role updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad request - validation error or role name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.updateRole),
  asyncHandler(RoleController.updateRole)
);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Role deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - cannot delete system role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.deleteRole),
  asyncHandler(RoleController.deleteRole)
);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   get:
 *     summary: Get permissions for a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Role permissions retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
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
  "/:id/permissions",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.getRoleById),
  asyncHandler(RoleController.getRolePermissions)
);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   post:
 *     summary: Add permissions to a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionIds'
 *     responses:
 *       200:
 *         description: Permissions added to role successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Permissions added to role successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/permissions",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.addPermissions),
  asyncHandler(RoleController.addPermissionsToRole)
);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   delete:
 *     summary: Remove permissions from a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionIds'
 *     responses:
 *       200:
 *         description: Permissions removed from role successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Permissions removed from role successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id/permissions",
  auth,
  canManageRoles,
  ValidationUtil.validateRequest(roleSchemas.removePermissions),
  asyncHandler(RoleController.removePermissionsFromRole)
);

export default router;
