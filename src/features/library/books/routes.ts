import { Router } from "express";
import bookController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import bookValidationSchemas from "./validation";
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
 *   name: Books
 *   description: Book management API
 */

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Get a list of books
 *     tags: [Books]
 *     description: Retrieve a paginated list of books with filtering options
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
 *         description: Number of books per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering books (searches title, author, ISBN)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, author, publishYear, genre, createdAt]
 *           default: title
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: publishYear
 *         schema:
 *           type: string
 *         description: Filter by publication year
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
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
 *           enum: [active, archived, lost, damaged]
 *         description: Filter by book status
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language
 *     responses:
 *       200:
 *         description: A paginated list of books
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
 *                   example: Books retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           title:
 *                             type: string
 *                             example: To Kill a Mockingbird
 *                           genre:
 *                             type: string
 *                             example: Fiction
 *                           available:
 *                             type: boolean
 *                             example: true
 *                           publishYear:
 *                             type: string
 *                             example: "1960"
 *                           author:
 *                             type: string
 *                             example: Harper Lee
 *                           coverUrl:
 *                             type: string
 *                             example: https://example.com/covers/to-kill-a-mockingbird.jpg
 *                           description:
 *                             type: string
 *                             example: A story about racial inequality and moral growth
 *                           copiesAvailable:
 *                             type: integer
 *                             example: 5
 *                           copiesTotal:
 *                             type: integer
 *                             example: 8
 *                           isbn:
 *                             type: string
 *                             example: 9780061120084
 *                           schoolId:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440001
 *                           publisher:
 *                             type: string
 *                             example: J. B. Lippincott & Co.
 *                           language:
 *                             type: string
 *                             example: English
 *                           pageCount:
 *                             type: integer
 *                             example: 281
 *                           deweyDecimal:
 *                             type: string
 *                             example: 813.54
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["classic", "fiction", "race"]
 *                           status:
 *                             type: string
 *                             enum: [active, archived, lost, damaged]
 *                             example: active
 *                           availabilityStatus:
 *                             type: string
 *                             enum: [available, checked_out, on_hold, processing]
 *                             example: available
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-01-15T12:00:00Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-01-15T12:00:00Z
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
  PermissionMiddleware.hasPermission("book", PermissionAction.READ),
  ValidationUtil.validateRequest(bookValidationSchemas.getBookList),
  asyncHandler(bookController.getBookList)
);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     description: Retrieve detailed information about a book by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details retrieved successfully
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
 *                   example: Book retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     title:
 *                       type: string
 *                       example: To Kill a Mockingbird
 *                     genre:
 *                       type: string
 *                       example: Fiction
 *                     available:
 *                       type: boolean
 *                       example: true
 *                     publishYear:
 *                       type: string
 *                       example: "1960"
 *                     author:
 *                       type: string
 *                       example: Harper Lee
 *                     coverUrl:
 *                       type: string
 *                       example: https://example.com/covers/to-kill-a-mockingbird.jpg
 *                     description:
 *                       type: string
 *                       example: A story about racial inequality and moral growth
 *                     copiesAvailable:
 *                       type: integer
 *                       example: 5
 *                     copiesTotal:
 *                       type: integer
 *                       example: 8
 *                     isbn:
 *                       type: string
 *                       example: 9780061120084
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440001
 *                     publisher:
 *                       type: string
 *                       example: J. B. Lippincott & Co.
 *                     language:
 *                       type: string
 *                       example: English
 *                     pageCount:
 *                       type: integer
 *                       example: 281
 *                     deweyDecimal:
 *                       type: string
 *                       example: 813.54
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["classic", "fiction", "race"]
 *                     status:
 *                       type: string
 *                       enum: [active, archived, lost, damaged]
 *                       example: active
 *                     availabilityStatus:
 *                       type: string
 *                       enum: [available, checked_out, on_hold, processing]
 *                       example: available
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-15T12:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-15T12:00:00Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.READ),
  ValidationUtil.validateRequest(bookValidationSchemas.getBookById),
  asyncHandler(bookController.getBookById)
);

