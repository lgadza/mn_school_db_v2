/**
 * @swagger
 * components:
 *   schemas:
 *     DepartmentBase:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - schoolId
 *         - isDefault
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Department unique ID
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         name:
 *           type: string
 *           description: Name of the department
 *           example: Computer Science
 *         code:
 *           type: string
 *           nullable: true
 *           description: Unique code identifier for the department
 *           example: CS-DEP-101
 *         description:
 *           type: string
 *           nullable: true
 *           description: Department description
 *           example: Department of Computer Science and Technology
 *         headOfDepartmentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the department head
 *           example: 661e9500-f39c-51f5-c827-557766550111
 *         contactEmail:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Contact email for the department
 *           example: cs.dept@example.edu
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: Contact phone number for the department
 *           example: +1-555-123-4567
 *         facultyCount:
 *           type: integer
 *           nullable: true
 *           description: Number of faculty members in the department
 *           example: 25
 *         studentCount:
 *           type: integer
 *           nullable: true
 *           description: Number of students in the department
 *           example: 500
 *         location:
 *           type: string
 *           nullable: true
 *           description: Physical location of the department
 *           example: Science Building, East Wing, 3rd Floor
 *         budget:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Department budget
 *           example: 250000.00
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: ID of the school this department belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default department for the school
 *           example: false
 *
 *     DepartmentDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/DepartmentBase'
 *         - type: object
 *           properties:
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: When the department was created
 *               example: 2023-09-15T14:30:00.000Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: When the department was last updated
 *               example: 2023-09-16T10:15:00.000Z
 *             school:
 *               $ref: '#/components/schemas/SchoolDetail'
 *
 *     DepartmentCreate:
 *       type: object
 *       required:
 *         - name
 *         - schoolId
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the department
 *           example: Computer Science
 *         code:
 *           type: string
 *           nullable: true
 *           description: Unique code identifier for the department
 *           example: CS-DEP-101
 *         description:
 *           type: string
 *           nullable: true
 *           description: Department description
 *           example: Department of Computer Science and Technology
 *         headOfDepartmentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the department head
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         contactEmail:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Contact email for the department
 *           example: cs.dept@example.edu
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: Contact phone number for the department
 *           example: +1-555-123-4567
 *         facultyCount:
 *           type: integer
 *           nullable: true
 *           description: Number of faculty members in the department
 *           example: 25
 *         studentCount:
 *           type: integer
 *           nullable: true
 *           description: Number of students in the department
 *           example: 500
 *         location:
 *           type: string
 *           nullable: true
 *           description: Physical location of the department
 *           example: Science Building, East Wing, 3rd Floor
 *         budget:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Department budget
 *           example: 250000.00
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: ID of the school this department belongs to
 *           example: 772e0600-g48d-71g6-d938-668877660222
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default department for the school
 *           example: false
 *
 *     DepartmentUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the department
 *           example: Advanced Computer Science
 *         code:
 *           type: string
 *           nullable: true
 *           description: Unique code identifier for the department
 *           example: ACS-DEP-102
 *         description:
 *           type: string
 *           nullable: true
 *           description: Department description
 *           example: Updated department description
 *         headOfDepartmentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the department head
 *           example: 661e9500-f39c-51f5-c827-557766550111
 *         contactEmail:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Contact email for the department
 *           example: acs.dept@example.edu
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: Contact phone number for the department
 *           example: +1-555-987-6543
 *         facultyCount:
 *           type: integer
 *           nullable: true
 *           description: Number of faculty members in the department
 *           example: 30
 *         studentCount:
 *           type: integer
 *           nullable: true
 *           description: Number of students in the department
 *           example: 600
 *         location:
 *           type: string
 *           nullable: true
 *           description: Physical location of the department
 *           example: Technology Building, West Wing, 2nd Floor
 *         budget:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Department budget
 *           example: 300000.00
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: ID of the school this department belongs to
 *           example: 883f9600-h59e-81h7-e049-779988770333
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default department for the school
 *           example: true
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
 *           description: Total number of items across all pages
 *           example: 35
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 4
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 *
 *     DepartmentStatistics:
 *       type: object
 *       properties:
 *         totalDepartments:
 *           type: integer
 *           description: Total number of departments
 *           example: 25
 *         departmentsPerSchool:
 *           type: object
 *           description: Number of departments per school
 *           example:
 *             "550e8400-e29b-41d4-a716-446655440000": 5
 *             "661e9500-f39c-51f5-c827-557766550111": 8
 *         averageFacultyCount:
 *           type: number
 *           format: float
 *           description: Average number of faculty members across departments
 *           example: 18.5
 *         averageStudentCount:
 *           type: number
 *           format: float
 *           description: Average number of students across departments
 *           example: 320.75
 *         totalBudget:
 *           type: number
 *           format: float
 *           description: Total budget across all departments
 *           example: 5250000.00
 */
