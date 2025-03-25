import { IBehaviorTypeRepository } from "./interfaces/services";
import {
  BehaviorTypeInterface,
  BehaviorTypeStatistics,
} from "./interfaces/interfaces";
import BehaviorType from "./model";
import School from "../../schools/model";
import Behavior from "../behaviors/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  BehaviorTypeListQueryParams,
  CreateBehaviorTypeDTO,
  UpdateBehaviorTypeDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BehaviorTypeRepository implements IBehaviorTypeRepository {
  /**
   * Find a behavior type by ID
   */
  public async findBehaviorTypeById(
    id: string
  ): Promise<BehaviorTypeInterface | null> {
    try {
      return await BehaviorType.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behavior type by ID:", error);
      throw new DatabaseError("Database error while finding behavior type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorTypeId: id },
      });
    }
  }

  /**
   * Create a new behavior type
   */
  public async createBehaviorType(
    behaviorTypeData: CreateBehaviorTypeDTO,
    transaction?: Transaction
  ): Promise<BehaviorTypeInterface> {
    try {
      return await BehaviorType.create(behaviorTypeData as any, {
        transaction,
      });
    } catch (error) {
      logger.error("Error creating behavior type:", error);
      throw new DatabaseError("Database error while creating behavior type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a behavior type
   */
  public async updateBehaviorType(
    id: string,
    behaviorTypeData: UpdateBehaviorTypeDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await BehaviorType.update(behaviorTypeData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating behavior type:", error);
      throw new DatabaseError("Database error while updating behavior type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorTypeId: id },
      });
    }
  }

  /**
   * Delete a behavior type
   */
  public async deleteBehaviorType(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await BehaviorType.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting behavior type:", error);
      throw new DatabaseError("Database error while deleting behavior type", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorTypeId: id },
      });
    }
  }

  /**
   * Get behavior type list with filtering and pagination
   */
  public async getBehaviorTypeList(
    params: BehaviorTypeListQueryParams
  ): Promise<{
    behaviorTypes: BehaviorTypeInterface[];
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
        category,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (category) {
        where.category = category;
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [{ description: { [Op.iLike]: `%${search}%` } }],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get behavior types and total count
      const { count, rows } = await BehaviorType.findAndCountAll({
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
        behaviorTypes: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting behavior type list:", error);
      throw new DatabaseError(
        "Database error while getting behavior type list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
        }
      );
    }
  }

  /**
   * Find behavior types by school ID
   */
  public async findBehaviorTypesBySchool(
    schoolId: string
  ): Promise<BehaviorTypeInterface[]> {
    try {
      return await BehaviorType.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behavior types by school:", error);
      throw new DatabaseError(
        "Database error while finding behavior types by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find behavior types by category
   */
  public async findBehaviorTypesByCategory(
    category: "POSITIVE" | "NEGATIVE"
  ): Promise<BehaviorTypeInterface[]> {
    try {
      return await BehaviorType.findAll({
        where: { category },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behavior types by category:", error);
      throw new DatabaseError(
        "Database error while finding behavior types by category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, category },
        }
      );
    }
  }

  /**
   * Get behavior type statistics
   */
  public async getBehaviorTypeStatistics(): Promise<BehaviorTypeStatistics> {
    try {
      // Get total behavior types count
      const totalBehaviorTypes = await BehaviorType.count();

      // Get behavior types per school
      const behaviorTypesPerSchoolResult = await BehaviorType.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const behaviorTypesPerSchool: { [schoolId: string]: number } = {};
      behaviorTypesPerSchoolResult.forEach((result: any) => {
        behaviorTypesPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get behavior types by category
      const positiveCount = await BehaviorType.count({
        where: { category: "POSITIVE" },
      });

      const negativeCount = await BehaviorType.count({
        where: { category: "NEGATIVE" },
      });

      // Get most commonly used behavior types (based on behaviors recorded)
      const mostCommonBehaviorTypesResult = (await Behavior.findAll({
        attributes: [
          "behaviorTypeId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["behaviorTypeId"],
        order: [[Sequelize.literal("count"), "DESC"]],
        limit: 10,
        raw: true,
      })) as unknown as Array<{ behaviorTypeId: string; count: string }>;

      const behaviorTypeIds = mostCommonBehaviorTypesResult.map(
        (result: any) => result.behaviorTypeId
      );

      // Get the details of these behavior types
      const mostCommonBehaviorTypes: Array<{
        id: string;
        description: string;
        category: string;
        count: number;
      }> = [];

      if (behaviorTypeIds.length > 0) {
        const behaviorTypeDetails = await BehaviorType.findAll({
          where: {
            id: {
              [Op.in]: behaviorTypeIds,
            },
          },
          raw: true,
        });

        // Map the count to each behavior type detail
        behaviorTypeDetails.forEach((detail: any) => {
          const matchingResult = mostCommonBehaviorTypesResult.find(
            (result: any) => result.behaviorTypeId === detail.id
          );
          if (matchingResult) {
            mostCommonBehaviorTypes.push({
              id: detail.id,
              description: detail.description,
              category: detail.category,
              count: parseInt(matchingResult.count, 10),
            });
          }
        });
      }

      return {
        totalBehaviorTypes,
        behaviorTypesPerSchool,
        behaviorTypesByCategory: {
          POSITIVE: positiveCount,
          NEGATIVE: negativeCount,
        },
        mostCommonBehaviorTypes,
      };
    } catch (error) {
      logger.error("Error getting behavior type statistics:", error);
      throw new DatabaseError(
        "Database error while getting behavior type statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple behavior types at once
   */
  public async createBehaviorTypesBulk(
    behaviorTypesData: CreateBehaviorTypeDTO[],
    transaction?: Transaction
  ): Promise<BehaviorTypeInterface[]> {
    try {
      // Create all behavior types
      const createdBehaviorTypes = await BehaviorType.bulkCreate(
        behaviorTypesData as any,
        {
          transaction,
        }
      );

      // Return the created behavior types
      return createdBehaviorTypes;
    } catch (error) {
      logger.error("Error bulk creating behavior types:", error);
      throw new DatabaseError(
        "Database error while bulk creating behavior types",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Delete multiple behavior types at once
   */
  public async deleteBehaviorTypesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await BehaviorType.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting behavior types:", error);
      throw new DatabaseError(
        "Database error while bulk deleting behavior types",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            behaviorTypeIds: ids,
          },
        }
      );
    }
  }
}

// Create and export repository instance
export default new BehaviorTypeRepository();
