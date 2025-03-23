import { Router } from "express";
import addressController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import addressValidationSchemas from "./validation";
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
 *   name: Addresses
 *   description: Address management API
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get a list of addresses
 *     tags: [Addresses]
 *     description: Retrieve a paginated list of addresses with filtering options
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
 *         description: Number of addresses per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering addresses
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [buildingNumber, street, city, province, country, createdAt]
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
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province/state
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *     responses:
 *       200:
 *         description: A paginated list of addresses
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
 *                   example: Addresses retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     addresses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           buildingNumber:
 *                             type: string
 *                             example: 123
 *                           street:
 *                             type: string
 *                             example: Main Street
 *                           city:
 *                             type: string
 *                             example: Anytown
 *                           province:
 *                             type: string
 *                             example: State
 *                           postalCode:
 *                             type: string
 *                             example: 12345
 *                           country:
 *                             type: string
 *                             example: United States
 *                           addressLine2:
 *                             type: string
 *                             example: Apt 4B
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
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
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
  PermissionMiddleware.hasPermission("address", PermissionAction.READ),
  ValidationUtil.validateRequest(addressValidationSchemas.getAddressList),
  asyncHandler(addressController.getAddressList)
);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   get:
 *     summary: Get an address by ID
 *     tags: [Addresses]
 *     description: Retrieve detailed information about an address by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address details retrieved successfully
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
 *                   example: Address retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     buildingNumber:
 *                       type: string
 *                       example: 123
 *                     street:
 *                       type: string
 *                       example: Main Street
 *                     city:
 *                       type: string
 *                       example: Anytown
 *                     province:
 *                       type: string
 *                       example: State
 *                     postalCode:
 *                       type: string
 *                       example: 12345
 *                     country:
 *                       type: string
 *                       example: United States
 *                     addressLine2:
 *                       type: string
 *                       example: Apt 4B
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
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.READ),
  ValidationUtil.validateRequest(addressValidationSchemas.getAddressById),
  asyncHandler(addressController.getAddressById)
);

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     description: Create a new standalone address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - buildingNumber
 *               - street
 *               - city
 *               - province
 *               - country
 *             properties:
 *               buildingNumber:
 *                 type: string
 *                 maxLength: 20
 *                 example: 123
 *               street:
 *                 type: string
 *                 maxLength: 100
 *                 example: Main Street
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: Anytown
 *               province:
 *                 type: string
 *                 maxLength: 100
 *                 example: State
 *               addressLine2:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *                 example: Apt 4B
 *               postalCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: 12345
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 example: United States
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   example: Address created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     buildingNumber:
 *                       type: string
 *                       example: 123
 *                     street:
 *                       type: string
 *                       example: Main Street
 *                     city:
 *                       type: string
 *                       example: Anytown
 *                     province:
 *                       type: string
 *                       example: State
 *                     postalCode:
 *                       type: string
 *                       example: 12345
 *                     country:
 *                       type: string
 *                       example: United States
 *                     addressLine2:
 *                       type: string
 *                       example: Apt 4B
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-15T12:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-15T12:00:00Z
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
  PermissionMiddleware.hasPermission("address", PermissionAction.CREATE),
  ValidationUtil.validateRequest(addressValidationSchemas.createAddress),
  asyncHandler(addressController.createAddress)
);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     description: Update an existing address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               buildingNumber:
 *                 type: string
 *                 maxLength: 20
 *                 example: 456
 *               street:
 *                 type: string
 *                 maxLength: 100
 *                 example: Oak Avenue
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: Newtown
 *               province:
 *                 type: string
 *                 maxLength: 100
 *                 example: Province
 *               addressLine2:
 *                 type: string
 *                 maxLength: 100
 *                 nullable: true
 *                 example: Suite 10
 *               postalCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: 54321
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 example: Canada
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   example: Address updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     buildingNumber:
 *                       type: string
 *                       example: 456
 *                     street:
 *                       type: string
 *                       example: Oak Avenue
 *                     city:
 *                       type: string
 *                       example: Newtown
 *                     province:
 *                       type: string
 *                       example: Province
 *                     postalCode:
 *                       type: string
 *                       example: 54321
 *                     country:
 *                       type: string
 *                       example: Canada
 *                     addressLine2:
 *                       type: string
 *                       example: Suite 10
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-15T12:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-16T14:30:00Z
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(addressValidationSchemas.updateAddress),
  asyncHandler(addressController.updateAddress)
);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     description: Delete an address (only if it's not linked to any entity)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
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
 *         description: Address not found
 *       409:
 *         description: Conflict - address is in use and cannot be deleted
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.DELETE),
  ValidationUtil.validateRequest(addressValidationSchemas.deleteAddress),
  asyncHandler(addressController.deleteAddress)
);

