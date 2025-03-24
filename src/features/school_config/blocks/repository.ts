import { IBlockRepository } from "./interfaces/services";
import { BlockInterface, BlockStatistics } from "./interfaces/interfaces";
import Block from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import { BlockListQueryParams, CreateBlockDTO, UpdateBlockDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BlockRepository implements IBlockRepository {
  /**
   * Find a block by ID
   */
  public async findBlockById(id: string): Promise<BlockInterface | null> {
    try {
      return await Block.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding block by ID:", error);
      throw new DatabaseError("Database error while finding block", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, blockId: id },
      });
    }
  }

  /**
   * Create a new block
   */
  public async createBlock(
    blockData: CreateBlockDTO,
    transaction?: Transaction
  ): Promise<BlockInterface> {
    try {
      return await Block.create(blockData as any, { transaction });
    } catch (error) {
      logger.error("Error creating block:", error);
      throw new DatabaseError("Database error while creating block", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a block
   */
  public async updateBlock(
    id: string,
    blockData: UpdateBlockDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Block.update(blockData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating block:", error);
      throw new DatabaseError("Database error while updating block", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, blockId: id },
      });
    }
  }

  /**
   * Delete a block
   */
  public async deleteBlock(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Block.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting block:", error);
      throw new DatabaseError("Database error while deleting block", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, blockId: id },
      });
    }
  }

  /**
   * Get block list with filtering and pagination
   */
  public async getBlockList(params: BlockListQueryParams): Promise<{
    blocks: BlockInterface[];
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
        status,
        yearBuiltMin,
        yearBuiltMax,
        minClassrooms,
        maxClassrooms,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (status) {
        where.status = status;
      }

      // Year built range
      if (yearBuiltMin !== undefined || yearBuiltMax !== undefined) {
        where.yearBuilt = {};
        if (yearBuiltMin !== undefined) {
          where.yearBuilt[Op.gte] = yearBuiltMin;
        }
        if (yearBuiltMax !== undefined) {
          where.yearBuilt[Op.lte] = yearBuiltMax;
        }
      }

      // Classrooms range
      if (minClassrooms !== undefined || maxClassrooms !== undefined) {
        where.numberOfClassrooms = {};
        if (minClassrooms !== undefined) {
          where.numberOfClassrooms[Op.gte] = minClassrooms;
        }
        if (maxClassrooms !== undefined) {
          where.numberOfClassrooms[Op.lte] = maxClassrooms;
        }
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { details: { [Op.iLike]: `%${search}%` } },
            { location: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get blocks and total count
      const { count, rows } = await Block.findAndCountAll({
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
        blocks: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting block list:", error);
      throw new DatabaseError("Database error while getting block list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find blocks by school ID
   */
  public async findBlocksBySchool(schoolId: string): Promise<BlockInterface[]> {
    try {
      return await Block.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding blocks by school:", error);
      throw new DatabaseError("Database error while finding blocks by school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
      });
    }
  }

  /**
   * Get block statistics
   */
  public async getBlockStatistics(): Promise<BlockStatistics> {
    try {
      // Get total blocks count
      const totalBlocks = await Block.count();

      // Get blocks per school
      const blocksPerSchoolResult = await Block.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const blocksPerSchool: { [schoolId: string]: number } = {};
      blocksPerSchoolResult.forEach((result: any) => {
        blocksPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get total classrooms and average per block
      const totalClassroomsResult = await Block.sum("numberOfClassrooms");
      const totalClassrooms = totalClassroomsResult || 0;
      const averageClassroomsPerBlock =
        totalBlocks > 0 ? totalClassrooms / totalBlocks : 0;

      // Get blocks by status
      const blocksByStatusResult = await Block.findAll({
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

      const blocksByStatus: { [status: string]: number } = {};
      blocksByStatusResult.forEach((result: any) => {
        if (result.status) {
          blocksByStatus[result.status] = parseInt(result.count, 10);
        }
      });

      // Get oldest block
      const oldestBlockResult = await Block.findOne({
        where: {
          yearBuilt: {
            [Op.ne]: null,
          },
        },
        order: [["yearBuilt", "ASC"]],
        attributes: ["id", "name", "yearBuilt"],
        raw: true,
      });

      // Get newest block
      const newestBlockResult = await Block.findOne({
        where: {
          yearBuilt: {
            [Op.ne]: null,
          },
        },
        order: [["yearBuilt", "DESC"]],
        attributes: ["id", "name", "yearBuilt"],
        raw: true,
      });

      return {
        totalBlocks,
        blocksPerSchool,
        totalClassrooms,
        averageClassroomsPerBlock,
        blocksByStatus,
        oldestBlock: oldestBlockResult as any,
        newestBlock: newestBlockResult as any,
      };
    } catch (error) {
      logger.error("Error getting block statistics:", error);
      throw new DatabaseError("Database error while getting block statistics", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Create multiple blocks at once
   */
  public async createBlocksBulk(
    blocksData: CreateBlockDTO[],
    transaction?: Transaction
  ): Promise<BlockInterface[]> {
    try {
      // Create all blocks
      const createdBlocks = await Block.bulkCreate(blocksData as any, {
        transaction,
      });

      // Return the created blocks
      return createdBlocks;
    } catch (error) {
      logger.error("Error bulk creating blocks:", error);
      throw new DatabaseError("Database error while bulk creating blocks", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple blocks at once
   */
  public async deleteBlocksBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Block.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting blocks:", error);
      throw new DatabaseError("Database error while bulk deleting blocks", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          blockIds: ids,
        },
      });
    }
  }
}

// Create and export repository instance
export default new BlockRepository();
