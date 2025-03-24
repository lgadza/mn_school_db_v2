import { Router } from "express";
import bookLoanController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import bookLoanValidationSchemas from "./validation";
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
 *   name: BookLoans
 *   description: Book loan management API
 */

/**
 * @swagger
 * /api/v1/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [BookLoans]
 *     description: Retrieve a paginated list of book loans with filtering options
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
 *         description: Number of loans per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering loans (searches book title, user name)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by loan status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, rentalDate, returnDate, createdAt]
 *           default: rentalDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by book ID
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by school ID
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by rental date (from)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by rental date (to)
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filter to show only overdue loans
 *     responses:
 *       200:
 *         description: A paginated list of loans
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
 *                   example: Loans retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedLoanList'
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
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.READ),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.getAllLoans),
  asyncHandler(bookLoanController.getAllLoans)
);

/**
 * @swagger
 * /api/v1/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [BookLoans]
 *     description: Retrieve detailed information about a loan by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan retrieved successfully
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
 *                   example: Loan retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/BookLoan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.READ),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.getLoanById),
  asyncHandler(bookLoanController.getLoanById)
);

/**
 * @swagger
 * /api/v1/loans/user/{userId}/active:
 *   get:
 *     summary: Get user's active loans
 *     tags: [BookLoans]
 *     description: Retrieve all active loans for a specific user
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
 *         description: Number of loans per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, rentalDate, createdAt]
 *           default: dueDate
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
 *         description: User's active loans retrieved successfully
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
 *                   example: User's active loans retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedLoanList'
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
  "/user/:userId/active",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.READ),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.getUserActiveLoans),
  asyncHandler(bookLoanController.getUserActiveLoans)
);

/**
 * @swagger
 * /api/v1/loans/user/{userId}/history:
 *   get:
 *     summary: Get user's loan history
 *     tags: [BookLoans]
 *     description: Retrieve the loan history for a specific user
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
 *         description: Number of loans per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by loan status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, rentalDate, returnDate, createdAt]
 *           default: rentalDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by rental date (from)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by rental date (to)
 *     responses:
 *       200:
 *         description: User's loan history retrieved successfully
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
 *                   example: User's loan history retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedLoanList'
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
  "/user/:userId/history",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.READ),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.getUserLoanHistory),
  asyncHandler(bookLoanController.getUserLoanHistory)
);

/**
 * @swagger
 * /api/v1/loans/school/{schoolId}:
 *   get:
 *     summary: Get school loans
 *     tags: [BookLoans]
 *     description: Retrieve all loans for a specific school
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
 *         description: Number of loans per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering loans
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by loan status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, rentalDate, returnDate, createdAt]
 *           default: rentalDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by rental date (from)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by rental date (to)
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filter to show only overdue loans
 *     responses:
 *       200:
 *         description: School loans retrieved successfully
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
 *                   example: School loans retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedLoanList'
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
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.READ),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.getSchoolLoans),
  asyncHandler(bookLoanController.getSchoolLoans)
);

/**
 * @swagger
 * /api/v1/loans/statistics:
 *   get:
 *     summary: Get loan statistics
 *     tags: [BookLoans]
 *     description: Retrieve statistics about book loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID to filter statistics by
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics period
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics period
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Limit for top borrowers and popular books
 *     responses:
 *       200:
 *         description: Loan statistics retrieved successfully
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
 *                   example: Loan statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/BookLoanStats'
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
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.READ),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.getLoanStatistics),
  asyncHandler(bookLoanController.getLoanStatistics)
);

/**
 * @swagger
 * /api/v1/loans/checkout:
 *   post:
 *     summary: Checkout a book
 *     tags: [BookLoans]
 *     description: Create a new loan by checking out a book to a user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - userId
 *             properties:
 *               bookId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for the loan (optional, defaults to rental rule period)
 *                 example: 2023-04-15T00:00:00Z
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Checked out for school project
 *               rentalRuleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the rental rule to apply to this loan
 *                 example: 773c8400-a44d-61e6-c827-995544330000
 *     responses:
 *       201:
 *         description: Book checked out successfully
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
 *                   example: Book checked out successfully
 *                 data:
 *                   $ref: '#/components/schemas/BookLoan'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Book or user not found
 *       409:
 *         description: Conflict - book is not available or user has reached loan limit
 *       500:
 *         description: Internal server error
 */
