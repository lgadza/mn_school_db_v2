import { BlockInterface, BlockStatistics } from "./interfaces";
import {
  CreateBlockDTO,
  BlockDetailDTO,
  BlockListQueryParams,
  PaginatedBlockListDTO,
  UpdateBlockDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Block repository interface
 * Defines data access methods for blocks
 */
export interface IBlockRepository {
  /**
   * Find a block by ID
   */
  findBlockById(id: string): Promise<BlockInterface | null>;

  /**
   * Create a new block
   */
  createBlock(
    blockData: CreateBlockDTO,
    transaction?: Transaction
  ): Promise<BlockInterface>;

  /**
   * Update a block
   */
  updateBlock(
    id: string,
    blockData: UpdateBlockDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a block
   */
  deleteBlock(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get block list with filtering and pagination
   */
  getBlockList(params: BlockListQueryParams): Promise<{
    blocks: BlockInterface[];
    total: number;
  }>;

  /**
   * Find blocks by school ID
   */
  findBlocksBySchool(schoolId: string): Promise<BlockInterface[]>;

  /**
   * Get block statistics
   */
  getBlockStatistics(): Promise<BlockStatistics>;

  /**
   * Create multiple blocks at once
   */
  createBlocksBulk(
    blocksData: CreateBlockDTO[],
    transaction?: Transaction
  ): Promise<BlockInterface[]>;

  /**
   * Delete multiple blocks at once
   */
  deleteBlocksBulk(ids: string[], transaction?: Transaction): Promise<number>;
}

/**
 * Block service interface
 * Defines business logic methods for blocks
 */
export interface IBlockService {
  /**
   * Get block by ID
   */
  getBlockById(id: string): Promise<BlockDetailDTO>;

  /**
   * Create a new block
   */
  createBlock(blockData: CreateBlockDTO): Promise<BlockDetailDTO>;

  /**
   * Update a block
   */
  updateBlock(id: string, blockData: UpdateBlockDTO): Promise<BlockDetailDTO>;

  /**
   * Delete a block
   */
  deleteBlock(id: string): Promise<boolean>;

  /**
   * Get paginated block list
   */
  getBlockList(params: BlockListQueryParams): Promise<PaginatedBlockListDTO>;

  /**
   * Get blocks by school
   */
  getBlocksBySchool(schoolId: string): Promise<BlockDetailDTO[]>;

  /**
   * Validate block data
   */
  validateBlockData(
    blockData: CreateBlockDTO | UpdateBlockDTO
  ): Promise<boolean>;

  /**
   * Get block statistics
   */
  getBlockStatistics(): Promise<BlockStatistics>;

  /**
   * Create multiple blocks at once
   */
  createBlocksBulk(blocksData: CreateBlockDTO[]): Promise<BlockDetailDTO[]>;

  /**
   * Delete multiple blocks at once
   */
  deleteBlocksBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
