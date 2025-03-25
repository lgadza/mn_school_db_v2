import { BehaviorInterface, BehaviorStatistics } from "./interfaces";
import {
  CreateBehaviorDTO,
  BehaviorDetailDTO,
  BehaviorListQueryParams,
  PaginatedBehaviorListDTO,
  UpdateBehaviorDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Behavior repository interface
 * Defines data access methods for behaviors
 */
export interface IBehaviorRepository {
  /**
   * Find a behavior by ID
   */
  findBehaviorById(id: string): Promise<BehaviorInterface | null>;

  /**
   * Create a new behavior
   */
  createBehavior(
    behaviorData: CreateBehaviorDTO,
    transaction?: Transaction
  ): Promise<BehaviorInterface>;

  /**
   * Update a behavior
   */
  updateBehavior(
    id: string,
    behaviorData: UpdateBehaviorDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a behavior
   */
  deleteBehavior(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get behavior list with filtering and pagination
   */
  getBehaviorList(params: BehaviorListQueryParams): Promise<{
    behaviors: BehaviorInterface[];
    total: number;
  }>;

  /**
   * Find behaviors by school ID
   */
  findBehaviorsBySchool(schoolId: string): Promise<BehaviorInterface[]>;

  /**
   * Find behaviors by student ID
   */
  findBehaviorsByStudent(studentId: string): Promise<BehaviorInterface[]>;

  /**
   * Find behaviors by class ID
   */
  findBehaviorsByClass(classId: string): Promise<BehaviorInterface[]>;

  /**
   * Find behaviors by behavior type ID
   */
  findBehaviorsByBehaviorType(
    behaviorTypeId: string
  ): Promise<BehaviorInterface[]>;

  /**
   * Get behavior statistics
   */
  getBehaviorStatistics(): Promise<BehaviorStatistics>;

  /**
   * Create multiple behaviors at once
   */
  createBehaviorsBulk(
    behaviorsData: CreateBehaviorDTO[],
    transaction?: Transaction
  ): Promise<BehaviorInterface[]>;

  /**
   * Delete multiple behaviors at once
   */
  deleteBehaviorsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number>;
}

/**
 * Behavior service interface
 * Defines business logic methods for behaviors
 */
export interface IBehaviorService {
  /**
   * Get behavior by ID
   */
  getBehaviorById(id: string): Promise<BehaviorDetailDTO>;

  /**
   * Create a new behavior
   */
  createBehavior(behaviorData: CreateBehaviorDTO): Promise<BehaviorDetailDTO>;

  /**
   * Update a behavior
   */
  updateBehavior(
    id: string,
    behaviorData: UpdateBehaviorDTO
  ): Promise<BehaviorDetailDTO>;

  /**
   * Delete a behavior
   */
  deleteBehavior(id: string): Promise<boolean>;

  /**
   * Get paginated behavior list
   */
  getBehaviorList(
    params: BehaviorListQueryParams
  ): Promise<PaginatedBehaviorListDTO>;

  /**
   * Get behaviors by school
   */
  getBehaviorsBySchool(schoolId: string): Promise<BehaviorDetailDTO[]>;

  /**
   * Get behaviors by student
   */
  getBehaviorsByStudent(studentId: string): Promise<BehaviorDetailDTO[]>;

  /**
   * Get behaviors by class
   */
  getBehaviorsByClass(classId: string): Promise<BehaviorDetailDTO[]>;

  /**
   * Get behaviors by behavior type
   */
  getBehaviorsByBehaviorType(
    behaviorTypeId: string
  ): Promise<BehaviorDetailDTO[]>;

  /**
   * Validate behavior data
   */
  validateBehaviorData(
    behaviorData: CreateBehaviorDTO | UpdateBehaviorDTO
  ): Promise<boolean>;

  /**
   * Get behavior statistics
   */
  getBehaviorStatistics(): Promise<BehaviorStatistics>;

  /**
   * Create multiple behaviors at once
   */
  createBehaviorsBulk(
    behaviorsData: CreateBehaviorDTO[]
  ): Promise<BehaviorDetailDTO[]>;

  /**
   * Delete multiple behaviors at once
   */
  deleteBehaviorsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
