import { Router } from "express";
import searchController from "./controller";
import ValidationUtil from "@/common/validators/validationUtil";
import searchValidationSchemas from "./validation";
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
 *   name: Search
 *   description: Global search API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResultItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         entityType:
 *           type: string
 *           example: school
 *         title:
 *           type: string
 *           example: Greenfield High School
 *         subtitle:
 *           type: string
 *           example: GHS - high school
 *         description:
 *           type: string
 *           example: Public school established in 1985
 *         highlights:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: all
 *               snippets:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "...found in <b>Greenfield</b> High School..."
 *         relevanceScore:
 *           type: number
 *           example: 8.5
 *         thumbnailUrl:
 *           type: string
 *           format: uri
 *           example: https://example.com/images/school-logo.png
 *         url:
 *           type: string
 *           example: /schools/550e8400-e29b-41d4-a716-446655440000
 *         metadata:
 *           type: object
 *           properties:
 *             level:
 *               type: string
 *               example: high
 *             schoolCode:
 *               type: string
 *               example: GHS-H-123
 *             schoolType:
 *               type: string
 *               example: day
 *             yearOpened:
 *               type: integer
 *               example: 1985
 *             isPublic:
 *               type: boolean
 *               example: true
 *     SearchResult:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Search results for "high school"
 *         data:
 *           type: object
 *           properties:
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SearchResultItem'
 *             meta:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                   example: high school
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalItems:
 *                   type: integer
 *                   example: 35
 *                 totalPages:
 *                   type: integer
 *                   example: 4
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 hasPrevPage:
 *                   type: boolean
 *                   example: false
 *                 processingTimeMs:
 *                   type: integer
 *                   example: 125
 *                 resultsByType:
 *                   type: object
 *                   example:
 *                     school: 25
 *                     address: 5
 *                     user: 5
 *             suggestions:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - Greenfield High School
 *                 - Secondary School
 *                 - High
 *                 - School
 *                 - Education
 */

/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     summary: Perform a global search across all entities
 *     tags: [Search]
 *     description: Search across all entity types (schools, addresses, users, etc.)
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: high school
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *         description: Number of results per page
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           example: school,address
 *         description: Comma-separated list of entity types to search (e.g., "school,address")
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: boolean
 *           default: true
 *           example: true
 *         description: Whether to perform fuzzy matching
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: relevance
 *           example: relevance
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
 *         description: Sort order
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *           example: '{"level":"high","isPublic":true}'
 *         description: JSON string of filters to apply (e.g., {"level":"high"})
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResult'
 *             example:
 *               success: true
 *               message: Search results for "high school"
 *               data:
 *                 results:
 *                   - id: 550e8400-e29b-41d4-a716-446655440000
 *                     entityType: school
 *                     title: Greenfield High School
 *                     subtitle: GHS - high school
 *                     description: Public school established in 1985
 *                     highlights:
 *                       - field: all
 *                         snippets:
 *                           - "...found in <b>Greenfield</b> <b>High</b> <b>School</b>..."
 *                     relevanceScore: 8.5
 *                     thumbnailUrl: https://example.com/images/school-logo.png
 *                     url: /schools/550e8400-e29b-41d4-a716-446655440000
 *                     metadata:
 *                       level: high
 *                       schoolCode: GHS-H-123
 *                       schoolType: day
 *                       yearOpened: 1985
 *                       isPublic: true
 *                   - id: 661f9401-f39c-51e5-b716-557766550111
 *                     entityType: school
 *                     title: Riverside High School
 *                     subtitle: RHS - high school
 *                     description: Private school established in 1990
 *                     highlights:
 *                       - field: all
 *                         snippets:
 *                           - "...found in Riverside <b>High</b> <b>School</b>..."
 *                     relevanceScore: 7.2
 *                     thumbnailUrl: https://example.com/images/rhs-logo.png
 *                     url: /schools/661f9401-f39c-51e5-b716-557766550111
 *                     metadata:
 *                       level: high
 *                       schoolCode: RHS-H-456
 *                       schoolType: boarding
 *                       yearOpened: 1990
 *                       isPublic: false
 *                 meta:
 *                   query: high school
 *                   page: 1
 *                   limit: 10
 *                   totalItems: 35
 *                   totalPages: 4
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *                   processingTimeMs: 125
 *                   resultsByType:
 *                     school: 25
 *                     address: 5
 *                     user: 5
 *                 suggestions:
 *                   - Greenfield High School
 *                   - Riverside High School
 *                   - High
 *                   - School
 *                   - Education
 *       400:
 *         description: Bad request - invalid query
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  ValidationUtil.validateRequest(searchValidationSchemas.globalSearch),
  asyncHandler(searchController.globalSearch)
);

