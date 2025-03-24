import { TeacherInterface, TeacherStatistics } from "./interfaces";
import {
  CreateTeacherDTO,
  TeacherDetailDTO,
  TeacherListQueryParams,
  PaginatedTeacherListDTO,
  UpdateTeacherDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Teacher repository interface
 * Defines data access methods for teachers
 */
export interface ITeacherRepository {
  /**
   * Find a teacher by ID
   */
  findTeacherById(id: string): Promise<TeacherInterface | null>;

  /**
   * Find a teacher by user ID
   */
  findTeacherByUserId(userId: string): Promise<TeacherInterface | null>;

  /**
   * Find a teacher by employee ID
   */
  findTeacherByEmployeeId(employeeId: string): Promise<TeacherInterface | null>;

  /**
   * Create a new teacher
   */
  createTeacher(
    teacherData: CreateTeacherDTO,
    transaction?: Transaction
  ): Promise<TeacherInterface>;

  /**
   * Update a teacher
   */
  updateTeacher(
    id: string,
    teacherData: UpdateTeacherDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a teacher
   */
  deleteTeacher(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get teacher list with filtering and pagination
   */
  getTeacherList(params: TeacherListQueryParams): Promise<{
    teachers: TeacherInterface[];
    total: number;
  }>;

  /**
   * Find teachers by school ID
   */
  findTeachersBySchool(schoolId: string): Promise<TeacherInterface[]>;

  /**
   * Find teachers by department ID
   */
  findTeachersByDepartment(departmentId: string): Promise<TeacherInterface[]>;

  /**
   * Check if a teacher's employee ID exists
   */
  isEmployeeIdTaken(employeeId: string, excludeId?: string): Promise<boolean>;

  /**
   * Get teacher statistics
   */
  getTeacherStatistics(): Promise<TeacherStatistics>;
}

/**
 * Teacher service interface
 * Defines business logic methods for teachers
 */
export interface ITeacherService {
  /**
   * Get teacher by ID
   */
  getTeacherById(id: string): Promise<TeacherDetailDTO>;

  /**
   * Get teacher by user ID
   */
  getTeacherByUserId(userId: string): Promise<TeacherDetailDTO>;

  /**
   * Get teacher by employee ID
   */
  getTeacherByEmployeeId(employeeId: string): Promise<TeacherDetailDTO>;

  /**
   * Create a new teacher
   */
  createTeacher(teacherData: CreateTeacherDTO): Promise<TeacherDetailDTO>;

  /**
   * Update a teacher
   */
  updateTeacher(
    id: string,
    teacherData: UpdateTeacherDTO
  ): Promise<TeacherDetailDTO>;

  /**
   * Delete a teacher
   */
  deleteTeacher(id: string): Promise<boolean>;

  /**
   * Get paginated teacher list
   */
  getTeacherList(
    params: TeacherListQueryParams
  ): Promise<PaginatedTeacherListDTO>;

  /**
   * Get teachers by school
   */
  getTeachersBySchool(schoolId: string): Promise<TeacherDetailDTO[]>;

  /**
   * Get teachers by department
   */
  getTeachersByDepartment(departmentId: string): Promise<TeacherDetailDTO[]>;

  /**
   * Generate a unique employee ID
   */
  generateEmployeeId(schoolId: string): Promise<string>;

  /**
   * Validate teacher data
   */
  validateTeacherData(
    teacherData: CreateTeacherDTO | UpdateTeacherDTO
  ): Promise<boolean>;

  /**
   * Get teacher statistics
   */
  getTeacherStatistics(): Promise<TeacherStatistics>;
}
