import { ISchoolRepository } from "./interfaces/services";
import { SchoolInterface } from "./interfaces/interfaces";
import School from "./model";
import Address from "../address/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import { SchoolListQueryParams, CreateSchoolDTO, UpdateSchoolDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SchoolRepository implements ISchoolRepository {
  /**
   * Find a school by ID
   */
  public async findSchoolById(id: string): Promise<SchoolInterface | null> {
    try {
      return await School.findByPk(id, {
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding school by ID:", error);
      throw new DatabaseError("Database error while finding school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId: id },
      });
    }
  }

  /**
   * Find a school by code
   */
  public async findSchoolByCode(code: string): Promise<SchoolInterface | null> {
    try {
      return await School.findOne({
        where: { schoolCode: code },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding school by code:", error);
      throw new DatabaseError("Database error while finding school by code", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolCode: code },
      });
    }
  }

  /**
   * Create a new school
   */
  public async createSchool(
    schoolData: CreateSchoolDTO,
    transaction?: Transaction
  ): Promise<SchoolInterface> {
    try {
      return await School.create(schoolData as any, { transaction });
    } catch (error) {
      logger.error("Error creating school:", error);
      throw new DatabaseError("Database error while creating school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a school
   */
  public async updateSchool(
    id: string,
    schoolData: UpdateSchoolDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await School.update(schoolData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating school:", error);
      throw new DatabaseError("Database error while updating school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId: id },
      });
    }
  }

  /**
   * Delete a school
   */
  public async deleteSchool(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await School.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting school:", error);
      throw new DatabaseError("Database error while deleting school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId: id },
      });
    }
  }

  /**
   * Get school list with filtering and pagination
   */
  public async getSchoolList(params: SchoolListQueryParams): Promise<{
    schools: SchoolInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        level,
        isPublic,
        schoolType,
        yearOpened,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (level) {
        where.level = level;
      }

      if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      if (schoolType) {
        where.schoolType = schoolType;
      }

      if (yearOpened) {
        where.yearOpened = yearOpened;
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { shortName: { [Op.iLike]: `%${search}%` } },
            { schoolCode: { [Op.iLike]: `%${search}%` } },
            { motto: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get schools and total count
      const { count, rows } = await School.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      return {
        schools: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting school list:", error);
      throw new DatabaseError("Database error while getting school list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find schools by principal ID
   */
  public async findSchoolsByPrincipal(
    principalId: string
  ): Promise<SchoolInterface[]> {
    try {
      return await School.findAll({
        where: { principalId },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding schools by principal:", error);
      throw new DatabaseError(
        "Database error while finding schools by principal",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, principalId },
        }
      );
    }
  }

  /**
   * Find schools by administrator ID
   */
  public async findSchoolsByAdmin(adminId: string): Promise<SchoolInterface[]> {
    try {
      return await School.findAll({
        where: { adminId },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding schools by admin:", error);
      throw new DatabaseError("Database error while finding schools by admin", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, adminId },
      });
    }
  }

  /**
   * Find schools by type
   */
  public async findSchoolsByType(
    schoolType: string
  ): Promise<SchoolInterface[]> {
    try {
      return await School.findAll({
        where: { schoolType },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding schools by type:", error);
      throw new DatabaseError("Database error while finding schools by type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolType },
      });
    }
  }

  /**
   * Find schools by level
   */
  public async findSchoolsByLevel(level: string): Promise<SchoolInterface[]> {
    try {
      return await School.findAll({
        where: { level },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding schools by level:", error);
      throw new DatabaseError("Database error while finding schools by level", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, level },
      });
    }
  }

  /**
   * Check if a school code exists
   */
  public async isSchoolCodeTaken(
    code: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const whereClause: any = { schoolCode: code };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await School.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if school code is taken:", error);
      throw new DatabaseError("Database error while checking school code", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolCode: code },
      });
    }
  }
}

// Create and export repository instance
export default new SchoolRepository();
