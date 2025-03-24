import { Router } from "express";
import sectionController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import sectionValidationSchemas from "./validation";
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
 *     Section:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - schoolId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the section
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           description: The name of the section (e.g. A, B, C, N1, N2, N3)
 *           example: N1
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: The ID of the school this section belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         capacity:
 *           type: integer
 *           nullable: true
 *           description: The maximum number of students that can be in this section
 *           example: 30
 *         details:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the section
 *           example: First section of Form 1
 *         color:
 *           type: string
 *           nullable: true
 *           description: Color code associated with the section
 *           example: blue
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: The date when the section becomes active
 *           example: 2023-01-01T00:00:00Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: The date when the section becomes inactive
 *           example: 2023-12-31T23:59:59Z
 *
 *     SectionDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Section'
 *         - type: object
 *           properties:
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the section was created
 *               example: 2023-01-01T12:00:00Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: The timestamp when the section was last updated
 *               example: 2023-01-10T15:30:00Z
 *             school:
 *               type: object
 *               description: The school this section belongs to
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
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *         totalItems:
 *           type: integer
 *           description: Total number of items
 *           example: 50
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 5
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 *
 *     SectionStatistics:
 *       type: object
 *       properties:
 *         totalSections:
 *           type: integer
 *           description: Total number of sections in the system
 *           example: 120
 *         sectionsPerSchool:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of sections per school
 *           example: {"772e0600-g48d-71g6-d938-668877660222": 12, "883f9600-h59e-81h7-e049-779988770333": 8}
 *         averageCapacity:
 *           type: number
 *           format: float
 *           description: Average capacity across all sections
 *           example: 28.5
 *         activeSections:
 *           type: integer
 *           description: Number of currently active sections
 *           example: 75
 *         sectionsByColor:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Number of sections by color
 *           example: {"blue": 25, "green": 30, "red": 20}
 *
 *     ApiResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *         message:
 *           type: string
 *           description: A message describing the result of the operation
 *         data:
 *           type: object
 *           description: The data returned by the API
 *         meta:
 *           type: object
 *           description: Additional metadata such as request ID, timestamp, etc.
 *           properties:
 *             requestId:
 *               type: string
 *               example: req-123456789
 *             timestamp:
 *               type: string
 *               format: date-time
 *               example: 2023-01-01T12:34:56Z
 *
 *     Error:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - error
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: Error code
 *             details:
 *               type: object
 *               description: Additional error details
 *         meta:
 *           type: object
 *           properties:
 *             requestId:
 *               type: string
 *               example: req-123456789
 *             timestamp:
 *               type: string
 *               format: date-time
 *               example: 2023-01-01T12:34:56Z
 */

/**
 * @swagger
 * tags:
 *   name: Sections
 *   description: Section management API
 */