/**
 * @swagger
 * /api/v1/addresses/link:
 *   post:
 *     summary: Link an address to an entity
 *     tags: [Addresses]
 *     description: Link an existing address to an entity
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *               - entityId
 *               - entityType
 *               - addressType
 *             properties:
 *               addressId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               entityId:
 *                 type: string
 *                 format: uuid
 *                 example: 662a8400-f33c-51e5-b716-775544330000
 *               entityType:
 *                 type: string
 *                 description: Type of entity (e.g., user, school)
 *                 example: user
 *               addressType:
 *                 type: string
 *                 description: Type of address (e.g., billing, shipping, home)
 *                 example: home
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Address linked successfully
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
 *                   example: Address linked to entity successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 773c8400-a44d-61e6-c827-995544330000
 *                     addressId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     entityId:
 *                       type: string
 *                       format: uuid
 *                       example: 662a8400-f33c-51e5-b716-775544330000
 *                     entityType:
 *                       type: string
 *                       example: user
 *                     addressType:
 *                       type: string
 *                       example: home
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *                     address:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         buildingNumber:
 *                           type: string
 *                           example: 123
 *                         street:
 *                           type: string
 *                           example: Main Street
 *                         city:
 *                           type: string
 *                           example: Anytown
 *                         province:
 *                           type: string
 *                           example: State
 *                         postalCode:
 *                           type: string
 *                           example: 12345
 *                         country:
 *                           type: string
 *                           example: United States
 *                         addressLine2:
 *                           type: string
 *                           example: Apt 4B
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Address or entity not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/link",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.CREATE),
  ValidationUtil.validateRequest(addressValidationSchemas.linkAddressToEntity),
  asyncHandler(addressController.linkAddressToEntity)
);

/**
 * @swagger
 * /api/v1/addresses/links/{id}:
 *   put:
 *     summary: Update an address link
 *     tags: [Addresses]
 *     description: Update an address link (e.g., set as primary)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address link ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPrimary
 *             properties:
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Address link updated successfully
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
 *                   example: Address link updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 773c8400-a44d-61e6-c827-995544330000
 *                     addressId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     entityId:
 *                       type: string
 *                       format: uuid
 *                       example: 662a8400-f33c-51e5-b716-775544330000
 *                     entityType:
 *                       type: string
 *                       example: user
 *                     addressType:
 *                       type: string
 *                       example: home
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *                     address:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         buildingNumber:
 *                           type: string
 *                           example: 123
 *                         street:
 *                           type: string
 *                           example: Main Street
 *                         city:
 *                           type: string
 *                           example: Anytown
 *                         province:
 *                           type: string
 *                           example: State
 *                         postalCode:
 *                           type: string
 *                           example: 12345
 *                         country:
 *                           type: string
 *                           example: United States
 *                         addressLine2:
 *                           type: string
 *                           example: Apt 4B
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Address link not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/links/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.UPDATE),
  ValidationUtil.validateRequest(addressValidationSchemas.updateAddressLink),
  asyncHandler(addressController.updateAddressLink)
);

/**
 * @swagger
 * /api/v1/addresses/links/{id}:
 *   delete:
 *     summary: Unlink an address
 *     tags: [Addresses]
 *     description: Remove the link between an address and an entity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address link ID
 *     responses:
 *       200:
 *         description: Address unlinked successfully
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
 *                   example: Address unlinked successfully
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
 *         description: Address link not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/links/:id",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.DELETE),
  ValidationUtil.validateRequest(addressValidationSchemas.unlinkAddress),
  asyncHandler(addressController.unlinkAddress)
);

/**
 * @swagger
 * /api/v1/addresses/entities/{entityType}/{entityId}:
 *   get:
 *     summary: Get all addresses for an entity
 *     tags: [Addresses]
 *     description: Retrieve all addresses linked to a specific entity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of entity (e.g., user, school)
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Entity addresses retrieved successfully
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
 *                   example: Entity addresses retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 773c8400-a44d-61e6-c827-995544330000
 *                       addressId:
 *                         type: string
 *                         format: uuid
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       entityId:
 *                         type: string
 *                         format: uuid
 *                         example: 662a8400-f33c-51e5-b716-775544330000
 *                       entityType:
 *                         type: string
 *                         example: user
 *                       addressType:
 *                         type: string
 *                         example: home
 *                       isPrimary:
 *                         type: boolean
 *                         example: true
 *                       address:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 550e8400-e29b-41d4-a716-446655440000
 *                           buildingNumber:
 *                             type: string
 *                             example: 123
 *                           street:
 *                             type: string
 *                             example: Main Street
 *                           city:
 *                             type: string
 *                             example: Anytown
 *                           province:
 *                             type: string
 *                             example: State
 *                           postalCode:
 *                             type: string
 *                             example: 12345
 *                           country:
 *                             type: string
 *                             example: United States
 *                           addressLine2:
 *                             type: string
 *                             example: Apt 4B
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-01-15T12:00:00Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-01-15T12:00:00Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/entities/:entityType/:entityId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.READ),
  ValidationUtil.validateRequest(addressValidationSchemas.getEntityAddresses),
  asyncHandler(addressController.getEntityAddresses)
);

/**
 * @swagger
 * /api/v1/addresses/entities/{entityType}/{entityId}/types/{addressType}:
 *   get:
 *     summary: Get an entity's address by type
 *     tags: [Addresses]
 *     description: Retrieve a specific type of address for an entity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of entity (e.g., user, school)
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entity ID
 *       - in: path
 *         name: addressType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of address (e.g., billing, shipping, home)
 *     responses:
 *       200:
 *         description: Entity address retrieved successfully
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
 *                   example: Entity address retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 773c8400-a44d-61e6-c827-995544330000
 *                     addressId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     entityId:
 *                       type: string
 *                       format: uuid
 *                       example: 662a8400-f33c-51e5-b716-775544330000
 *                     entityType:
 *                       type: string
 *                       example: user
 *                     addressType:
 *                       type: string
 *                       example: billing
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *                     address:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         buildingNumber:
 *                           type: string
 *                           example: 123
 *                         street:
 *                           type: string
 *                           example: Main Street
 *                         city:
 *                           type: string
 *                           example: Anytown
 *                         province:
 *                           type: string
 *                           example: State
 *                         postalCode:
 *                           type: string
 *                           example: 12345
 *                         country:
 *                           type: string
 *                           example: United States
 *                         addressLine2:
 *                           type: string
 *                           example: Apt 4B
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Address not found for this entity and type
 *       500:
 *         description: Internal server error
 */
