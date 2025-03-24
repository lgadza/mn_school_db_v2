import { IBlockService, IBlockRepository } from "./interfaces/services";
import {
  BlockDetailDTO,
  CreateBlockDTO,
  UpdateBlockDTO,
  PaginatedBlockListDTO,
  BlockListQueryParams,
  BlockDTOMapper,
} from "./dto";
import { BlockStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import schoolService from "../../schools/service";
import db from "@/config/database";

export class BlockService implements IBlockService {
  private repository: IBlockRepository;
  private readonly CACHE_PREFIX = "block:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IBlockRepository) {
    this.repository = repository;
  }

  /**
   * Get block by ID
   */
  public async getBlockById(id: string): Promise<BlockDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedBlock = await cache.get(cacheKey);

      if (cachedBlock) {
        return JSON.parse(cachedBlock);
      }

      // Get from database if not in cache
      const block = await this.repository.findBlockById(id);
      if (!block) {
        throw new NotFoundError(`Block with ID ${id} not found`);
      }

      // Map to DTO with school
      const blockDTO = BlockDTOMapper.toDetailDTO(block);

      // If the block has a school, map it to a school DTO
      if (block.school) {
        blockDTO.school = SchoolDTOMapper.toDetailDTO(block.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(blockDTO), this.CACHE_TTL);

      return blockDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBlockById service:", error);
      throw new AppError("Failed to get block");
    }
  }

  /**
   * Create a new block
   */
  public async createBlock(blockData: CreateBlockDTO): Promise<BlockDetailDTO> {
    try {
      // Validate data
      await this.validateBlockData(blockData);

      // Check if school exists
      await schoolService.getSchoolById(blockData.schoolId);

      // Create the block
      const newBlock = await this.repository.createBlock(blockData);

      // Get the complete block with school
      const block = await this.repository.findBlockById(newBlock.id);
      if (!block) {
        throw new AppError("Failed to retrieve created block");
      }

      // Map to DTO with school
      const blockDTO = BlockDTOMapper.toDetailDTO(block);

      if (block.school) {
        blockDTO.school = SchoolDTOMapper.toDetailDTO(block.school);
      }

      return blockDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBlock service:", error);
      throw new AppError("Failed to create block");
    }
  }

  /**
   * Update a block
   */
  public async updateBlock(
    id: string,
    blockData: UpdateBlockDTO
  ): Promise<BlockDetailDTO> {
    try {
      // Check if block exists
      const existingBlock = await this.repository.findBlockById(id);
      if (!existingBlock) {
        throw new NotFoundError(`Block with ID ${id} not found`);
      }

      // Validate data
      await this.validateBlockData(blockData);

      // Check if school exists if schoolId is provided
      if (blockData.schoolId) {
        await schoolService.getSchoolById(blockData.schoolId);
      }

      // Update block
      await this.repository.updateBlock(id, blockData);

      // Clear cache
      await this.clearBlockCache(id);

      // Get the updated block
      return this.getBlockById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateBlock service:", error);
      throw new AppError("Failed to update block");
    }
  }

  /**
   * Delete a block
   */
  public async deleteBlock(id: string): Promise<boolean> {
    try {
      // Check if block exists
      const existingBlock = await this.repository.findBlockById(id);
      if (!existingBlock) {
        throw new NotFoundError(`Block with ID ${id} not found`);
      }

      // Delete the block
      const result = await this.repository.deleteBlock(id);

      // Clear cache
      await this.clearBlockCache(id);

      // Clear school blocks cache
      await cache.del(`${this.CACHE_PREFIX}school:${existingBlock.schoolId}`);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteBlock service:", error);
      throw new AppError("Failed to delete block");
    }
  }

  /**
   * Get paginated block list
   */
  public async getBlockList(
    params: BlockListQueryParams
  ): Promise<PaginatedBlockListDTO> {
    try {
      const { blocks, total } = await this.repository.getBlockList(params);

      // Map to DTOs with schools
      const blockDTOs = blocks.map((block) => {
        const blockDTO = BlockDTOMapper.toDetailDTO(block);

        if (block.school) {
          blockDTO.school = SchoolDTOMapper.toDetailDTO(block.school);
        }

        return blockDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        blocks: blockDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBlockList service:", error);
      throw new AppError("Failed to get block list");
    }
  }

  /**
   * Get blocks by school
   */
  public async getBlocksBySchool(schoolId: string): Promise<BlockDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedBlocks = await cache.get(cacheKey);

      if (cachedBlocks) {
        return JSON.parse(cachedBlocks);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const blocks = await this.repository.findBlocksBySchool(schoolId);

      // Map to DTOs with schools
      const blockDTOs = blocks.map((block) => {
        const blockDTO = BlockDTOMapper.toDetailDTO(block);

        if (block.school) {
          blockDTO.school = SchoolDTOMapper.toDetailDTO(block.school);
        }

        return blockDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(blockDTOs), this.CACHE_TTL);

      return blockDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBlocksBySchool service:", error);
      throw new AppError("Failed to get blocks by school");
    }
  }

  /**
   * Validate block data
   */
  public async validateBlockData(
    blockData: CreateBlockDTO | UpdateBlockDTO
  ): Promise<boolean> {
    // Validate number of classrooms is a positive integer
    if (
      "numberOfClassrooms" in blockData &&
      blockData.numberOfClassrooms !== undefined
    ) {
      if (
        blockData.numberOfClassrooms < 1 ||
        !Number.isInteger(blockData.numberOfClassrooms)
      ) {
        throw new BadRequestError(
          "Number of classrooms must be a positive integer"
        );
      }
    }

    // Validate year built is in acceptable range
    if (
      "yearBuilt" in blockData &&
      blockData.yearBuilt !== null &&
      blockData.yearBuilt !== undefined
    ) {
      const currentYear = new Date().getFullYear();
      if (
        blockData.yearBuilt < 1800 ||
        blockData.yearBuilt > currentYear + 10 ||
        !Number.isInteger(blockData.yearBuilt)
      ) {
        throw new BadRequestError(
          `Year built must be a whole number between 1800 and ${
            currentYear + 10
          }`
        );
      }
    }

    // Validate status if provided
    if (
      "status" in blockData &&
      blockData.status !== null &&
      blockData.status !== undefined
    ) {
      const validStatuses = [
        "active",
        "inactive",
        "maintenance",
        "planned",
        "demolished",
      ];
      if (!validStatuses.includes(blockData.status)) {
        throw new BadRequestError(
          `Status must be one of: ${validStatuses.join(", ")}`
        );
      }
    }

    return true;
  }

  /**
   * Get block statistics
   */
  public async getBlockStatistics(): Promise<BlockStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getBlockStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBlockStatistics service:", error);
      throw new AppError("Failed to get block statistics");
    }
  }

  /**
   * Create multiple blocks at once
   */
  public async createBlocksBulk(
    blocksData: CreateBlockDTO[]
  ): Promise<BlockDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all block data
      for (const blockData of blocksData) {
        await this.validateBlockData(blockData);

        // Check if school exists
        await schoolService.getSchoolById(blockData.schoolId);
      }

      // Create blocks in bulk
      const newBlocks = await this.repository.createBlocksBulk(
        blocksData,
        transaction
      );

      await transaction.commit();

      // Get the complete blocks with schools
      const blockIds = newBlocks.map((block) => block.id);
      const detailedBlocks: BlockDetailDTO[] = [];

      for (const id of blockIds) {
        const block = await this.repository.findBlockById(id);
        if (block) {
          const blockDTO = BlockDTOMapper.toDetailDTO(block);

          if (block.school) {
            blockDTO.school = SchoolDTOMapper.toDetailDTO(block.school);
          }

          detailedBlocks.push(blockDTO);
        }
      }

      return detailedBlocks;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBlocksBulk service:", error);
      throw new AppError("Failed to create blocks in bulk");
    }
  }

  /**
   * Delete multiple blocks at once
   */
  public async deleteBlocksBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify blocks exist
      const blocks = await Promise.all(
        ids.map((id) => this.repository.findBlockById(id))
      );

      // Filter out any null results (blocks not found)
      const existingBlocks = blocks.filter((block) => block !== null);

      if (existingBlocks.length === 0) {
        throw new NotFoundError("None of the specified blocks were found");
      }

      // Delete blocks
      const deletedCount = await this.repository.deleteBlocksBulk(
        existingBlocks.map((block) => block!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted block
      for (const block of existingBlocks) {
        if (block) {
          await this.clearBlockCache(block.id);

          // Clear school blocks cache
          await cache.del(`${this.CACHE_PREFIX}school:${block.schoolId}`);
        }
      }

      return {
        success: true,
        count: deletedCount,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteBlocksBulk service:", error);
      throw new AppError("Failed to delete blocks in bulk");
    }
  }

  /**
   * Clear block cache
   */
  private async clearBlockCache(blockId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${blockId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new BlockService(repository);
