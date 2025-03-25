import {
  SchoolYearInterface,
  SchoolYearStatus,
  SchoolYearStatistics,
} from "./interfaces";
import {
  CreateSchoolYearDTO,
  SchoolYearDetailDTO,
  SchoolYearListQueryParams,
  PaginatedSchoolYearListDTO,
  UpdateSchoolYearDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * SchoolYear repository interface
 * Defines data access methods for school years
 */
export interface ISchoolYearRepository {
  /**
   * Find a school year by ID
   */
  findSchoolYearById(id: string): Promise<SchoolYearInterface | null>;

  /**
   * Create a new school year
   */
  createSchoolYear(
    schoolYearData: CreateSchoolYearDTO,
    transaction?: Transaction
  ): Promise<SchoolYearInterface>;

  /**
   * Update a school year
   */
  updateSchoolYear(
    id: string,
    schoolYearData: UpdateSchoolYearDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a school year
   */
  deleteSchoolYear(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get school year list with filtering and pagination
   */
  getSchoolYearList(params: SchoolYearListQueryParams): Promise<{
    schoolYears: SchoolYearInterface[];
    total: number;
  }>;

  /**
   * Find school years by school ID
   */
  findSchoolYearsBySchool(schoolId: string): Promise<SchoolYearInterface[]>;

  /**
   * Get school year statistics
   */
  getSchoolYearStatistics(): Promise<SchoolYearStatistics>;

  /**
   * Create multiple school years at once
   */
  createSchoolYearsBulk(
    schoolYearsData: CreateSchoolYearDTO[],
    transaction?: Transaction
  ): Promise<SchoolYearInterface[]>;

  /**
   * Get active school year
   */
  getActiveSchoolYear(schoolId: string): Promise<SchoolYearInterface | null>;

  /**
   * Get current school year (based on current date)
   */
  getCurrentSchoolYear(schoolId: string): Promise<SchoolYearInterface | null>;
}

/**
 * SchoolYear service interface
 * Defines business logic methods for school years
 */
export interface ISchoolYearService {
  /**
   * Get school year by ID
   */
  getSchoolYearById(id: string): Promise<SchoolYearDetailDTO>;

  /**
   * Create a new school year
   */
  createSchoolYear(
    schoolYearData: CreateSchoolYearDTO
  ): Promise<SchoolYearDetailDTO>;

  /**
   * Update a school year
   */
  updateSchoolYear(
    id: string,
    schoolYearData: UpdateSchoolYearDTO
  ): Promise<SchoolYearDetailDTO>;

  /**
   * Delete a school year
   */
  deleteSchoolYear(id: string): Promise<boolean>;

  /**
   * Get paginated school year list
   */
  getSchoolYearList(
    params: SchoolYearListQueryParams
  ): Promise<PaginatedSchoolYearListDTO>;

  /**
   * Get school years by school
   */
  getSchoolYearsBySchool(schoolId: string): Promise<SchoolYearDetailDTO[]>;

  /**
   * Validate school year data
   */
  validateSchoolYearData(
    schoolYearData: CreateSchoolYearDTO | UpdateSchoolYearDTO
  ): Promise<boolean>;

  /**
   * Get school year statistics
   */
  getSchoolYearStatistics(): Promise<SchoolYearStatistics>;

  /**
   * Create multiple school years at once
   */
  createSchoolYearsBulk(
    schoolYearsData: CreateSchoolYearDTO[]
  ): Promise<SchoolYearDetailDTO[]>;

  /**
   * Get active school year for a school
   */
  getActiveSchoolYear(schoolId: string): Promise<SchoolYearDetailDTO | null>;

  /**
   * Get current school year based on current date
   */
  getCurrentSchoolYear(schoolId: string): Promise<SchoolYearDetailDTO | null>;

  /**
   * Set a school year as active (and deactivate others for this school)
   */
  setActiveSchoolYear(id: string): Promise<SchoolYearDetailDTO>;

  /**
   * Generate multiple school years for a school
   * Creates a series of school years starting from a given year
   */
  generateSchoolYears(params: {
    schoolId: string;
    startYear: number;
    numberOfYears: number;
    yearStartMonth?: number;
    yearStartDay?: number;
    yearEndMonth?: number;
    yearEndDay?: number;
  }): Promise<SchoolYearDetailDTO[]>;
}