router.get(
  "/entities/:entityType/:entityId/types/:addressType",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.READ),
  ValidationUtil.validateRequest(
    addressValidationSchemas.getEntityAddressByType
  ),
  asyncHandler(addressController.getEntityAddressByType)
);

/**
 * @swagger
 * /api/v1/addresses/entities/{entityType}/{entityId}/primary:
 *   get:
 *     summary: Get an entity's primary address
 *     tags: [Addresses]
 *     description: Retrieve the primary address for an entity (optionally of a specific type)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of entity (e.g., user, school)
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entity ID
 *       - in: query
 *         name: addressType
 *         schema:
 *           type: string
 *         description: Optional address type to filter by
 *     responses:
 *       200:
 *         description: Primary address retrieved successfully
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
 *                   example: Primary address retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 773c8400-a44d-61e6-c827-995544330000
 *                     addressId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     entityId:
 *                       type: string
 *                       format: uuid
 *                       example: 662a8400-f33c-51e5-b716-775544330000
 *                     entityType:
 *                       type: string
 *                       example: user
 *                     addressType:
 *                       type: string
 *                       example: home
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *                     address:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         buildingNumber:
 *                           type: string
 *                           example: 123
 *                         street:
 *                           type: string
 *                           example: Main Street
 *                         city:
 *                           type: string
 *                           example: Anytown
 *                         province:
 *                           type: string
 *                           example: State
 *                         postalCode:
 *                           type: string
 *                           example: 12345
 *                         country:
 *                           type: string
 *                           example: United States
 *                         addressLine2:
 *                           type: string
 *                           example: Apt 4B
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: No primary address found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/entities/:entityType/:entityId/primary",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.READ),
  ValidationUtil.validateRequest(
    addressValidationSchemas.getEntityPrimaryAddress
  ),
  asyncHandler(addressController.getEntityPrimaryAddress)
);

/**
 * @swagger
 * /api/v1/addresses/entities/{entityType}/{entityId}/types/{addressType}/create-link:
 *   post:
 *     summary: Create and link an address
 *     tags: [Addresses]
 *     description: Create a new address and link it to an entity in a single operation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of entity (e.g., user, school)
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entity ID
 *       - in: path
 *         name: addressType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of address (e.g., billing, shipping, home)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
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
 *                     maxLength: 20
 *                     example: 789
 *                   street:
 *                     type: string
 *                     maxLength: 100
 *                     example: Pine Boulevard
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                     example: Westville
 *                   province:
 *                     type: string
 *                     maxLength: 100
 *                     example: Region
 *                   addressLine2:
 *                     type: string
 *                     maxLength: 100
 *                     nullable: true
 *                     example: Floor 3
 *                   postalCode:
 *                     type: string
 *                     maxLength: 20
 *                     nullable: true
 *                     example: 67890
 *                   country:
 *                     type: string
 *                     maxLength: 100
 *                     example: Australia
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created and linked successfully
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
 *                   example: Address created and linked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 773c8400-a44d-61e6-c827-995544330000
 *                     addressId:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     entityId:
 *                       type: string
 *                       format: uuid
 *                       example: 662a8400-f33c-51e5-b716-775544330000
 *                     entityType:
 *                       type: string
 *                       example: user
 *                     addressType:
 *                       type: string
 *                       example: billing
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *                     address:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 550e8400-e29b-41d4-a716-446655440000
 *                         buildingNumber:
 *                           type: string
 *                           example: 789
 *                         street:
 *                           type: string
 *                           example: Pine Boulevard
 *                         city:
 *                           type: string
 *                           example: Westville
 *                         province:
 *                           type: string
 *                           example: Region
 *                         postalCode:
 *                           type: string
 *                           example: 67890
 *                         country:
 *                           type: string
 *                           example: Australia
 *                         addressLine2:
 *                           type: string
 *                           example: Floor 3
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2023-01-15T12:00:00Z
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
  "/entities/:entityType/:entityId/types/:addressType/create-link",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("address", PermissionAction.CREATE),
  ValidationUtil.validateRequest(addressValidationSchemas.createAndLinkAddress),
  asyncHandler(addressController.createAndLinkAddress)
);

/**
 * @swagger
 * /api/v1/addresses/validate-postal-code:
 *   get:
 *     summary: Validate a postal code format
 *     tags: [Addresses]
 *     description: Check if a postal code is valid for a specific country
 *     parameters:
 *       - in: query
 *         name: postalCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Postal code to validate
 *       - in: query
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country code (e.g., US, CA, UK)
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
 *                 message:
 *                   type: string
 *                   example: Postal code format is valid
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
router.get(
  "/validate-postal-code",
  ValidationUtil.validateRequest(addressValidationSchemas.validatePostalCode),
  asyncHandler(addressController.validatePostalCode)
);

export default router;