router.post(
  "/checkout",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.CREATE),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.checkoutBook),
  asyncHandler(bookLoanController.checkoutBook)
);

/**
 * @swagger
 * /api/v1/loans/{id}/checkin:
 *   post:
 *     summary: Check in a book
 *     tags: [BookLoans]
 *     description: Return a book that was checked out, marking the loan as returned
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Returned in good condition
 *               condition:
 *                 type: string
 *                 enum: [good, damaged, lost]
 *                 default: good
 *                 example: good
 *               applyLateFee:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       200:
 *         description: Book checked in successfully
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
 *                   example: Book checked in successfully
 *                 data:
 *                   $ref: '#/components/schemas/BookLoan'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Loan not found
 *       409:
 *         description: Conflict - loan is not active
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/checkin",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.checkinBook),
  asyncHandler(bookLoanController.checkinBook)
);

/**
 * @swagger
 * /api/v1/loans/{id}/renew:
 *   post:
 *     summary: Renew a book loan
 *     tags: [BookLoans]
 *     description: Extend the due date for a book loan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newDueDate:
 *                 type: string
 *                 format: date-time
 *                 description: New due date (if not provided, will be extended according to rental rules)
 *                 example: 2023-05-15T00:00:00Z
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Extended due to student request
 *     responses:
 *       200:
 *         description: Book loan renewed successfully
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
 *                   example: Book loan renewed successfully
 *                 data:
 *                   $ref: '#/components/schemas/BookLoan'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Loan not found
 *       409:
 *         description: Conflict - loan is not active or renewal not allowed
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/renew",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book_loan", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(bookLoanValidationSchemas.renewBookLoan),
  asyncHandler(bookLoanController.renewBookLoan)
);

/**
 * @swagger
 * components:
 *   schemas:
 *     BookLoan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         bookId:
 *           type: string
 *           format: uuid
 *           example: 662a8400-f33c-51e5-b716-775544330000
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 773c8400-a44d-61e6-c827-995544330000
 *         rentalDate:
 *           type: string
 *           format: date-time
 *           example: 2023-03-15T10:30:00Z
 *         checkoutDate:
 *           type: string
 *           format: date-time
 *           example: 2023-03-15T10:30:00Z
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: 2023-04-15T10:30:00Z
 *         returnDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         status:
 *           type: string
 *           enum: [active, returned, overdue]
 *           example: active
 *         notes:
 *           type: string
 *           nullable: true
 *           example: Checked out for school project
 *         lateFee:
 *           type: number
 *           nullable: true
 *           example: null
 *         bookTitle:
 *           type: string
 *           example: To Kill a Mockingbird
 *         userName:
 *           type: string
 *           example: John Doe
 *         rentalRuleId:
 *           type: string
 *           format: uuid
 *           example: 884d8400-b55e-71f7-d938-115544330000
 *         rentalRuleName:
 *           type: string
 *           example: Standard 2-Week Loan
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-03-15T10:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-03-15T10:30:00Z
 *
 *     PaginatedLoanList:
 *       type: object
 *       properties:
 *         loans:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BookLoan'
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
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 5
 *             hasNextPage:
 *               type: boolean
 *               example: true
 *             hasPrevPage:
 *               type: boolean
 *               example: false
 *
 *     BookLoanStats:
 *       type: object
 *       properties:
 *         totalLoans:
 *           type: integer
 *           example: 250
 *         activeLoans:
 *           type: integer
 *           example: 125
 *         overdueLoans:
 *           type: integer
 *           example: 15
 *         returnedLoans:
 *           type: integer
 *           example: 110
 *         topBorrowers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: 773c8400-a44d-61e6-c827-995544330000
 *               userName:
 *                 type: string
 *                 example: John Doe
 *               loanCount:
 *                 type: integer
 *                 example: 12
 *         mostPopularBooks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               bookTitle:
 *                 type: string
 *                 example: To Kill a Mockingbird
 *               loanCount:
 *                 type: integer
 *                 example: 25
 */

export default router;
