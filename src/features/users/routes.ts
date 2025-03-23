import { Router } from "express";
import userController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import userValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import multer from "multer";
import { FileUploadUtil, FileType } from "@/common/utils/file/fileUploadUtil";
import { PermissionAction } from "../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Setup multer for file upload
const upload = multer({ dest: "temp/uploads/" });

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get a list of users
 *     tags: [Users]
 *     description: Retrieve a paginated list of users with filtering options
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users by name, email, or username
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, username, createdAt, lastLogin, isActive]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role name
 *       - in: query
 *         name: createdAfter
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created after this date
 *       - in: query
 *         name: createdBefore
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created before this date
 *     responses:
 *       200:
 *         description: A paginated list of users
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
  PermissionMiddleware.hasPermission("users", PermissionAction.READ),
  ValidationUtil.validateRequest(userValidationSchemas.getUserList),
  asyncHandler(userController.getUserList)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     description: Retrieve detailed information about a user by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.READ, {
    ownershipCheck: true,
  }),
  ValidationUtil.validateRequest(userValidationSchemas.getUserById),
  asyncHandler(userController.getUserById)
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Create a new user with specified details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               phoneNumber:
 *                 type: string
 *                 pattern: ^\\+[1-9]\\d{1,14}$
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer-not-to-say]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               countryCode:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 3
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - email or username already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.CREATE),
  ValidationUtil.validateRequest(userValidationSchemas.createUser),
  asyncHandler(userController.createUser)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     description: Update a user's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               phoneNumber:
 *                 type: string
 *                 pattern: ^\\+[1-9]\\d{1,14}$
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer-not-to-say]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               countryCode:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 3
 *               isActive:
 *                 type: boolean
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict - email or username already exists
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.UPDATE, {
    ownershipCheck: true,
  }),
  ValidationUtil.validateRequest(userValidationSchemas.updateUser),
  asyncHandler(userController.updateUser)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     description: Soft delete a user (marks as inactive)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.DELETE),
  ValidationUtil.validateRequest(userValidationSchemas.deleteUser),
  asyncHandler(userController.deleteUser)
);

/**
 * @swagger
 * /api/v1/users/{id}/password:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     description: Update a user's password (user can only change their own password unless they're an admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 description: Must match newPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request - validation error or passwords don't match
 *       401:
 *         description: Unauthorized or incorrect current password
 *       403:
 *         description: Forbidden - you can only change your own password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/password",
  AuthMiddleware.verifyToken,
  ValidationUtil.validateRequest(userValidationSchemas.updatePassword),
  asyncHandler(userController.updatePassword)
);

/**
 * @swagger
 * /api/v1/users/{id}/admin-password-reset:
 *   put:
 *     summary: Admin reset user password
 *     tags: [Users]
 *     description: Admin-only endpoint to reset a user's password without requiring the current password
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               sendEmail:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/admin-password-reset",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.MANAGE),
  ValidationUtil.validateRequest(userValidationSchemas.adminUpdatePassword),
  asyncHandler(userController.adminUpdatePassword)
);

/**
 * @swagger
 * /api/v1/users/{id}/roles:
 *   put:
 *     summary: Update user roles
 *     tags: [Users]
 *     description: Add, remove, or set user roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *               - operation
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *               operation:
 *                 type: string
 *                 enum: [add, remove, set]
 *     responses:
 *       200:
 *         description: User roles updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/roles",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.MANAGE),
  ValidationUtil.validateRequest(userValidationSchemas.updateUserRoles),
  asyncHandler(userController.updateUserRoles)
);

/**
 * @swagger
 * /api/v1/users/{id}/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     description: Upload and update user avatar image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPG, PNG, GIF, WebP, etc.)
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Bad request - no file uploaded or invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/avatar",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("users", PermissionAction.UPDATE, {
    ownershipCheck: true,
  }),
  ValidationUtil.validateRequest(userValidationSchemas.uploadAvatar),
  upload.single("avatar"),
  FileUploadUtil.uploadToS3Middleware("avatar", FileType.IMAGE, {
    directory: "users/avatars",
  }),
  asyncHandler(userController.uploadAvatar)
);

/**
 * @swagger
 * /api/v1/users/email-exists:
 *   get:
 *     summary: Check if email exists
 *     tags: [Users]
 *     description: Check if an email address is already registered
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to check
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - email parameter is required
 *       500:
 *         description: Internal server error
 */
router.get("/email-exists", asyncHandler(userController.checkEmail));

/**
 * @swagger
 * /api/v1/users/username-exists:
 *   get:
 *     summary: Check if username exists
 *     tags: [Users]
 *     description: Check if a username is already taken
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - username parameter is required
 *       500:
 *         description: Internal server error
 */
router.get("/username-exists", asyncHandler(userController.checkUsername));

export default router;
