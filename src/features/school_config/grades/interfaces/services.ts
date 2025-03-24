import { GradeInterface, GradeStatistics } from "./interfaces";
import {
  CreateGradeDTO,
  GradeDetailDTO,
  GradeListQueryParams,
  PaginatedGradeListDTO,
  UpdateGradeDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Grade repository interface
 * Defines data access methods for grades
 */
export interface IGradeRepository {
  /**
   * Find a grade by ID
   */
  findGradeById(id: string): Promise<GradeInterface | null>;

  /**
   * Create a new grade
   */
  createGrade(
    gradeData: CreateGradeDTO,
    transaction?: Transaction
  ): Promise<GradeInterface>;

  /**
   * Update a grade
   */
  updateGrade(
    id: string,
    gradeData: UpdateGradeDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a grade
   */
  deleteGrade(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get grade list with filtering and pagination
   */
  getGradeList(params: GradeListQueryParams): Promise<{
    grades: GradeInterface[];
    total: number;
  }>;

  /**
   * Find grades by school ID
   */
  findGradesBySchool(schoolId: string): Promise<GradeInterface[]>;

  /**
   * Find grades by teacher ID
   */
  findGradesByTeacher(teacherId: string): Promise<GradeInterface[]>;

  /**
   * Get grade statistics
   */
  getGradeStatistics(): Promise<GradeStatistics>;

  /**
   * Create multiple grades at once
   */
  createGradesBulk(
    gradesData: CreateGradeDTO[],
    transaction?: Transaction
  ): Promise<GradeInterface[]>;

  /**
   * Delete multiple grades at once
   */
  deleteGradesBulk(ids: string[], transaction?: Transaction): Promise<number>;
}

/**
 * Grade service interface
 * Defines business logic methods for grades
 */
export interface IGradeService {
  /**
   * Get grade by ID
   */
  getGradeById(id: string): Promise<GradeDetailDTO>;

  /**
   * Create a new grade
   */
  createGrade(gradeData: CreateGradeDTO): Promise<GradeDetailDTO>;

  /**
   * Update a grade
   */
  updateGrade(id: string, gradeData: UpdateGradeDTO): Promise<GradeDetailDTO>;

  /**
   * Delete a grade
   */
  deleteGrade(id: string): Promise<boolean>;

  /**
   * Get paginated grade list
   */
  getGradeList(params: GradeListQueryParams): Promise<PaginatedGradeListDTO>;

  /**
   * Get grades by school
   */
  getGradesBySchool(schoolId: string): Promise<GradeDetailDTO[]>;

  /**
   * Get grades by teacher
   */
  getGradesByTeacher(teacherId: string): Promise<GradeDetailDTO[]>;

  /**
   * Validate grade data
   */
  validateGradeData(
    gradeData: CreateGradeDTO | UpdateGradeDTO
  ): Promise<boolean>;

  /**
   * Get grade statistics
   */
  getGradeStatistics(): Promise<GradeStatistics>;

  /**
   * Create multiple grades at once
   */
  createGradesBulk(gradesData: CreateGradeDTO[]): Promise<GradeDetailDTO[]>;

  /**
   * Delete multiple grades at once
   */
  deleteGradesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
