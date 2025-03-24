import { Router } from "express";
import categoryController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import categoryValidationSchemas from "./validation";
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
 *     Category:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - schoolId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the category
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           description: The name of the category
 *           example: Science Books
 *         code:
 *           type: string
 *           nullable: true
 *           description: Category code for identification purposes
 *           example: SCI-001
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this category belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the category
 *           example: Books related to all science subjects including Physics, Chemistry and Biology
 *
 *     CategoryDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Category'
 *         - type: object
 *           properties:
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the category was created
 *               example: 2023-01-01T12:00:00Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the category was last updated
 *               example: 2023-01-10T15:30:00Z
 *             school:
 *               type: object
 *               description: The school this category belongs to
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
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management API
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get a list of categories
 *     tags: [Categories]
 *     description: Retrieve a paginated list of categories with filtering options
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
 *         description: Number of categories per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering categories
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, createdAt]
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
 *         name: code
 *         schema:
 *           type: string
 *         description: Filter by category code
 *     responses:
 *       200:
 *         description: A paginated list of categories
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
 *                   example: "Categories retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryDetail'
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
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.READ),
  ValidationUtil.validateRequest(categoryValidationSchemas.getCategoryList),
  asyncHandler(categoryController.getCategoryList)
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     description: Retrieve detailed information about a category by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
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
 *                   example: "Category retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CategoryDetail'
 *       404:
 *         description: Category not found
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.READ),
  ValidationUtil.validateRequest(categoryValidationSchemas.getCategoryById),
  asyncHandler(categoryController.getCategoryById)
);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     description: Create a new category record
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
 *               - schoolId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Science Books
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: SCI-001
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Books related to all science subjects
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CategoryDetail'
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.CREATE),
  ValidationUtil.validateRequest(categoryValidationSchemas.createCategory),
  asyncHandler(categoryController.createCategory)
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     description: Update an existing category's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
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
 *                 example: Updated Science Books
 *               code:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: SCI-002
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Updated description for science books
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CategoryDetail'
 *       404:
 *         description: Category not found
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(categoryValidationSchemas.updateCategory),
  asyncHandler(categoryController.updateCategory)
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     description: Delete a category record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *                   example: "Category deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Category not found
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.DELETE),
  ValidationUtil.validateRequest(categoryValidationSchemas.deleteCategory),
  asyncHandler(categoryController.deleteCategory)
);

/**
 * @swagger
 * /api/v1/categories/school/{schoolId}:
 *   get:
 *     summary: Get categories by school
 *     tags: [Categories]
 *     description: Retrieve all categories associated with a specific school
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
 *         description: School's categories retrieved successfully
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
 *                   example: "School's categories retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryDetail'
 *       404:
 *         description: School not found
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.READ),
  ValidationUtil.validateRequest(
    categoryValidationSchemas.getCategoriesBySchool
  ),
  asyncHandler(categoryController.getCategoriesBySchool)
);

/**
 * @swagger
 * /api/v1/categories/code/{code}:
 *   get:
 *     summary: Get category by code
 *     tags: [Categories]
 *     description: Retrieve a category by its code, optionally filtered by school
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Category code
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional school ID to filter by
 *     responses:
 *       200:
 *         description: Category retrieved successfully
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
 *                   example: "Category retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CategoryDetail'
 *       404:
 *         description: Category not found
 */
router.get(
  "/code/:code",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.READ),
  ValidationUtil.validateRequest(categoryValidationSchemas.getCategoryByCode),
  asyncHandler(categoryController.getCategoryByCode)
);

/**
 * @swagger
 * /api/v1/categories/statistics:
 *   get:
 *     summary: Get category statistics
 *     tags: [Categories]
 *     description: Retrieve statistics about categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
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
 *                   example: "Category statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCategories:
 *                       type: integer
 *                       example: 120
 *                     categoriesPerSchool:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example: {"772e0600-g48d-71g6-d938-668877660222": 12, "883f9600-h59e-81h7-e049-779988770333": 8}
 *                     categoriesByCode:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example: {"SCI": 25, "MAT": 30, "LIT": 20}
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.READ),
  ValidationUtil.validateRequest(
    categoryValidationSchemas.getCategoryStatistics
  ),
  asyncHandler(categoryController.getCategoryStatistics)
);

/**
 * @swagger
 * /api/v1/categories/bulk:
 *   post:
 *     summary: Create multiple categories at once
 *     tags: [Categories]
 *     description: Create multiple category records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categories
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - schoolId
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: Science Books
 *                     code:
 *                       type: string
 *                       maxLength: 50
 *                       nullable: true
 *                       example: SCI-001
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: Books related to all science subjects
 *     responses:
 *       201:
 *         description: Categories created successfully
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
 *                   example: "Categories created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryDetail'
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("category", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    categoryValidationSchemas.createCategoriesBulk
  ),
  asyncHandler(categoryController.createCategoriesBulk)
);

/**
 * @swagger
 * /api/v1/categories/bulk:
 *   delete:
 *     summary: Delete multiple categories at once
 *     tags: [Categories]
 *     description: Delete multiple category records in a single request
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
 *         description: Categories deleted successfully
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
 *                   example: "Categories deleted successfully"
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
  PermissionMiddleware.hasPermission("category", PermissionAction.DELETE),
  ValidationUtil.validateRequest(
    categoryValidationSchemas.deleteCategoriesBulk
  ),
  asyncHandler(categoryController.deleteCategoriesBulk)
);

export default router;
