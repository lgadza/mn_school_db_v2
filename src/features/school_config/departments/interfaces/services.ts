import { DepartmentInterface, DepartmentStatistics } from "./interfaces";
import {
  CreateDepartmentDTO,
  DepartmentDetailDTO,
  DepartmentListQueryParams,
  PaginatedDepartmentListDTO,
  UpdateDepartmentDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Department repository interface
 * Defines data access methods for departments
 */
export interface IDepartmentRepository {
  /**
   * Find a department by ID
   */
  findDepartmentById(id: string): Promise<DepartmentInterface | null>;

  /**
   * Find a department by code
   */
  findDepartmentByCode(code: string): Promise<DepartmentInterface | null>;

  /**
   * Create a new department
   */
  createDepartment(
    departmentData: CreateDepartmentDTO,
    transaction?: Transaction
  ): Promise<DepartmentInterface>;

  /**
   * Update a department
   */
  updateDepartment(
    id: string,
    departmentData: UpdateDepartmentDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a department
   */
  deleteDepartment(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get department list with filtering and pagination
   */
  getDepartmentList(params: DepartmentListQueryParams): Promise<{
    departments: DepartmentInterface[];
    total: number;
  }>;

  /**
   * Find departments by school ID
   */
  findDepartmentsBySchool(schoolId: string): Promise<DepartmentInterface[]>;

  /**
   * Find departments by head of department ID
   */
  findDepartmentsByHead(headId: string): Promise<DepartmentInterface[]>;

  /**
   * Check if a department code exists
   */
  isDepartmentCodeTaken(code: string, excludeId?: string): Promise<boolean>;

  /**
   * Get department statistics
   */
  getDepartmentStatistics(): Promise<DepartmentStatistics>;

  /**
   * Get default department for a school
   */
  getDefaultDepartment(schoolId: string): Promise<DepartmentInterface | null>;

  /**
   * Create multiple departments at once
   */
  createDepartmentsBulk(
    departmentsData: CreateDepartmentDTO[],
    transaction?: Transaction
  ): Promise<DepartmentInterface[]>;

  /**
   * Delete multiple departments at once
   */
  deleteDepartmentsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number>;
}

/**
 * Department service interface
 * Defines business logic methods for departments
 */
export interface IDepartmentService {
  /**
   * Get department by ID
   */
  getDepartmentById(id: string): Promise<DepartmentDetailDTO>;

  /**
   * Get department by code
   */
  getDepartmentByCode(code: string): Promise<DepartmentDetailDTO>;

  /**
   * Create a new department
   */
  createDepartment(
    departmentData: CreateDepartmentDTO
  ): Promise<DepartmentDetailDTO>;

  /**
   * Update a department
   */
  updateDepartment(
    id: string,
    departmentData: UpdateDepartmentDTO
  ): Promise<DepartmentDetailDTO>;

  /**
   * Delete a department
   */
  deleteDepartment(id: string): Promise<boolean>;

  /**
   * Get paginated department list
   */
  getDepartmentList(
    params: DepartmentListQueryParams
  ): Promise<PaginatedDepartmentListDTO>;

  /**
   * Get departments by school
   */
  getDepartmentsBySchool(schoolId: string): Promise<DepartmentDetailDTO[]>;

  /**
   * Get departments by head
   */
  getDepartmentsByHead(headId: string): Promise<DepartmentDetailDTO[]>;

  /**
   * Generate a unique department code
   */
  generateDepartmentCode(name: string, schoolId: string): Promise<string>;

  /**
   * Validate department data
   */
  validateDepartmentData(
    departmentData: CreateDepartmentDTO | UpdateDepartmentDTO
  ): Promise<boolean>;

  /**
   * Get department statistics
   */
  getDepartmentStatistics(): Promise<DepartmentStatistics>;

  /**
   * Get default department for a school
   */
  getDefaultDepartment(schoolId: string): Promise<DepartmentDetailDTO | null>;

  /**
   * Set a department as default for a school
   */
  setDefaultDepartment(
    departmentId: string,
    schoolId: string
  ): Promise<DepartmentDetailDTO>;

  /**
   * Create multiple departments at once
   */
  createDepartmentsBulk(
    departmentsData: CreateDepartmentDTO[]
  ): Promise<DepartmentDetailDTO[]>;

  /**
   * Delete multiple departments at once
   */
  deleteDepartmentsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
    failedIds?: string[];
  }>;
}
