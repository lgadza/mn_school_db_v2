import { SchoolFeeInterface, SchoolFeeStatistics } from "./interfaces";
import {
  CreateSchoolFeeDTO,
  SchoolFeeDetailDTO,
  SchoolFeeListQueryParams,
  PaginatedSchoolFeeListDTO,
  UpdateSchoolFeeDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * SchoolFee repository interface
 * Defines data access methods for school fees
 */
export interface ISchoolFeeRepository {
  /**
   * Find a school fee by ID
   */
  findSchoolFeeById(id: string): Promise<SchoolFeeInterface | null>;

  /**
   * Create a new school fee
   */
  createSchoolFee(
    schoolFeeData: CreateSchoolFeeDTO,
    transaction?: Transaction
  ): Promise<SchoolFeeInterface>;

  /**
   * Update a school fee
   */
  updateSchoolFee(
    id: string,
    schoolFeeData: UpdateSchoolFeeDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a school fee
   */
  deleteSchoolFee(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get school fee list with filtering and pagination
   */
  getSchoolFeeList(params: SchoolFeeListQueryParams): Promise<{
    schoolFees: SchoolFeeInterface[];
    total: number;
  }>;

  /**
   * Find school fees by school ID
   */
  findSchoolFeesBySchool(schoolId: string): Promise<SchoolFeeInterface[]>;

  /**
   * Get school fee statistics
   */
  getSchoolFeeStatistics(): Promise<SchoolFeeStatistics>;

  /**
   * Create multiple school fees at once
   */
  createSchoolFeesBulk(
    schoolFeesData: CreateSchoolFeeDTO[],
    transaction?: Transaction
  ): Promise<SchoolFeeInterface[]>;

  /**
   * Delete multiple school fees at once
   */
  deleteSchoolFeesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number>;

  /**
   * Find school fees by category
   */
  findSchoolFeesByCategory(category: string): Promise<SchoolFeeInterface[]>;
}

/**
 * SchoolFee service interface
 * Defines business logic methods for school fees
 */
export interface ISchoolFeeService {
  /**
   * Get school fee by ID
   */
  getSchoolFeeById(id: string): Promise<SchoolFeeDetailDTO>;

  /**
   * Create a new school fee
   */
  createSchoolFee(
    schoolFeeData: CreateSchoolFeeDTO
  ): Promise<SchoolFeeDetailDTO>;

  /**
   * Update a school fee
   */
  updateSchoolFee(
    id: string,
    schoolFeeData: UpdateSchoolFeeDTO
  ): Promise<SchoolFeeDetailDTO>;

  /**
   * Delete a school fee
   */
  deleteSchoolFee(id: string): Promise<boolean>;

  /**
   * Get paginated school fee list
   */
  getSchoolFeeList(
    params: SchoolFeeListQueryParams
  ): Promise<PaginatedSchoolFeeListDTO>;

  /**
   * Get school fees by school
   */
  getSchoolFeesBySchool(schoolId: string): Promise<SchoolFeeDetailDTO[]>;

  /**
   * Get school fee statistics
   */
  getSchoolFeeStatistics(): Promise<SchoolFeeStatistics>;

  /**
   * Create multiple school fees at once
   */
  createSchoolFeesBulk(
    schoolFeesData: CreateSchoolFeeDTO[]
  ): Promise<SchoolFeeDetailDTO[]>;

  /**
   * Delete multiple school fees at once
   */
  deleteSchoolFeesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;

  /**
   * Get school fees by category
   */
  getSchoolFeesByCategory(category: string): Promise<SchoolFeeDetailDTO[]>;
}