/**
 * @swagger
 * /api/v1/sections:
 *   get:
 *     summary: Get a list of sections
 *     tags: [Sections]
 *     description: Retrieve a paginated list of sections with filtering options
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
 *         description: Number of sections per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering sections
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, capacity, startDate, endDate, createdAt]
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
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color
 *       - in: query
 *         name: capacityMin
 *         schema:
 *           type: integer
 *         description: Filter by minimum capacity
 *       - in: query
 *         name: capacityMax
 *         schema:
 *           type: integer
 *         description: Filter by maximum capacity
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (current date between startDate and endDate)
 *     responses:
 *       200:
 *         description: A paginated list of sections
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         sections:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SectionDetail'
 *                         meta:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: "Sections retrieved successfully"
 *               data:
 *                 sections:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "N1"
 *                     schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                     capacity: 30
 *                     details: "First section of Form 1"
 *                     color: "blue"
 *                     startDate: "2023-01-01T00:00:00Z"
 *                     endDate: "2023-12-31T23:59:59Z"
 *                     createdAt: "2023-01-01T12:00:00Z"
 *                     updatedAt: "2023-01-01T12:00:00Z"
 *                     school:
 *                       id: "772e0600-g48d-71g6-d938-668877660222"
 *                       name: "St. Mary's High School"
 *                       type: "High School"
 *                   - id: "661f9500-f39c-51f5-c827-557766550111"
 *                     name: "N2"
 *                     schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                     capacity: 25
 *                     details: "Second section of Form 1"
 *                     color: "green"
 *                     startDate: "2023-01-01T00:00:00Z"
 *                     endDate: "2023-12-31T23:59:59Z"
 *                     createdAt: "2023-01-02T14:30:00Z"
 *                     updatedAt: "2023-01-02T14:30:00Z"
 *                     school:
 *                       id: "772e0600-g48d-71g6-d938-668877660222"
 *                       name: "St. Mary's High School"
 *                       type: "High School"
 *                 meta:
 *                   page: 1
 *                   limit: 10
 *                   totalItems: 25
 *                   totalPages: 3
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Authentication token is missing or invalid"
 *               error:
 *                 code: "AUTH-003"
 *                 details: null
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "You don't have permission to access this resource"
 *               error:
 *                 code: "AUTH-005"
 *                 details: null
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Internal server error"
 *               error:
 *                 code: "GEN-001"
 *                 details: null
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.READ),
  ValidationUtil.validateRequest(sectionValidationSchemas.getSectionList),
  asyncHandler(sectionController.getSectionList)
);

/**
 * @swagger
 * /api/v1/sections/{id}:
 *   get:
 *     summary: Get a section by ID
 *     tags: [Sections]
 *     description: Retrieve detailed information about a section by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SectionDetail'
 *             example:
 *               success: true
 *               message: "Section retrieved successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "N1"
 *                 schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                 capacity: 30
 *                 details: "First section of Form 1"
 *                 color: "blue"
 *                 startDate: "2023-01-01T00:00:00Z"
 *                 endDate: "2023-12-31T23:59:59Z"
 *                 createdAt: "2023-01-01T12:00:00Z"
 *                 updatedAt: "2023-01-01T12:00:00Z"
 *                 school:
 *                   id: "772e0600-g48d-71g6-d938-668877660222"
 *                   name: "St. Mary's High School"
 *                   type: "High School"
 *                   address: "123 Education St"
 *                   city: "Springfield"
 *                   state: "IL"
 *                   country: "USA"
 *                   zipCode: "62701"
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Section with ID 550e8400-e29b-41d4-a716-446655440000 not found"
 *               error:
 *                 code: "RES-001"
 *                 details: null
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.READ),
  ValidationUtil.validateRequest(sectionValidationSchemas.getSectionById),
  asyncHandler(sectionController.getSectionById)
);

/**
 * @swagger
 * /api/v1/sections:
 *   post:
 *     summary: Create a new section
 *     tags: [Sections]
 *     description: Create a new section record
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
 *                 example: N1
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               capacity:
 *                 type: integer
 *                 nullable: true
 *                 example: 30
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: First section of Form 1
 *               color:
 *                 type: string
 *                 nullable: true
 *                 example: blue
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2023-01-01T00:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2023-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: Section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SectionDetail'
 *             example:
 *               success: true
 *               message: "Section created successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "N1"
 *                 schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                 capacity: 30
 *                 details: "First section of Form 1"
 *                 color: "blue"
 *                 startDate: "2023-01-01T00:00:00Z"
 *                 endDate: "2023-12-31T23:59:59Z"
 *                 createdAt: "2023-01-10T15:30:00Z"
 *                 updatedAt: "2023-01-10T15:30:00Z"
 *                 school:
 *                   id: "772e0600-g48d-71g6-d938-668877660222"
 *                   name: "St. Mary's High School"
 *                   type: "High School"
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               error:
 *                 code: "VAL-002"
 *                 details:
 *                   - field: "name"
 *                     message: "name is required"
 *                   - field: "schoolId"
 *                     message: "schoolId must be a valid UUID"
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.CREATE),
  ValidationUtil.validateRequest(sectionValidationSchemas.createSection),
  asyncHandler(sectionController.createSection)
);

/**
 * @swagger
 * /api/v1/sections/{id}:
 *   put:
 *     summary: Update a section
 *     tags: [Sections]
 *     description: Update an existing section's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
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
 *                 example: N1-A
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *                 example: 883f9600-h59e-81h7-e049-779988770333
 *               capacity:
 *                 type: integer
 *                 nullable: true
 *                 example: 25
 *               details:
 *                 type: string
 *                 nullable: true
 *                 example: Updated section details
 *               color:
 *                 type: string
 *                 nullable: true
 *                 example: green
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2023-02-01T00:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2023-11-30T23:59:59Z
 *     responses:
 *       200:
 *         description: Section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SectionDetail'
 *             example:
 *               success: true
 *               message: "Section updated successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "N1-A"
 *                 schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                 capacity: 25
 *                 details: "Updated section details"
 *                 color: "green"
 *                 startDate: "2023-02-01T00:00:00Z"
 *                 endDate: "2023-11-30T23:59:59Z"
 *                 createdAt: "2023-01-01T12:00:00Z"
 *                 updatedAt: "2023-01-10T15:30:00Z"
 *                 school:
 *                   id: "772e0600-g48d-71g6-d938-668877660222"
 *                   name: "St. Mary's High School"
 *                   type: "High School"
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(sectionValidationSchemas.updateSection),
  asyncHandler(sectionController.updateSection)
);

/**
 * @swagger
 * /api/v1/sections/{id}:
 *   delete:
 *     summary: Delete a section
 *     tags: [Sections]
 *     description: Delete a section record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: boolean
 *                           example: true
 *             example:
 *               success: true
 *               message: "Section deleted successfully"
 *               data:
 *                 success: true
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.DELETE),
  ValidationUtil.validateRequest(sectionValidationSchemas.deleteSection),
  asyncHandler(sectionController.deleteSection)
);

/**
 * @swagger
 * /api/v1/sections/school/{schoolId}:
 *   get:
 *     summary: Get sections by school
 *     tags: [Sections]
 *     description: Retrieve all sections associated with a specific school
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
 *         description: School's sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SectionDetail'
 *             example:
 *               success: true
 *               message: "School's sections retrieved successfully"
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "N1"
 *                   schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                   capacity: 30
 *                   details: "First section of Form 1"
 *                   color: "blue"
 *                   startDate: "2023-01-01T00:00:00Z"
 *                   endDate: "2023-12-31T23:59:59Z"
 *                   createdAt: "2023-01-01T12:00:00Z"
 *                   updatedAt: "2023-01-01T12:00:00Z"
 *                   school:
 *                     id: "772e0600-g48d-71g6-d938-668877660222"
 *                     name: "St. Mary's High School"
 *                     type: "High School"
 *                 - id: "661f9500-f39c-51f5-c827-557766550111"
 *                   name: "N2"
 *                   schoolId: "772e0600-g48d-71g6-d938-668877660222"
 *                   capacity: 25
 *                   details: "Second section of Form 1"
 *                   color: "green"
 *                   startDate: "2023-01-01T00:00:00Z"
 *                   endDate: "2023-12-31T23:59:59Z"
 *                   createdAt: "2023-01-02T14:30:00Z"
 *                   updatedAt: "2023-01-02T14:30:00Z"
 *                   school:
 *                     id: "772e0600-g48d-71g6-d938-668877660222"
 *                     name: "St. Mary's High School"
 *                     type: "High School"
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/school/:schoolId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.READ),
  ValidationUtil.validateRequest(sectionValidationSchemas.getSectionsBySchool),
  asyncHandler(sectionController.getSectionsBySchool)
);

/**
 * @swagger
 * /api/v1/sections/statistics:
 *   get:
 *     summary: Get section statistics
 *     tags: [Sections]
 *     description: Retrieve statistics about sections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Section statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SectionStatistics'
 *             example:
 *               success: true
 *               message: "Section statistics retrieved successfully"
 *               data:
 *                 totalSections: 120
 *                 sectionsPerSchool:
 *                   "772e0600-g48d-71g6-d938-668877660222": 12
 *                   "883f9600-h59e-81h7-e049-779988770333": 8
 *                 averageCapacity: 28.5
 *                 activeSections: 75
 *                 sectionsByColor:
 *                   "blue": 25
 *                   "green": 30
 *                   "red": 20
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/statistics",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.READ),
  ValidationUtil.validateRequest(sectionValidationSchemas.getSectionStatistics),
  asyncHandler(sectionController.getSectionStatistics)
);

/**
 * @swagger
 * /api/v1/sections/bulk:
 *   post:
 *     summary: Create multiple sections at once
 *     tags: [Sections]
 *     description: Create multiple section records in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sections
 *             properties:
 *               sections:
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
 *                       example: N1
 *                     schoolId:
 *                       type: string
 *                       format: uuid
 *                       example: 772e0600-g48d-71g6-d938-668877660222
 *                     capacity:
 *                       type: integer
 *                       nullable: true
 *                       example: 30
 *                     details:
 *                       type: string
 *                       nullable: true
 *                       example: First section of Form 1
 *                     color:
 *                       type: string
 *                       nullable: true
 *                       example: blue
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: 2023-01-01T00:00:00Z
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: 2023-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: Sections created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SectionDetail'
 *             example:
 *               success: true
 *               message: "Sections created successfully"
 *               data: [
 *                 {
 *                   id: "550e8400-e29b-41d4-a716-446655440000",
 *                   name: "N1",
 *                   schoolId: "772e0600-g48d-71g6-d938-668877660222",
 *                   capacity: 30,
 *                   details: "First section of Form 1",
 *                   color: "blue",
 *                   startDate: "2023-01-01T00:00:00Z",
 *                   endDate: "2023-12-31T23:59:59Z",
 *                   createdAt: "2023-01-10T15:30:00Z",
 *                   updatedAt: "2023-01-10T15:30:00Z",
 *                   school: {
 *                     id: "772e0600-g48d-71g6-d938-668877660222",
 *                     name: "St. Mary's High School",
 *                     type: "High School"
 *                   }
 *                 },
 *                 {
 *                   id: "661f9500-f39c-51f5-c827-557766550111",
 *                   name: "N2",
 *                   schoolId: "772e0600-g48d-71g6-d938-668877660222",
 *                   capacity: 25,
 *                   details: "Second section of Form 1",
 *                   color: "green",
 *                   startDate: "2023-01-01T00:00:00Z",
 *                   endDate: "2023-12-31T23:59:59Z",
 *                   createdAt: "2023-01-10T15:30:00Z",
 *                   updatedAt: "2023-01-10T15:30:00Z",
 *                   school: {
 *                     id: "772e0600-g48d-71g6-d938-668877660222",
 *                     name: "St. Mary's High School",
 *                     type: "High School"
 *                   }
 *                 }
 *               ],
 *               meta: {
 *                 requestId: "req-123456789",
 *                 timestamp: "2023-01-10T15:30:00Z"
 *               }
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.CREATE),
  ValidationUtil.validateRequest(sectionValidationSchemas.createSectionsBulk),
  asyncHandler(sectionController.createSectionsBulk)
);

/**
 * @swagger
 * /api/v1/sections/bulk:
 *   delete:
 *     summary: Delete multiple sections at once
 *     tags: [Sections]
 *     description: Delete multiple section records in a single request
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
 *         description: Sections deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: boolean
 *                           example: true
 *                         count:
 *                           type: integer
 *                           example: 2
 *             example:
 *               success: true
 *               message: "Sections deleted successfully"
 *               data:
 *                 success: true
 *                 count: 2
 *               meta:
 *                 requestId: "req-123456789"
 *                 timestamp: "2023-01-10T15:30:00Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: None of the specified sections found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/bulk",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("section", PermissionAction.DELETE),
  ValidationUtil.validateRequest(sectionValidationSchemas.deleteSectionsBulk),
  asyncHandler(sectionController.deleteSectionsBulk)
);

export default router;
