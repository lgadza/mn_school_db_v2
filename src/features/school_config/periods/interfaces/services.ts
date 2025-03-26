import { PeriodInterface, PeriodStatistics } from "./interfaces";
import {
  CreatePeriodDTO,
  PeriodDetailDTO,
  PeriodListQueryParams,
  PaginatedPeriodListDTO,
  UpdatePeriodDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Period repository interface
 * Defines data access methods for periods
 */
export interface IPeriodRepository {
  /**
   * Find a period by ID
   */
  findPeriodById(id: string): Promise<PeriodInterface | null>;

  /**
   * Create a new period
   */
  createPeriod(
    periodData: CreatePeriodDTO,
    transaction?: Transaction
  ): Promise<PeriodInterface>;

  /**
   * Update a period
   */
  updatePeriod(
    id: string,
    periodData: UpdatePeriodDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a period
   */
  deletePeriod(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get period list with filtering and pagination
   */
  getPeriodList(params: PeriodListQueryParams): Promise<{
    periods: PeriodInterface[];
    total: number;
  }>;

  /**
   * Find periods by school ID
   */
  findPeriodsBySchool(schoolId: string): Promise<PeriodInterface[]>;

  /**
   * Get period statistics
   */
  getPeriodStatistics(): Promise<PeriodStatistics>;

  /**
   * Create multiple periods at once
   */
  createPeriodsBulk(
    periodsData: CreatePeriodDTO[],
    transaction?: Transaction
  ): Promise<PeriodInterface[]>;

  /**
   * Delete multiple periods at once
   */
  deletePeriodsBulk(ids: string[], transaction?: Transaction): Promise<number>;

  /**
   * Check for overlapping periods in the same school
   */
  findOverlappingPeriods(
    schoolId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<PeriodInterface[]>;

  /**
   * Check if a period with the given name already exists in the school
   */
  findByNameAndSchool(
    name: string,
    schoolId: string,
    excludeId?: string
  ): Promise<PeriodInterface | null>;
}

/**
 * Period service interface
 * Defines business logic methods for periods
 */
export interface IPeriodService {
  /**
   * Get period by ID
   */
  getPeriodById(id: string): Promise<PeriodDetailDTO>;

  /**
   * Create a new period
   */
  createPeriod(periodData: CreatePeriodDTO): Promise<PeriodDetailDTO>;

  /**
   * Update a period
   */
  updatePeriod(
    id: string,
    periodData: UpdatePeriodDTO
  ): Promise<PeriodDetailDTO>;

  /**
   * Delete a period
   */
  deletePeriod(id: string): Promise<boolean>;

  /**
   * Get paginated period list
   */
  getPeriodList(params: PeriodListQueryParams): Promise<PaginatedPeriodListDTO>;

  /**
   * Get periods by school
   */
  getPeriodsBySchool(schoolId: string): Promise<PeriodDetailDTO[]>;

  /**
   * Validate period data
   */
  validatePeriodData(
    periodData: CreatePeriodDTO | UpdatePeriodDTO,
    periodId?: string
  ): Promise<boolean>;

  /**
   * Get period statistics
   */
  getPeriodStatistics(): Promise<PeriodStatistics>;

  /**
   * Create multiple periods at once
   */
  createPeriodsBulk(periodsData: CreatePeriodDTO[]): Promise<PeriodDetailDTO[]>;

  /**
   * Delete multiple periods at once
   */
  deletePeriodsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
