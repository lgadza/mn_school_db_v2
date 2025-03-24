import { RentalRuleInterface } from "./model";
import RentalRule from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  RentalRuleListQueryParams,
  CreateRentalRuleDTO,
  UpdateRentalRuleDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class RentalRuleRepository {
  /**
   * Find a rule by ID
   */
  public async findRuleById(id: string): Promise<RentalRuleInterface | null> {
    try {
      return await RentalRule.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding rental rule by ID:", error);
      throw new DatabaseError("Database error while finding rental rule", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, ruleId: id },
      });
    }
  }

  /**
   * Create a new rental rule
   */
  public async createRule(
    ruleData: CreateRentalRuleDTO,
    transaction?: Transaction
  ): Promise<RentalRuleInterface> {
    try {
      return await RentalRule.create(ruleData, { transaction });
    } catch (error) {
      logger.error("Error creating rental rule:", error);
      throw new DatabaseError("Database error while creating rental rule", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a rental rule
   */
  public async updateRule(
    id: string,
    ruleData: UpdateRentalRuleDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await RentalRule.update(ruleData, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating rental rule:", error);
      throw new DatabaseError("Database error while updating rental rule", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, ruleId: id },
      });
    }
  }

  /**
   * Delete a rental rule
   */
  public async deleteRule(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await RentalRule.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting rental rule:", error);
      throw new DatabaseError("Database error while deleting rental rule", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, ruleId: id },
      });
    }
  }

  /**
   * Get rule list with filtering and pagination
   */
  public async getRuleList(params: RentalRuleListQueryParams): Promise<{
    rules: RentalRuleInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "name",
        sortOrder = "asc",
        schoolId,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      if (schoolId) {
        where.schoolId = schoolId;
      }

      // Search by name
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get rules and total count
      const { count, rows } = await RentalRule.findAndCountAll({
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
        rules: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting rental rule list:", error);
      throw new DatabaseError("Database error while getting rental rule list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find rules by school ID
   */
  public async findRulesBySchool(
    schoolId: string,
    params: RentalRuleListQueryParams = {}
  ): Promise<{
    rules: RentalRuleInterface[];
    total: number;
  }> {
    try {
      return await this.getRuleList({
        ...params,
        schoolId,
      });
    } catch (error) {
      logger.error("Error finding rental rules by school:", error);
      throw new DatabaseError(
        "Database error while finding rental rules by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find default rule for a school
   */
  public async findDefaultRuleForSchool(
    schoolId: string
  ): Promise<RentalRuleInterface | null> {
    try {
      // Get the rule with the lowest maxBooksPerStudent (assuming it's the default)
      // This is a placeholder implementation - you might want to add a "isDefault" flag to rules
      return await RentalRule.findOne({
        where: { schoolId },
        order: [["maxBooksPerStudent", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding default rental rule for school:", error);
      throw new DatabaseError(
        "Database error while finding default rental rule",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }
}

// Create and export repository instance
export default new RentalRuleRepository();