/**
 * @swagger
 * /api/v1/search/entities/{entityTypes}:
 *   get:
 *     summary: Search within specific entity types
 *     tags: [Search]
 *     description: Search within specified entity types
 *     parameters:
 *       - in: path
 *         name: entityTypes
 *         required: true
 *         schema:
 *           type: string
 *           example: school,address
 *         description: Comma-separated list of entity types (e.g., "school,address")
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: bulawayo
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *         description: Number of results per page
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: boolean
 *           default: true
 *           example: true
 *         description: Whether to perform fuzzy matching
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: relevance
 *           example: relevance
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
 *         description: Sort order
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *           example: '{"city":"Bulawayo","country":"Zimbabwe"}'
 *         description: JSON string of filters to apply
 *     responses:
 *       200:
 *         description: Entity-specific search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResult'
 *             example:
 *               success: true
 *               message: Search results for "bulawayo" in school, address
 *               data:
 *                 results:
 *                   - id: 772e0600-g48d-71g6-d938-668877660222
 *                     entityType: address
 *                     title: 15135 Pumula
 *                     subtitle: Bulawayo, Bulawayo
 *                     description: 15135 Pumula, Bulawayo, Bulawayo, Zimbabwe
 *                     highlights:
 *                       - field: all
 *                         snippets:
 *                           - "...located in <b>Bulawayo</b>, <b>Bulawayo</b>, Zimbabwe..."
 *                     relevanceScore: 9.5
 *                     url: /addresses/772e0600-g48d-71g6-d938-668877660222
 *                     metadata:
 *                       city: Bulawayo
 *                       province: Bulawayo
 *                       country: Zimbabwe
 *                       postalCode: 00263
 *                   - id: 550e8400-e29b-41d4-a716-446655440000
 *                     entityType: school
 *                     title: Makronexus High School
 *                     subtitle: MN_HS - high school
 *                     description: To create Zimbabwe's first convenient, secure, and intuitive school management solution
 *                     highlights:
 *                       - field: all
 *                         snippets:
 *                           - "...located in <b>Bulawayo</b>, Zimbabwe..."
 *                     relevanceScore: 7.0
 *                     thumbnailUrl: https://makronexus.com/assets/md_logo_small2-kTTFdlko.png
 *                     url: /schools/550e8400-e29b-41d4-a716-446655440000
 *                     metadata:
 *                       level: high
 *                       schoolCode: MN-001
 *                       schoolType: both
 *                       yearOpened: 2024
 *                       isPublic: true
 *                 meta:
 *                   query: bulawayo
 *                   page: 1
 *                   limit: 10
 *                   totalItems: 12
 *                   totalPages: 2
 *                   hasNextPage: true
 *                   hasPrevPage: false
 *                   processingTimeMs: 85
 *                   resultsByType:
 *                     address: 10
 *                     school: 2
 *                 suggestions:
 *                   - Bulawayo
 *                   - Pumula East
 *                   - Zimbabwe
 *       400:
 *         description: Bad request - invalid query
 *       500:
 *         description: Internal server error
 */
router.get(
  "/entities/:entityTypes",
  ValidationUtil.validateRequest(searchValidationSchemas.searchEntities),
  asyncHandler(searchController.searchEntities)
);

/**
 * @swagger
 * /api/v1/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     description: Get search suggestions as the user types
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: mak
 *         description: Partial search query
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           example: school,user
 *         description: Comma-separated list of entity types to provide suggestions for
 *     responses:
 *       200:
 *         description: Search suggestions
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
 *                   example: Suggestions for "mak"
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *             example:
 *               success: true
 *               message: Suggestions for "mak"
 *               data:
 *                 suggestions:
 *                   - Makronexus High School
 *                   - Makronexus
 *                   - Makeni School
 *                   - Make
 *                   - Makefile
 *       400:
 *         description: Bad request - invalid query
 *       500:
 *         description: Internal server error
 */
router.get(
  "/suggestions",
  ValidationUtil.validateRequest(searchValidationSchemas.getSuggestions),
  asyncHandler(searchController.getSuggestions)
);

/**
 * @swagger
 * /api/v1/search/index/{entityType}/{entityId}:
 *   post:
 *     summary: Index an entity for search
 *     tags: [Search]
 *     description: Index or reindex a specific entity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           example: school
 *         description: Entity type (e.g., "school", "address")
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Entity indexed successfully
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
 *                   example: Entity 550e8400-e29b-41d4-a716-446655440000 indexed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *             example:
 *               success: true
 *               message: Entity 550e8400-e29b-41d4-a716-446655440000 indexed successfully
 *               data:
 *                 success: true
 *       400:
 *         description: Bad request - invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/index/:entityType/:entityId",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("search", PermissionAction.CREATE),
  ValidationUtil.validateRequest(searchValidationSchemas.indexEntity),
  asyncHandler(searchController.indexEntity)
);

/**
 * @swagger
 * /api/v1/search/rebuild-indexes:
 *   post:
 *     summary: Rebuild all search indexes
 *     tags: [Search]
 *     description: Rebuild all search indexes for all entity types
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search indexes rebuilt successfully
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
 *                   example: Search indexes rebuilt successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *             example:
 *               success: true
 *               message: Search indexes rebuilt successfully
 *               data:
 *                 success: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/rebuild-indexes",
  AuthMiddleware.verifyToken,
  PermissionMiddleware.hasPermission("search", PermissionAction.CREATE),
  ValidationUtil.validateRequest(searchValidationSchemas.rebuildIndexes),
  asyncHandler(searchController.rebuildIndexes)
);

export default router;
