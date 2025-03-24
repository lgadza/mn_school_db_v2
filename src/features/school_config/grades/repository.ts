import { IGradeRepository } from "./interfaces/services";
import { GradeInterface, GradeStatistics } from "./interfaces/interfaces";
import Grade from "./model";
import School from "../../schools/model";
import Teacher from "../../teachers/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import { GradeListQueryParams, CreateGradeDTO, UpdateGradeDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class GradeRepository implements IGradeRepository {
  /**
   * Find a grade by ID
   */
  public async findGradeById(id: string): Promise<GradeInterface | null> {
    try {
      return await Grade.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Teacher,
            as: "teacher",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding grade by ID:", error);
      throw new DatabaseError("Database error while finding grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId: id },
      });
    }
  }

  /**
   * Create a new grade
   */
  public async createGrade(
    gradeData: CreateGradeDTO,
    transaction?: Transaction
  ): Promise<GradeInterface> {
    try {
      return await Grade.create(gradeData as any, { transaction });
    } catch (error) {
      logger.error("Error creating grade:", error);
      throw new DatabaseError("Database error while creating grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a grade
   */
  public async updateGrade(
    id: string,
    gradeData: UpdateGradeDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Grade.update(gradeData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating grade:", error);
      throw new DatabaseError("Database error while updating grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId: id },
      });
    }
  }

  /**
   * Delete a grade
   */
  public async deleteGrade(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Grade.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting grade:", error);
      throw new DatabaseError("Database error while deleting grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId: id },
      });
    }
  }

  /**
   * Get grade list with filtering and pagination
   */
  public async getGradeList(params: GradeListQueryParams): Promise<{
    grades: GradeInterface[];
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
        teacherId,
        applicationOpen,
        minAgeFrom,
        minAgeTo,
        maxAgeFrom,
        maxAgeTo,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (teacherId) {
        where.teacherId = teacherId;
      }

      if (applicationOpen !== undefined) {
        where.applicationOpen = applicationOpen;
      }

      // Min age range
      if (minAgeFrom !== undefined || minAgeTo !== undefined) {
        where.minAge = {};
        if (minAgeFrom !== undefined) {
          where.minAge[Op.gte] = minAgeFrom;
        }
        if (minAgeTo !== undefined) {
          where.minAge[Op.lte] = minAgeTo;
        }
      }

      // Max age range
      if (maxAgeFrom !== undefined || maxAgeTo !== undefined) {
        where.maxAge = {};
        if (maxAgeFrom !== undefined) {
          where.maxAge[Op.gte] = maxAgeFrom;
        }
        if (maxAgeTo !== undefined) {
          where.maxAge[Op.lte] = maxAgeTo;
        }
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { details: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get grades and total count
      const { count, rows } = await Grade.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Teacher,
            as: "teacher",
          },
        ],
      });

      return {
        grades: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting grade list:", error);
      throw new DatabaseError("Database error while getting grade list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find grades by school ID
   */
  public async findGradesBySchool(schoolId: string): Promise<GradeInterface[]> {
    try {
      return await Grade.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Teacher,
            as: "teacher",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding grades by school:", error);
      throw new DatabaseError("Database error while finding grades by school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
      });
    }
  }

  /**
   * Find grades by teacher ID
   */
  public async findGradesByTeacher(
    teacherId: string
  ): Promise<GradeInterface[]> {
    try {
      return await Grade.findAll({
        where: { teacherId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Teacher,
            as: "teacher",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding grades by teacher:", error);
      throw new DatabaseError(
        "Database error while finding grades by teacher",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId },
        }
      );
    }
  }

  /**
   * Get grade statistics
   */
  public async getGradeStatistics(): Promise<GradeStatistics> {
    try {
      // Get total grades count
      const totalGrades = await Grade.count();

      // Get grades per school
      const gradesPerSchoolResult = await Grade.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const gradesPerSchool: { [schoolId: string]: number } = {};
      gradesPerSchoolResult.forEach((result: any) => {
        gradesPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get open applications count
      const openApplicationsCount = await Grade.count({
        where: { applicationOpen: true },
      });

      // Get average min age - using proper typing for aggregate results
      const minAgeResult = (await Grade.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("minAge")), "avgMinAge"],
        ],
        raw: true,
      })) as unknown as { avgMinAge: string | null };

      // Get average max age - using proper typing for aggregate results
      const maxAgeResult = (await Grade.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("maxAge")), "avgMaxAge"],
        ],
        raw: true,
      })) as unknown as { avgMaxAge: string | null };

      // Get grades with teachers count
      const gradesWithTeachers = await Grade.count({
        where: {
          teacherId: {
            [Op.ne]: null,
          },
        },
      });

      return {
        totalGrades,
        gradesPerSchool,
        openApplicationsCount,
        averageMinAge:
          minAgeResult && minAgeResult.avgMinAge
            ? parseFloat(minAgeResult.avgMinAge) || 0
            : 0,
        averageMaxAge:
          maxAgeResult && maxAgeResult.avgMaxAge
            ? parseFloat(maxAgeResult.avgMaxAge) || 0
            : 0,
        gradesWithTeachers,
      };
    } catch (error) {
      logger.error("Error getting grade statistics:", error);
      throw new DatabaseError("Database error while getting grade statistics", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Create multiple grades at once
   */
  public async createGradesBulk(
    gradesData: CreateGradeDTO[],
    transaction?: Transaction
  ): Promise<GradeInterface[]> {
    try {
      // Create all grades
      const createdGrades = await Grade.bulkCreate(gradesData as any, {
        transaction,
      });

      // Return the created grades
      return createdGrades;
    } catch (error) {
      logger.error("Error bulk creating grades:", error);
      throw new DatabaseError("Database error while bulk creating grades", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple grades at once
   */
  public async deleteGradesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Grade.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting grades:", error);
      throw new DatabaseError("Database error while bulk deleting grades", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          gradeIds: ids,
        },
      });
    }
  }
}

// Create and export repository instance
export default new GradeRepository();
