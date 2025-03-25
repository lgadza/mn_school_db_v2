import { BehaviorTypeInterface, BehaviorTypeStatistics } from "./interfaces";
import {
  CreateBehaviorTypeDTO,
  BehaviorTypeDetailDTO,
  BehaviorTypeListQueryParams,
  PaginatedBehaviorTypeListDTO,
  UpdateBehaviorTypeDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * BehaviorType repository interface
 * Defines data access methods for behavior types
 */
export interface IBehaviorTypeRepository {
  /**
   * Find a behavior type by ID
   */
  findBehaviorTypeById(id: string): Promise<BehaviorTypeInterface | null>;

  /**
   * Create a new behavior type
   */
  createBehaviorType(
    behaviorTypeData: CreateBehaviorTypeDTO,
    transaction?: Transaction
  ): Promise<BehaviorTypeInterface>;

  /**
   * Update a behavior type
   */
  updateBehaviorType(
    id: string,
    behaviorTypeData: UpdateBehaviorTypeDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a behavior type
   */
  deleteBehaviorType(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get behavior type list with filtering and pagination
   */
  getBehaviorTypeList(params: BehaviorTypeListQueryParams): Promise<{
    behaviorTypes: BehaviorTypeInterface[];
    total: number;
  }>;

  /**
   * Find behavior types by school ID
   */
  findBehaviorTypesBySchool(schoolId: string): Promise<BehaviorTypeInterface[]>;

  /**
   * Find behavior types by category
   */
  findBehaviorTypesByCategory(
    category: "POSITIVE" | "NEGATIVE"
  ): Promise<BehaviorTypeInterface[]>;

  /**
   * Get behavior type statistics
   */
  getBehaviorTypeStatistics(): Promise<BehaviorTypeStatistics>;

  /**
   * Create multiple behavior types at once
   */
  createBehaviorTypesBulk(
    behaviorTypesData: CreateBehaviorTypeDTO[],
    transaction?: Transaction
  ): Promise<BehaviorTypeInterface[]>;

  /**
   * Delete multiple behavior types at once
   */
  deleteBehaviorTypesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number>;
}

/**
 * BehaviorType service interface
 * Defines business logic methods for behavior types
 */
export interface IBehaviorTypeService {
  /**
   * Get behavior type by ID
   */
  getBehaviorTypeById(id: string): Promise<BehaviorTypeDetailDTO>;

  /**
   * Create a new behavior type
   */
  createBehaviorType(
    behaviorTypeData: CreateBehaviorTypeDTO
  ): Promise<BehaviorTypeDetailDTO>;

  /**
   * Update a behavior type
   */
  updateBehaviorType(
    id: string,
    behaviorTypeData: UpdateBehaviorTypeDTO
  ): Promise<BehaviorTypeDetailDTO>;

  /**
   * Delete a behavior type
   */
  deleteBehaviorType(id: string): Promise<boolean>;

  /**
   * Get paginated behavior type list
   */
  getBehaviorTypeList(
    params: BehaviorTypeListQueryParams
  ): Promise<PaginatedBehaviorTypeListDTO>;

  /**
   * Get behavior types by school
   */
  getBehaviorTypesBySchool(schoolId: string): Promise<BehaviorTypeDetailDTO[]>;

  /**
   * Get behavior types by category
   */
  getBehaviorTypesByCategory(
    category: "POSITIVE" | "NEGATIVE"
  ): Promise<BehaviorTypeDetailDTO[]>;

  /**
   * Validate behavior type data
   */
  validateBehaviorTypeData(
    behaviorTypeData: CreateBehaviorTypeDTO | UpdateBehaviorTypeDTO
  ): Promise<boolean>;

  /**
   * Get behavior type statistics
   */
  getBehaviorTypeStatistics(): Promise<BehaviorTypeStatistics>;

  /**
   * Create multiple behavior types at once
   */
  createBehaviorTypesBulk(
    behaviorTypesData: CreateBehaviorTypeDTO[]
  ): Promise<BehaviorTypeDetailDTO[]>;

  /**
   * Delete multiple behavior types at once
   */
  deleteBehaviorTypesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