/**
 * @swagger
 * /api/v1/books/isbn/{isbn}/school/{schoolId}:
 *   get:
 *     summary: Get a book by ISBN and school
 *     tags: [Books]
 *     description: Retrieve a book by its ISBN and school ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ISBN
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
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
 *                   example: Book retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/isbn/:isbn/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.READ),
  ValidationUtil.validateRequest(bookValidationSchemas.getBookByISBN),
  asyncHandler(bookController.getBookByISBN)
);

/**
 * @swagger
 * /api/v1/books/school/{schoolId}:
 *   get:
 *     summary: Get books by school
 *     tags: [Books]
 *     description: Retrieve books that belong to a specific school
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
 *         description: Number of books per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering books
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, author, publishYear, genre, createdAt]
 *           default: title
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: publishYear
 *         schema:
 *           type: string
 *         description: Filter by publication year
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, lost, damaged]
 *         description: Filter by book status
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language
 *     responses:
 *       200:
 *         description: School books retrieved successfully
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
 *                   example: School books retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedBookList'
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
  PermissionMiddleware.hasPermission("book", PermissionAction.READ),
  ValidationUtil.validateRequest(bookValidationSchemas.getBooksBySchool),
  asyncHandler(bookController.getBooksBySchool)
);

/**
 * @swagger
 * /api/v1/books/genre/{genre}/school/{schoolId}:
 *   get:
 *     summary: Get books by genre and school
 *     tags: [Books]
 *     description: Retrieve books of a specific genre that belong to a specific school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Book genre
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
 *         description: Number of books per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering books
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
 *     responses:
 *       200:
 *         description: Genre books retrieved successfully
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
 *                   example: Genre books retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedBookList'
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
  "/genre/:genre/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.READ),
  ValidationUtil.validateRequest(bookValidationSchemas.getBooksByGenre),
  asyncHandler(bookController.getBooksByGenre)
);

/**
 * @swagger
 * /api/v1/books/search/{query}/school/{schoolId}:
 *   get:
 *     summary: Search books by school
 *     tags: [Books]
 *     description: Search for books in a specific school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *         description: Number of books per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
 *     responses:
 *       200:
 *         description: Books search results retrieved successfully
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
 *                   example: Books search results retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedBookList'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/search/:query/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.READ),
  ValidationUtil.validateRequest(bookValidationSchemas.searchBooks),
  asyncHandler(bookController.searchBooks)
);

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     description: Create a new book in the library
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - genre
 *               - schoolId
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: To Kill a Mockingbird
 *               genre:
 *                 type: string
 *                 maxLength: 100
 *                 example: Fiction
 *               available:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               publishYear:
 *                 type: string
 *                 pattern: ^\d{4}$
 *                 example: "1960"
 *               author:
 *                 type: string
 *                 maxLength: 255
 *                 example: Harper Lee
 *               coverUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: https://example.com/covers/to-kill-a-mockingbird.jpg
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: A story about racial inequality and moral growth
 *               copiesAvailable:
 *                 type: integer
 *                 minimum: 0
 *                 default: 1
 *                 example: 5
 *               copiesTotal:
 *                 type: integer
 *                 minimum: 0
 *                 default: 1
 *                 example: 8
 *               isbn:
 *                 type: string
 *                 pattern: ^(\d{10}|\d{13})$
 *                 nullable: true
 *                 example: 9780061120084
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440001
 *               publisher:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: J. B. Lippincott & Co.
 *               language:
 *                 type: string
 *                 maxLength: 50
 *                 default: "English"
 *                 example: English
 *               pageCount:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 example: 281
 *               deweyDecimal:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: 813.54
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 example: ["classic", "fiction", "race"]
 *               status:
 *                 type: string
 *                 enum: [active, archived, lost, damaged]
 *                 default: active
 *                 example: active
 *     responses:
 *       201:
 *         description: Book created successfully
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
 *                   example: Book created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - ISBN already exists for this school
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.CREATE),
  ValidationUtil.validateRequest(bookValidationSchemas.createBook),
  asyncHandler(bookController.createBook)
);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     description: Update an existing book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: To Kill a Mockingbird (Revised Edition)
 *               genre:
 *                 type: string
 *                 maxLength: 100
 *                 example: American Literature
 *               available:
 *                 type: boolean
 *                 example: true
 *               publishYear:
 *                 type: string
 *                 pattern: ^\d{4}$
 *                 example: "1960"
 *               author:
 *                 type: string
 *                 maxLength: 255
 *                 example: Harper Lee
 *               coverUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: https://example.com/covers/to-kill-a-mockingbird-revised.jpg
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: An updated description about racial inequality and moral growth
 *               copiesAvailable:
 *                 type: integer
 *                 minimum: 0
 *                 example: 7
 *               copiesTotal:
 *                 type: integer
 *                 minimum: 0
 *                 example: 10
 *               isbn:
 *                 type: string
 *                 pattern: ^(\d{10}|\d{13})$
 *                 nullable: true
 *                 example: 9780061120084
 *               publisher:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: J. B. Lippincott & Co.
 *               language:
 *                 type: string
 *                 maxLength: 50
 *                 example: English
 *               pageCount:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 example: 281
 *               deweyDecimal:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: 813.54
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 example: ["classic", "fiction", "race", "pulitzer"]
 *               status:
 *                 type: string
 *                 enum: [active, archived, lost, damaged]
 *                 example: active
 *     responses:
 *       200:
 *         description: Book updated successfully
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
 *                   example: Book updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Book not found
 *       409:
 *         description: Conflict - ISBN already exists for another book
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(bookValidationSchemas.updateBook),
  asyncHandler(bookController.updateBook)
);

/**
 * @swagger
 * /api/v1/books/{id}/status:
 *   patch:
 *     summary: Change book status
 *     tags: [Books]
 *     description: Update the status of a book (active, archived, lost, damaged)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, archived, lost, damaged]
 *                 example: archived
 *     responses:
 *       200:
 *         description: Book status changed successfully
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
 *                   example: Book status changed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request - invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/status",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(bookValidationSchemas.changeBookStatus),
  asyncHandler(bookController.changeBookStatus)
);

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     description: Delete a book from the library
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
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
 *                   example: Book deleted successfully
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
 *         description: Book not found
 *       409:
 *         description: Conflict - book is currently on loan
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("book", PermissionAction.DELETE),
  ValidationUtil.validateRequest(bookValidationSchemas.deleteBook),
  asyncHandler(bookController.deleteBook)
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         title:
 *           type: string
 *           example: To Kill a Mockingbird
 *         genre:
 *           type: string
 *           example: Fiction
 *         available:
 *           type: boolean
 *           example: true
 *         publishYear:
 *           type: string
 *           example: "1960"
 *         author:
 *           type: string
 *           example: Harper Lee
 *         coverUrl:
 *           type: string
 *           example: https://example.com/covers/to-kill-a-mockingbird.jpg
 *         description:
 *           type: string
 *           example: A story about racial inequality and moral growth
 *         copiesAvailable:
 *           type: integer
 *           example: 5
 *         copiesTotal:
 *           type: integer
 *           example: 8
 *         isbn:
 *           type: string
 *           example: 9780061120084
 *         schoolId:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440001
 *         publisher:
 *           type: string
 *           example: J. B. Lippincott & Co.
 *         language:
 *           type: string
 *           example: English
 *         pageCount:
 *           type: integer
 *           example: 281
 *         deweyDecimal:
 *           type: string
 *           example: 813.54
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["classic", "fiction", "race"]
 *         status:
 *           type: string
 *           enum: [active, archived, lost, damaged]
 *           example: active
 *         availabilityStatus:
 *           type: string
 *           enum: [available, checked_out, on_hold, processing]
 *           example: available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-15T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-15T12:00:00Z
 *     PaginatedBookList:
 *       type: object
 *       properties:
 *         books:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Book'
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
 */

export default router;
