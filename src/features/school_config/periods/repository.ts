import { IPeriodRepository } from "./interfaces/services";
import { PeriodInterface, PeriodStatistics } from "./interfaces/interfaces";
import Period from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import { PeriodListQueryParams, CreatePeriodDTO, UpdatePeriodDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class PeriodRepository implements IPeriodRepository {
  /**
   * Find a period by ID
   */
  public async findPeriodById(id: string): Promise<PeriodInterface | null> {
    try {
      return await Period.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding period by ID:", error);
      throw new DatabaseError("Database error while finding period", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, periodId: id },
      });
    }
  }

  /**
   * Create a new period
   */
  public async createPeriod(
    periodData: CreatePeriodDTO,
    transaction?: Transaction
  ): Promise<PeriodInterface> {
    try {
      return await Period.create(periodData as any, { transaction });
    } catch (error: unknown) {
      // Check if this is a validation error (including unique constraint violations)
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        (error.name === "SequelizeValidationError" ||
          error.name === "SequelizeUniqueConstraintError")
      ) {
        // Rethrow validation errors with the ValidationError type
        // This will be caught by the service layer and returned as a 400 response
        throw error;
      }

      // Log the actual error for debugging
      logger.error("Database error creating period:", error);

      // For other database errors, throw a generic database error
      throw new DatabaseError("Database error while creating period", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a period
   */
  public async updatePeriod(
    id: string,
    periodData: UpdatePeriodDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // First, find the existing period
      const existingPeriod = await Period.findByPk(id);

      if (!existingPeriod) {
        return false;
      }

      // Update the period - apply changes directly to the instance
      await existingPeriod.update(periodData, { transaction });

      return true;
    } catch (error) {
      logger.error("Error updating period:", error);
      throw new DatabaseError("Database error while updating period", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, periodId: id },
      });
    }
  }

  /**
   * Delete a period
   */
  public async deletePeriod(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Period.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting period:", error);
      throw new DatabaseError("Database error while deleting period", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, periodId: id },
      });
    }
  }

  /**
   * Get period list with filtering and pagination
   */
  public async getPeriodList(params: PeriodListQueryParams): Promise<{
    periods: PeriodInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "startTime",
        sortOrder = "asc",
        schoolId,
        section,
        durationMin,
        durationMax,
        startTimeFrom,
        startTimeTo,
        endTimeFrom,
        endTimeTo,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (section) {
        where.section = section;
      }

      // Duration range
      if (durationMin !== undefined || durationMax !== undefined) {
        where.duration = {};
        if (durationMin !== undefined) {
          where.duration[Op.gte] = durationMin;
        }
        if (durationMax !== undefined) {
          where.duration[Op.lte] = durationMax;
        }
      }

      // Time range filters
      if (startTimeFrom || startTimeTo) {
        where.startTime = {};
        if (startTimeFrom) {
          where.startTime[Op.gte] = startTimeFrom;
        }
        if (startTimeTo) {
          where.startTime[Op.lte] = startTimeTo;
        }
      }

      if (endTimeFrom || endTimeTo) {
        where.endTime = {};
        if (endTimeFrom) {
          where.endTime[Op.gte] = endTimeFrom;
        }
        if (endTimeTo) {
          where.endTime[Op.lte] = endTimeTo;
        }
      }

      // Search across name field
      if (search) {
        Object.assign(where, {
          name: { [Op.iLike]: `%${search}%` },
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get periods and total count
      const { count, rows } = await Period.findAndCountAll({
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
        periods: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting period list:", error);
      throw new DatabaseError("Database error while getting period list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find periods by school ID
   */
  public async findPeriodsBySchool(
    schoolId: string
  ): Promise<PeriodInterface[]> {
    try {
      return await Period.findAll({
        where: { schoolId },
        order: [["startTime", "ASC"]],
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding periods by school:", error);
      throw new DatabaseError(
        "Database error while finding periods by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Get period statistics
   */
  public async getPeriodStatistics(): Promise<PeriodStatistics> {
    try {
      // Get total periods count
      const totalPeriods = await Period.count();

      // Get periods per school
      const periodsPerSchoolResult = await Period.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const periodsPerSchool: { [schoolId: string]: number } = {};
      periodsPerSchoolResult.forEach((result: any) => {
        periodsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get average duration
      const durationResult = (await Period.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("duration")), "avgDuration"],
        ],
        raw: true,
      })) as unknown as { avgDuration: string | null };

      // Get periods by section
      const periodsBySection = {
        morning: await Period.count({ where: { section: "morning" } }),
        afternoon: await Period.count({ where: { section: "afternoon" } }),
        evening: await Period.count({ where: { section: "evening" } }),
      };

      // Get earliest start time and latest end time
      const timeRangeResult = (await Period.findOne({
        attributes: [
          [Sequelize.fn("MIN", Sequelize.col("startTime")), "earliestStart"],
          [Sequelize.fn("MAX", Sequelize.col("endTime")), "latestEnd"],
        ],
        raw: true,
      })) as unknown as { earliestStart: string; latestEnd: string };

      return {
        totalPeriods,
        periodsPerSchool,
        averageDuration:
          durationResult && durationResult.avgDuration
            ? parseFloat(durationResult.avgDuration) || 0
            : 0,
        periodsBySection,
        earliestStartTime: timeRangeResult?.earliestStart || "00:00",
        latestEndTime: timeRangeResult?.latestEnd || "23:59",
      };
    } catch (error) {
      logger.error("Error getting period statistics:", error);
      throw new DatabaseError(
        "Database error while getting period statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple periods at once
   */
  public async createPeriodsBulk(
    periodsData: CreatePeriodDTO[],
    transaction?: Transaction
  ): Promise<PeriodInterface[]> {
    try {
      // Create all periods
      const createdPeriods = await Period.bulkCreate(periodsData as any, {
        transaction,
      });

      // Return the created periods
      return createdPeriods;
    } catch (error) {
      logger.error("Error bulk creating periods:", error);
      throw new DatabaseError("Database error while bulk creating periods", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple periods at once
   */
  public async deletePeriodsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Period.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting periods:", error);
      throw new DatabaseError("Database error while bulk deleting periods", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          periodIds: ids,
        },
      });
    }
  }

  /**
   * Check for overlapping periods in the same school
   */
  public async findOverlappingPeriods(
    schoolId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<PeriodInterface[]> {
    try {
      // Convert string times to minutes for comparison
      const convertToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const startMinutes = convertToMinutes(startTime);
      const endMinutes = convertToMinutes(endTime);

      // Get all periods for this school
      const schoolPeriods = await Period.findAll({
        where: {
          schoolId,
          ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
        },
      });

      // Filter for overlapping periods
      const overlapping = schoolPeriods.filter((period) => {
        const periodStartMinutes = convertToMinutes(period.startTime);
        const periodEndMinutes = convertToMinutes(period.endTime);

        // Check for overlap
        return (
          startMinutes < periodEndMinutes && endMinutes > periodStartMinutes
        );
      });

      return overlapping;
    } catch (error) {
      logger.error("Error finding overlapping periods:", error);
      throw new DatabaseError(
        "Database error while finding overlapping periods",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            schoolId,
            startTime,
            endTime,
          },
        }
      );
    }
  }

  /**
   * Check if a period with the given name already exists in the school
   */
  public async findByNameAndSchool(
    name: string,
    schoolId: string,
    excludeId?: string
  ): Promise<PeriodInterface | null> {
    try {
      return await Period.findOne({
        where: {
          name,
          schoolId,
          ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
        },
      });
    } catch (error) {
      logger.error("Error finding period by name and school:", error);
      throw new DatabaseError(
        "Database error while finding period by name and school",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            name,
            schoolId,
          },
        }
      );
    }
  }
}

// Create and export repository instance
export default new PeriodRepository();
