import { ISchoolFeeRepository } from "./interfaces/services";
import {
  SchoolFeeInterface,
  SchoolFeeStatistics,
} from "./interfaces/interfaces";
import SchoolFee from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  SchoolFeeListQueryParams,
  CreateSchoolFeeDTO,
  UpdateSchoolFeeDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SchoolFeeRepository implements ISchoolFeeRepository {
  /**
   * Find a school fee by ID
   */
  public async findSchoolFeeById(
    id: string
  ): Promise<SchoolFeeInterface | null> {
    try {
      return await SchoolFee.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding school fee by ID:", error);
      throw new DatabaseError("Database error while finding school fee", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolFeeId: id },
      });
    }
  }

  /**
   * Create a new school fee
   */
  public async createSchoolFee(
    schoolFeeData: CreateSchoolFeeDTO,
    transaction?: Transaction
  ): Promise<SchoolFeeInterface> {
    try {
      return await SchoolFee.create(schoolFeeData as any, { transaction });
    } catch (error) {
      logger.error("Error creating school fee:", error);
      throw new DatabaseError("Database error while creating school fee", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a school fee
   */
  public async updateSchoolFee(
    id: string,
    schoolFeeData: UpdateSchoolFeeDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await SchoolFee.update(schoolFeeData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating school fee:", error);
      throw new DatabaseError("Database error while updating school fee", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolFeeId: id },
      });
    }
  }

  /**
   * Delete a school fee
   */
  public async deleteSchoolFee(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await SchoolFee.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting school fee:", error);
      throw new DatabaseError("Database error while deleting school fee", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolFeeId: id },
      });
    }
  }

  /**
   * Get school fee list with filtering and pagination
   */
  public async getSchoolFeeList(params: SchoolFeeListQueryParams): Promise<{
    schoolFees: SchoolFeeInterface[];
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
        frequency,
        status,
        isOptional,
        minAmount,
        maxAmount,
        currency,
        appliesTo,
        discountEligible,
        taxable,
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

      if (frequency) {
        where.frequency = frequency;
      }

      if (status) {
        where.status = status;
      }

      if (isOptional !== undefined) {
        where.isOptional = isOptional;
      }

      if (currency) {
        where.currency = currency;
      }

      if (appliesTo) {
        where.appliesTo = appliesTo;
      }

      if (discountEligible !== undefined) {
        where.discountEligible = discountEligible;
      }

      if (taxable !== undefined) {
        where.taxable = taxable;
      }

      // Amount range filtering
      if (minAmount !== undefined || maxAmount !== undefined) {
        where.amount = {};

        if (minAmount !== undefined) {
          (where.amount as any)[Op.gte] = minAmount;
        }

        if (maxAmount !== undefined) {
          (where.amount as any)[Op.lte] = maxAmount;
        }
      }

      // Search across multiple fields
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

      // Get school fees and total count
      const { count, rows } = await SchoolFee.findAndCountAll({
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
        schoolFees: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting school fee list:", error);
      throw new DatabaseError("Database error while getting school fee list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find school fees by school ID
   */
  public async findSchoolFeesBySchool(
    schoolId: string
  ): Promise<SchoolFeeInterface[]> {
    try {
      return await SchoolFee.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding school fees by school:", error);
      throw new DatabaseError(
        "Database error while finding school fees by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Get school fee statistics
   */
  public async getSchoolFeeStatistics(): Promise<SchoolFeeStatistics> {
    try {
      // Get all fees for statistics
      const allFees = await SchoolFee.findAll({
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });

      // Initialize statistics object
      const statistics: SchoolFeeStatistics = {
        totalFees: allFees.length,
        feesPerSchool: {},
        feesByCategory: {},
        feesByFrequency: {},
        feesByStatus: {},
        averageAmount: 0,
        highestFee: {
          name: "",
          amount: 0,
          currency: "",
          schoolId: "",
        },
        lowestFee: {
          name: "",
          amount: Number.MAX_VALUE,
          currency: "",
          schoolId: "",
        },
      };

      // Process each fee for statistics
      let totalAmount = 0;

      allFees.forEach((fee) => {
        // Count fees per school
        if (!statistics.feesPerSchool[fee.schoolId]) {
          statistics.feesPerSchool[fee.schoolId] = 0;
        }
        statistics.feesPerSchool[fee.schoolId]++;

        // Count fees by category
        if (!statistics.feesByCategory[fee.category]) {
          statistics.feesByCategory[fee.category] = 0;
        }
        statistics.feesByCategory[fee.category]++;

        // Count fees by frequency
        if (!statistics.feesByFrequency[fee.frequency]) {
          statistics.feesByFrequency[fee.frequency] = 0;
        }
        statistics.feesByFrequency[fee.frequency]++;

        // Count fees by status
        if (!statistics.feesByStatus[fee.status]) {
          statistics.feesByStatus[fee.status] = 0;
        }
        statistics.feesByStatus[fee.status]++;

        // Track total amount for average calculation
        const amount = parseFloat(fee.amount.toString());
        totalAmount += amount;

        // Track highest fee
        if (amount > statistics.highestFee.amount) {
          statistics.highestFee = {
            name: fee.name,
            amount,
            currency: fee.currency,
            schoolId: fee.schoolId,
          };
        }

        // Track lowest fee
        if (amount < statistics.lowestFee.amount) {
          statistics.lowestFee = {
            name: fee.name,
            amount,
            currency: fee.currency,
            schoolId: fee.schoolId,
          };
        }
      });

      // Calculate average amount
      statistics.averageAmount =
        allFees.length > 0 ? totalAmount / allFees.length : 0;

      // Reset lowest fee if no fees found
      if (statistics.lowestFee.amount === Number.MAX_VALUE) {
        statistics.lowestFee = {
          name: "",
          amount: 0,
          currency: "",
          schoolId: "",
        };
      }

      return statistics;
    } catch (error) {
      logger.error("Error getting school fee statistics:", error);
      throw new DatabaseError(
        "Database error while getting school fee statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple school fees at once
   */
  public async createSchoolFeesBulk(
    schoolFeesData: CreateSchoolFeeDTO[],
    transaction?: Transaction
  ): Promise<SchoolFeeInterface[]> {
    try {
      return await SchoolFee.bulkCreate(schoolFeesData as any[], {
        transaction,
      });
    } catch (error) {
      logger.error("Error creating school fees in bulk:", error);
      throw new DatabaseError(
        "Database error while creating school fees in bulk",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Delete multiple school fees at once
   */
  public async deleteSchoolFeesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await SchoolFee.destroy({
        where: { id: { [Op.in]: ids } },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error deleting school fees in bulk:", error);
      throw new DatabaseError(
        "Database error while deleting school fees in bulk",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, ids },
        }
      );
    }
  }

  /**
   * Find school fees by category
   */
  public async findSchoolFeesByCategory(
    category: string
  ): Promise<SchoolFeeInterface[]> {
    try {
      return await SchoolFee.findAll({
        where: { category },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding school fees by category:", error);
      throw new DatabaseError(
        "Database error while finding school fees by category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, category },
        }
      );
    }
  }
}

// Create and export repository instance
export default new SchoolFeeRepository();
