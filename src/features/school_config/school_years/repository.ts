import { ISchoolYearRepository } from "./interfaces/services";
import {
  SchoolYearInterface,
  SchoolYearStatus,
  SchoolYearStatistics,
} from "./interfaces/interfaces";
import SchoolYear from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  SchoolYearListQueryParams,
  CreateSchoolYearDTO,
  UpdateSchoolYearDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SchoolYearRepository implements ISchoolYearRepository {
  /**
   * Find a school year by ID
   */
  public async findSchoolYearById(
    id: string
  ): Promise<SchoolYearInterface | null> {
    try {
      return await SchoolYear.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding school year by ID:", error);
      throw new DatabaseError("Database error while finding school year", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolYearId: id },
      });
    }
  }

  /**
   * Create a new school year
   */
  public async createSchoolYear(
    schoolYearData: CreateSchoolYearDTO,
    transaction?: Transaction
  ): Promise<SchoolYearInterface> {
    try {
      return await SchoolYear.create(schoolYearData as any, { transaction });
    } catch (error) {
      logger.error("Error creating school year:", error);
      throw new DatabaseError("Database error while creating school year", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a school year
   */
  public async updateSchoolYear(
    id: string,
    schoolYearData: UpdateSchoolYearDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await SchoolYear.update(schoolYearData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating school year:", error);
      throw new DatabaseError("Database error while updating school year", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolYearId: id },
      });
    }
  }

  /**
   * Delete a school year
   */
  public async deleteSchoolYear(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await SchoolYear.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting school year:", error);
      throw new DatabaseError("Database error while deleting school year", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolYearId: id },
      });
    }
  }

  /**
   * Get school year list with filtering and pagination
   */
  public async getSchoolYearList(params: SchoolYearListQueryParams): Promise<{
    schoolYears: SchoolYearInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "startDate",
        sortOrder = "desc",
        schoolId,
        status,
        year,
        currentOnly,
      } = params;

      // Build where clause
      let where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (status) {
        where.status = status;
      }

      if (year) {
        where.year = year;
      }

      // Current school years
      if (currentOnly) {
        const now = new Date();
        where = {
          ...where,
          [Op.and]: [
            { startDate: { [Op.lte]: now } },
            { endDate: { [Op.gte]: now } },
          ],
        };
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { year: { [Op.iLike]: `%${search}%` } },
            { status: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get school years and total count
      const { count, rows } = await SchoolYear.findAndCountAll({
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
        schoolYears: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting school year list:", error);
      throw new DatabaseError("Database error while getting school year list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find school years by school ID
   */
  public async findSchoolYearsBySchool(
    schoolId: string
  ): Promise<SchoolYearInterface[]> {
    try {
      return await SchoolYear.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
        order: [["startDate", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding school years by school:", error);
      throw new DatabaseError(
        "Database error while finding school years by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Get school year statistics
   */
  public async getSchoolYearStatistics(): Promise<SchoolYearStatistics> {
    try {
      // Get total school years count
      const totalSchoolYears = await SchoolYear.count();

      // Get school years per school
      const schoolYearsPerSchoolResult = await SchoolYear.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const schoolYearsPerSchool: { [schoolId: string]: number } = {};
      schoolYearsPerSchoolResult.forEach((result: any) => {
        schoolYearsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get active, upcoming, and completed school years count
      const now = new Date();
      const activeSchoolYears = await SchoolYear.count({
        where: {
          status: SchoolYearStatus.ACTIVE,
        },
      });

      const upcomingSchoolYears = await SchoolYear.count({
        where: {
          status: SchoolYearStatus.UPCOMING,
        },
      });

      const completedSchoolYears = await SchoolYear.count({
        where: {
          status: SchoolYearStatus.COMPLETED,
        },
      });

      // Get status distribution
      const statusDistributionResult = await SchoolYear.findAll({
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          status: {
            [Op.ne]: null,
          },
        },
        group: ["status"],
        raw: true,
      });

      const statusDistribution: { [status: string]: number } = {};
      statusDistributionResult.forEach((result: any) => {
        if (result.status) {
          statusDistribution[result.status] = parseInt(result.count, 10);
        }
      });

      // Calculate average duration in days
      const schoolYears = await SchoolYear.findAll({
        attributes: ["startDate", "endDate"],
        raw: true,
      });

      let totalDays = 0;
      schoolYears.forEach((schoolYear: any) => {
        const startDate = new Date(schoolYear.startDate);
        const endDate = new Date(schoolYear.endDate);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationDays = durationMs / (1000 * 60 * 60 * 24);
        totalDays += durationDays;
      });

      const averageDuration =
        schoolYears.length > 0 ? totalDays / schoolYears.length : 0;

      return {
        totalSchoolYears,
        schoolYearsPerSchool,
        activeSchoolYears,
        upcomingSchoolYears,
        completedSchoolYears,
        statusDistribution,
        averageDuration,
      };
    } catch (error) {
      logger.error("Error getting school year statistics:", error);
      throw new DatabaseError(
        "Database error while getting school year statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple school years at once
   */
  public async createSchoolYearsBulk(
    schoolYearsData: CreateSchoolYearDTO[],
    transaction?: Transaction
  ): Promise<SchoolYearInterface[]> {
    try {
      return await SchoolYear.bulkCreate(schoolYearsData as any, {
        transaction,
      });
    } catch (error) {
      logger.error("Error bulk creating school years:", error);
      throw new DatabaseError(
        "Database error while bulk creating school years",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Get active school year for a school
   */
  public async getActiveSchoolYear(
    schoolId: string
  ): Promise<SchoolYearInterface | null> {
    try {
      return await SchoolYear.findOne({
        where: {
          schoolId,
          status: SchoolYearStatus.ACTIVE,
        },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error getting active school year:", error);
      throw new DatabaseError(
        "Database error while getting active school year",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Get current school year (based on current date)
   */
  public async getCurrentSchoolYear(
    schoolId: string
  ): Promise<SchoolYearInterface | null> {
    try {
      const now = new Date();
      return await SchoolYear.findOne({
        where: {
          schoolId,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error getting current school year:", error);
      throw new DatabaseError(
        "Database error while getting current school year",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }
}

// Create and export repository instance
export default new SchoolYearRepository();
