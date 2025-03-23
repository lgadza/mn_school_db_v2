import { Router } from "express";
import schoolController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import schoolValidationSchemas from "./validation";
import AuthMiddleware from "@/shared/middleware/auth";
import PermissionMiddleware from "@/shared/middleware/permission";
import ErrorHandlerUtil from "@/common/utils/errors/errorUtils";
import { PermissionAction } from "../rbac/interfaces/roles.interface";

// Create router
const router = Router();

// Wrap controller methods with asyncHandler to catch errors
const asyncHandler = ErrorHandlerUtil.asyncHandler;

/**
 * @swagger
 * tags:
 *   name: Schools
 *   description: School management API
 */

/**
 * @swagger
 * /api/v1/schools:
 *   get:
 *     summary: Get a list of schools
 *     tags: [Schools]
 *     description: Retrieve a paginated list of schools with filtering options
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
 *         description: Number of schools per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering schools
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, level, isPublic, yearOpened, schoolCode, schoolType, createdAt]
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
 *         name: level
 *         schema:
 *           type: string
 *           enum: [primary, secondary, high, tertiary, quaternary]
 *         description: Filter by school level
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public/private status
 *       - in: query
 *         name: schoolType
 *         schema:
 *           type: string
 *           enum: [day, boarding, both]
 *         description: Filter by school type
 *       - in: query
 *         name: yearOpened
 *         schema:
 *           type: integer
 *         description: Filter by year opened
 *     responses:
 *       200:
 *         description: A paginated list of schools
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
 *                   example: Schools retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     schools:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SchoolDetail'
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
  PermissionMiddleware.hasPermission("school", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolValidationSchemas.getSchoolList),
  asyncHandler(schoolController.getSchoolList)
);

/**
 * @swagger
 * /api/v1/schools/{id}:
 *   get:
 *     summary: Get a school by ID
 *     tags: [Schools]
 *     description: Retrieve detailed information about a school by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: School details retrieved successfully
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
 *                   example: School retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SchoolDetail'
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
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolValidationSchemas.getSchoolById),
  asyncHandler(schoolController.getSchoolById)
);

/**
 * @swagger
 * /api/v1/schools/code/{code}:
 *   get:
 *     summary: Get a school by its code
 *     tags: [Schools]
 *     description: Retrieve detailed information about a school by its school code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: School code
 *     responses:
 *       200:
 *         description: School details retrieved successfully
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
 *                   example: School retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SchoolDetail'
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
  "/code/:code",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolValidationSchemas.getSchoolByCode),
  asyncHandler(schoolController.getSchoolByCode)
);

/**
 * @swagger
 * /api/v1/schools:
 *   post:
 *     summary: Create a new school
 *     tags: [Schools]
 *     description: Create a new school record
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
 *               - level
 *               - isPublic
 *               - principalId
 *               - addressId
 *               - shortName
 *               - yearOpened
 *               - schoolType
 *               - contactNumber
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 example: Greenfield High School
 *               level:
 *                 type: string
 *                 enum: [primary, secondary, high, tertiary, quaternary]
 *                 example: high
 *               isPublic:
 *                 type: boolean
 *                 example: true
 *               motto:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *                 example: Excellence Through Knowledge
 *               principalId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               adminId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 661e9500-f39c-51f5-c827-557766550111
 *               addressId:
 *                 type: string
 *                 format: uuid
 *                 example: 772e0600-g48d-71g6-d938-668877660222
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 255
 *                 nullable: true
 *                 example: https://example.com/images/school-logo.png
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 255
 *                 nullable: true
 *                 example: https://greenfieldhigh.edu
 *               shortName:
 *                 type: string
 *                 maxLength: 50
 *                 example: GHS
 *               capacity:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: 1200
 *               yearOpened:
 *                 type: integer
 *                 minimum: 1800
 *                 maximum: 2023
 *                 example: 1985
 *               schoolCode:
 *                 type: string
 *                 maxLength: 20
 *                 example: GHS-H-123
 *               schoolType:
 *                 type: string
 *                 enum: [day, boarding, both]
 *                 example: day
 *               contactNumber:
 *                 type: string
 *                 maxLength: 50
 *                 example: +1-555-123-4567
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 nullable: true
 *                 example: info@greenfieldhigh.edu
 *     responses:
 *       201:
 *         description: School created successfully
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
 *                   example: School created successfully
 *                 data:
 *                   $ref: '#/components/schemas/SchoolDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - school code already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.CREATE),
  ValidationUtil.validateRequest(schoolValidationSchemas.createSchool),
  asyncHandler(schoolController.createSchool)
);

/**
 * @swagger
 * /api/v1/schools/with-address:
 *   post:
 *     summary: Create a new school with address
 *     tags: [Schools]
 *     description: Create a new school record along with an address in a single API call
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolData
 *               - addressData
 *             properties:
 *               schoolData:
 *                 type: object
 *                 required:
 *                   - name
 *                   - level
 *                   - isPublic
 *                   - principalId
 *                   - shortName
 *                   - yearOpened
 *                   - schoolType
 *                   - contactNumber
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Makronexus High School
 *                   level:
 *                     type: string
 *                     enum: [primary, secondary, high, tertiary, quaternary]
 *                     example: high
 *                   isPublic:
 *                     type: boolean
 *                     example: true
 *                   motto:
 *                     type: string
 *                     example: To create Zimbabwe's first convenient school management solution
 *                   principalId:
 *                     type: string
 *                     format: uuid
 *                     example: 0c64c672-47a3-4cd0-9899-c20988aca838
 *                   logoUrl:
 *                     type: string
 *                     example: https://makronexus.com/assets/logo.png
 *                   websiteUrl:
 *                     type: string
 *                     example: https://makronexus.com/
 *                   shortName:
 *                     type: string
 *                     example: MN_HS
 *                   capacity:
 *                     type: string
 *                     example: 2000
 *                   yearOpened:
 *                     type: integer
 *                     example: 2024
 *                   schoolCode:
 *                     type: string
 *                     example: MN-001
 *                   schoolType:
 *                     type: string
 *                     enum: [day, boarding, both]
 *                     example: both
 *                   contactNumber:
 *                     type: string
 *                     example: 792567320
 *                   email:
 *                     type: string
 *                     example: mn@makronexus.com
 *               addressData:
 *                 type: object
 *                 required:
 *                   - buildingNumber
 *                   - street
 *                   - city
 *                   - province
 *                   - country
 *                 properties:
 *                   buildingNumber:
 *                     type: string
 *                     example: 15135
 *                   street:
 *                     type: string
 *                     example: Pumula
 *                   city:
 *                     type: string
 *                     example: Bulawayo
 *                   province:
 *                     type: string
 *                     example: Bulawayo
 *                   country:
 *                     type: string
 *                     example: Zimbabwe
 *                   addressLine2:
 *                     type: string
 *                     example: East
 *                   postalCode:
 *                     type: string
 *                     example: 00263
 *     responses:
 *       201:
 *         description: School created successfully with address
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
 *                   example: School created successfully with address
 *                 data:
 *                   $ref: '#/components/schemas/SchoolDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - school code already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/with-address",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.CREATE),
  ValidationUtil.validateRequest(
    schoolValidationSchemas.createSchoolWithAddress
  ),
  asyncHandler(schoolController.createSchoolWithAddress)
);

/**
 * @swagger
 * /api/v1/schools/{id}:
 *   put:
 *     summary: Update a school
 *     tags: [Schools]
 *     description: Update an existing school's information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
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
 *                 maxLength: 200
 *                 example: Updated High School Name
 *               level:
 *                 type: string
 *                 enum: [primary, secondary, high, tertiary, quaternary]
 *                 example: secondary
 *               isPublic:
 *                 type: boolean
 *                 example: false
 *               motto:
 *                 type: string
 *                 maxLength: 200
 *                 nullable: true
 *                 example: New School Motto
 *               principalId:
 *                 type: string
 *                 format: uuid
 *                 example: 883f9600-h59e-81h7-e049-779988770333
 *               adminId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 994g0700-i60f-91i8-f150-880099880444
 *               addressId:
 *                 type: string
 *                 format: uuid
 *                 example: 005h1800-j71g-02j9-g261-991100991555
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 255
 *                 nullable: true
 *                 example: https://example.com/images/updated-logo.png
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 255
 *                 nullable: true
 *                 example: https://updated-school.edu
 *               shortName:
 *                 type: string
 *                 maxLength: 50
 *                 example: UHS
 *               capacity:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: 1500
 *               yearOpened:
 *                 type: integer
 *                 minimum: 1800
 *                 maximum: 2023
 *                 example: 1990
 *               schoolCode:
 *                 type: string
 *                 maxLength: 20
 *                 example: UHS-S-456
 *               schoolType:
 *                 type: string
 *                 enum: [day, boarding, both]
 *                 example: boarding
 *               contactNumber:
 *                 type: string
 *                 maxLength: 50
 *                 example: +1-555-987-6543
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 nullable: true
 *                 example: contact@updated-school.edu
 *     responses:
 *       200:
 *         description: School updated successfully
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
 *                   example: School updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/SchoolDetail'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: School not found
 *       409:
 *         description: Conflict - school code already taken
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(schoolValidationSchemas.updateSchool),
  asyncHandler(schoolController.updateSchool)
);

/**
 * @swagger
 * /api/v1/schools/{id}:
 *   delete:
 *     summary: Delete a school
 *     tags: [Schools]
 *     description: Delete a school record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: School ID
 *     responses:
 *       200:
 *         description: School deleted successfully
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
 *                   example: School deleted successfully
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
 *         description: School not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.DELETE),
  ValidationUtil.validateRequest(schoolValidationSchemas.deleteSchool),
  asyncHandler(schoolController.deleteSchool)
);

/**
 * @swagger
 * /api/v1/schools/principal/{principalId}:
 *   get:
 *     summary: Get schools by principal
 *     tags: [Schools]
 *     description: Retrieve all schools associated with a specific principal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: principalId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Principal ID
 *     responses:
 *       200:
 *         description: Principal's schools retrieved successfully
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
 *                   example: Principal's schools retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SchoolDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/principal/:principalId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolValidationSchemas.getSchoolsByPrincipal),
  asyncHandler(schoolController.getSchoolsByPrincipal)
);

/**
 * @swagger
 * /api/v1/schools/admin/{adminId}:
 *   get:
 *     summary: Get schools by administrator
 *     tags: [Schools]
 *     description: Retrieve all schools associated with a specific administrator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Administrator ID
 *     responses:
 *       200:
 *         description: Administrator's schools retrieved successfully
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
 *                   example: Administrator's schools retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SchoolDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/:adminId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolValidationSchemas.getSchoolsByAdmin),
  asyncHandler(schoolController.getSchoolsByAdmin)
);

/**
 * @swagger
 * /api/v1/schools/generate-code:
 *   get:
 *     summary: Generate a school code
 *     tags: [Schools]
 *     description: Generate a unique school code based on school name and level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: School name
 *       - in: query
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *           enum: [primary, secondary, high, tertiary, quaternary]
 *         description: School level
 *     responses:
 *       200:
 *         description: School code generated successfully
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
 *                   example: School code generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     schoolCode:
 *                       type: string
 *                       example: GHS-H-123
 *       400:
 *         description: Bad request - missing required parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/generate-code",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("school", PermissionAction.READ),
  ValidationUtil.validateRequest(schoolValidationSchemas.generateSchoolCode),
  asyncHandler(schoolController.generateSchoolCode)
);

export default router;
