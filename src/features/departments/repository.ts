import { IDepartmentRepository } from "./interfaces/services";
import {
  DepartmentInterface,
  DepartmentStatistics,
} from "./interfaces/interfaces";
import Department from "./model";
import School from "../schools/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  DepartmentListQueryParams,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class DepartmentRepository implements IDepartmentRepository {
  /**
   * Find a department by ID
   */
  public async findDepartmentById(
    id: string
  ): Promise<DepartmentInterface | null> {
    try {
      return await Department.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding department by ID:", error);
      throw new DatabaseError("Database error while finding department", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, departmentId: id },
      });
    }
  }

  /**
   * Find a department by code
   */
  public async findDepartmentByCode(
    code: string
  ): Promise<DepartmentInterface | null> {
    try {
      return await Department.findOne({
        where: { code },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding department by code:", error);
      throw new DatabaseError(
        "Database error while finding department by code",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            departmentCode: code,
          },
        }
      );
    }
  }

  /**
   * Create a new department
   */
  public async createDepartment(
    departmentData: CreateDepartmentDTO,
    transaction?: Transaction
  ): Promise<DepartmentInterface> {
    try {
      // If isDefault is true, unset default for other departments in the same school
      if (departmentData.isDefault) {
        await Department.update(
          { isDefault: false },
          {
            where: { schoolId: departmentData.schoolId, isDefault: true },
            transaction,
          }
        );
      }

      return await Department.create(departmentData as any, { transaction });
    } catch (error) {
      logger.error("Error creating department:", error);
      throw new DatabaseError("Database error while creating department", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a department
   */
  public async updateDepartment(
    id: string,
    departmentData: UpdateDepartmentDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // If setting as default, unset default for other departments in the same school
      if (departmentData.isDefault) {
        const department = await Department.findByPk(id);
        if (department) {
          await Department.update(
            { isDefault: false },
            {
              where: {
                schoolId: departmentData.schoolId || department.schoolId,
                isDefault: true,
                id: { [Op.ne]: id },
              },
              transaction,
            }
          );
        }
      }

      const [updated] = await Department.update(departmentData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating department:", error);
      throw new DatabaseError("Database error while updating department", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, departmentId: id },
      });
    }
  }

  /**
   * Delete a department
   */
  public async deleteDepartment(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Department.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting department:", error);
      throw new DatabaseError("Database error while deleting department", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, departmentId: id },
      });
    }
  }

  /**
   * Get department list with filtering and pagination
   */
  public async getDepartmentList(params: DepartmentListQueryParams): Promise<{
    departments: DepartmentInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        schoolId,
        headOfDepartmentId,
        isDefault,
        minFacultyCount,
        maxFacultyCount,
        minStudentCount,
        maxStudentCount,
        minBudget,
        maxBudget,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (headOfDepartmentId) {
        where.headOfDepartmentId = headOfDepartmentId;
      }

      if (isDefault !== undefined) {
        where.isDefault = isDefault;
      }

      // Faculty count range
      if (minFacultyCount !== undefined || maxFacultyCount !== undefined) {
        where.facultyCount = {};
        if (minFacultyCount !== undefined) {
          where.facultyCount[Op.gte] = minFacultyCount;
        }
        if (maxFacultyCount !== undefined) {
          where.facultyCount[Op.lte] = maxFacultyCount;
        }
      }

      // Student count range
      if (minStudentCount !== undefined || maxStudentCount !== undefined) {
        where.studentCount = {};
        if (minStudentCount !== undefined) {
          where.studentCount[Op.gte] = minStudentCount;
        }
        if (maxStudentCount !== undefined) {
          where.studentCount[Op.lte] = maxStudentCount;
        }
      }

      // Budget range
      if (minBudget !== undefined || maxBudget !== undefined) {
        where.budget = {};
        if (minBudget !== undefined) {
          where.budget[Op.gte] = minBudget;
        }
        if (maxBudget !== undefined) {
          where.budget[Op.lte] = maxBudget;
        }
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { code: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
            { location: { [Op.iLike]: `%${search}%` } },
            { contactEmail: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get departments and total count
      const { count, rows } = await Department.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });

      return {
        departments: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting department list:", error);
      throw new DatabaseError("Database error while getting department list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find departments by school ID
   */
  public async findDepartmentsBySchool(
    schoolId: string
  ): Promise<DepartmentInterface[]> {
    try {
      return await Department.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding departments by school:", error);
      throw new DatabaseError(
        "Database error while finding departments by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find departments by head of department ID
   */
  public async findDepartmentsByHead(
    headId: string
  ): Promise<DepartmentInterface[]> {
    try {
      return await Department.findAll({
        where: { headOfDepartmentId: headId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding departments by head:", error);
      throw new DatabaseError(
        "Database error while finding departments by head",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, headId },
        }
      );
    }
  }

  /**
   * Check if a department code exists
   */
  public async isDepartmentCodeTaken(
    code: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      if (!code) return false;

      const whereClause: any = { code };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Department.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if department code is taken:", error);
      throw new DatabaseError("Database error while checking department code", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          departmentCode: code,
        },
      });
    }
  }

  /**
   * Get department statistics
   */
  public async getDepartmentStatistics(): Promise<DepartmentStatistics> {
    try {
      // Get total departments count
      const totalDepartments = await Department.count();

      // Get departments per school
      const departmentsPerSchoolResult = await Department.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const departmentsPerSchool: { [schoolId: string]: number } = {};
      departmentsPerSchoolResult.forEach((result: any) => {
        departmentsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get average faculty count - using proper typing for aggregate results
      const facultyResult = (await Department.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("facultyCount")), "avgFaculty"],
        ],
        raw: true,
      })) as unknown as { avgFaculty: string | null };

      // Get average student count - using proper typing for aggregate results
      const studentResult = (await Department.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("studentCount")), "avgStudent"],
        ],
        raw: true,
      })) as unknown as { avgStudent: string | null };

      // Get total budget - using proper typing for aggregate results
      const budgetResult = (await Department.findOne({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("budget")), "totalBudget"],
        ],
        raw: true,
      })) as unknown as { totalBudget: string | null };

      return {
        totalDepartments,
        departmentsPerSchool,
        averageFacultyCount:
          facultyResult && facultyResult.avgFaculty
            ? parseFloat(facultyResult.avgFaculty) || 0
            : 0,
        averageStudentCount:
          studentResult && studentResult.avgStudent
            ? parseFloat(studentResult.avgStudent) || 0
            : 0,
        totalBudget:
          budgetResult && budgetResult.totalBudget
            ? parseFloat(budgetResult.totalBudget) || 0
            : 0,
      };
    } catch (error) {
      logger.error("Error getting department statistics:", error);
      throw new DatabaseError(
        "Database error while getting department statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Get default department for a school
   */
  public async getDefaultDepartment(
    schoolId: string
  ): Promise<DepartmentInterface | null> {
    try {
      return await Department.findOne({
        where: {
          schoolId,
          isDefault: true,
        },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding default department:", error);
      throw new DatabaseError(
        "Database error while finding default department",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }
}

// Create and export repository instance
export default new DepartmentRepository();
