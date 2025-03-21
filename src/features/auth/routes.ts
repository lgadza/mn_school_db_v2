import { Router } from "express";
import AuthController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import authSchemas from "./schema";
import AuthMiddleware from "@/shared/middleware/auth";
import RateLimiter from "@/shared/middleware/rateLimiter";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";

const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

// Apply stricter rate limiting for auth routes
const authLimiter = RateLimiter.createAuthLimiter("/api/auth/login");

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Creates a new user account with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Unique username
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Strong password with at least 8 characters, including upper and lowercase letters, numbers and special characters
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User's last name
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number in E.164 format (e.g., +1234567890)
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer-not-to-say]
 *                 description: User's gender (optional)
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth in ISO format (optional)
 *               countryCode:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 3
 *                 description: User's country code (optional)
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: user@example.com
 *                         username:
 *                           type: string
 *                           example: johndoe
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         fullName:
 *                           type: string
 *                           example: John Doe
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                         refreshToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                         expiresIn:
 *                           type: number
 *                           example: 3600
 *       400:
 *         description: Bad request, validation error
 *       409:
 *         description: Conflict, email or username already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/register",
  ValidationUtil.validateRequest(authSchemas.register),
  asyncHandler(AuthController.register)
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login to user account
 *     tags: [Authentication]
 *     description: Authenticates a user and returns access and refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                           format: email
 *                         username:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *       400:
 *         description: Bad request, validation error
 *       401:
 *         description: Unauthorized, invalid credentials
 *       429:
 *         description: Too many requests, rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
  "/login",
  authLimiter,
  ValidationUtil.validateRequest(authSchemas.login),
  asyncHandler(AuthController.login)
);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh authentication tokens
 *     tags: [Authentication]
 *     description: Uses a valid refresh token to generate a new pair of access and refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token previously issued
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: number
 *       400:
 *         description: Bad request, validation error
 *       401:
 *         description: Unauthorized, invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/refresh-token",
  ValidationUtil.validateRequest(authSchemas.refreshToken),
  asyncHandler(AuthController.refreshToken)
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Authentication]
 *     description: Sends a password reset link to the user's email if the account exists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address associated with the account
 *     responses:
 *       200:
 *         description: If the email exists, a password reset link has been sent
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
 *                   example: If the email exists, a password reset link has been sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  "/forgot-password",
  ValidationUtil.validateRequest(authSchemas.resetPasswordRequest),
  asyncHandler(AuthController.requestPasswordReset)
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     description: Resets a user's password using a valid reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received via email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password has been reset successfully
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
 *                   example: Password has been reset successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request, validation error or invalid/expired token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/reset-password",
  ValidationUtil.validateRequest(authSchemas.resetPassword),
  asyncHandler(AuthController.resetPassword)
);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     description: Verifies a user's email address using a verification token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification token received via email
 *     responses:
 *       200:
 *         description: Email has been verified successfully
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
 *                   example: Email has been verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request, validation error or invalid token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/verify-email",
  ValidationUtil.validateRequest(authSchemas.verifyEmail),
  asyncHandler(AuthController.verifyEmail)
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     description: Returns the profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: User information retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       401:
 *         description: Unauthorized, authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/me",
  AuthMiddleware.verifyToken,
  asyncHandler(AuthController.getCurrentUser)
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Logs out the currently authenticated user by invalidating their refresh token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to invalidate (optional)
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: Logout successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized, authentication required
 *       500:
 *         description: Internal server error
 */
router.post(
  "/logout",
  AuthMiddleware.verifyToken,
  asyncHandler(AuthController.logout)
);

export default router;
