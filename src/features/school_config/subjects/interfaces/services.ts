import { SubjectInterface, SubjectStatistics } from "./interfaces";
import {
  CreateSubjectDTO,
  SubjectDetailDTO,
  SubjectListQueryParams,
  PaginatedSubjectListDTO,
  UpdateSubjectDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Subject repository interface
 * Defines data access methods for subjects
 */
export interface ISubjectRepository {
  /**
   * Find a subject by ID
   */
  findSubjectById(id: string): Promise<SubjectInterface | null>;

  /**
   * Create a new subject
   */
  createSubject(
    subjectData: CreateSubjectDTO,
    transaction?: Transaction
  ): Promise<SubjectInterface>;

  /**
   * Update a subject
   */
  updateSubject(
    id: string,
    subjectData: UpdateSubjectDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a subject
   */
  deleteSubject(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get subject list with filtering and pagination
   */
  getSubjectList(params: SubjectListQueryParams): Promise<{
    subjects: SubjectInterface[];
    total: number;
  }>;

  /**
   * Find subjects by school ID
   */
  findSubjectsBySchool(schoolId: string): Promise<SubjectInterface[]>;

  /**
   * Find subjects by category ID
   */
  findSubjectsByCategory(categoryId: string): Promise<SubjectInterface[]>;

  /**
   * Find subjects by department ID
   */
  findSubjectsByDepartment(departmentId: string): Promise<SubjectInterface[]>;

  /**
   * Find subject by code
   */
  findSubjectByCode(
    code: string,
    schoolId?: string
  ): Promise<SubjectInterface | null>;

  /**
   * Get subject statistics
   */
  getSubjectStatistics(): Promise<SubjectStatistics>;

  /**
   * Create multiple subjects at once
   */
  createSubjectsBulk(
    subjectsData: CreateSubjectDTO[],
    transaction?: Transaction
  ): Promise<SubjectInterface[]>;

  /**
   * Delete multiple subjects at once
   */
  deleteSubjectsBulk(ids: string[], transaction?: Transaction): Promise<number>;
}

/**
 * Subject service interface
 * Defines business logic methods for subjects
 */
export interface ISubjectService {
  /**
   * Get subject by ID
   */
  getSubjectById(id: string): Promise<SubjectDetailDTO>;

  /**
   * Create a new subject
   */
  createSubject(subjectData: CreateSubjectDTO): Promise<SubjectDetailDTO>;

  /**
   * Update a subject
   */
  updateSubject(
    id: string,
    subjectData: UpdateSubjectDTO
  ): Promise<SubjectDetailDTO>;

  /**
   * Delete a subject
   */
  deleteSubject(id: string): Promise<boolean>;

  /**
   * Get paginated subject list
   */
  getSubjectList(
    params: SubjectListQueryParams
  ): Promise<PaginatedSubjectListDTO>;

  /**
   * Get subjects by school
   */
  getSubjectsBySchool(schoolId: string): Promise<SubjectDetailDTO[]>;

  /**
   * Get subjects by category
   */
  getSubjectsByCategory(categoryId: string): Promise<SubjectDetailDTO[]>;

  /**
   * Get subjects by department
   */
  getSubjectsByDepartment(departmentId: string): Promise<SubjectDetailDTO[]>;

  /**
   * Get subject by code
   */
  getSubjectByCode(code: string, schoolId?: string): Promise<SubjectDetailDTO>;

  /**
   * Validate subject data
   */
  validateSubjectData(
    subjectData: CreateSubjectDTO | UpdateSubjectDTO
  ): Promise<boolean>;

  /**
   * Get subject statistics
   */
  getSubjectStatistics(): Promise<SubjectStatistics>;

  /**
   * Create multiple subjects at once
   */
  createSubjectsBulk(
    subjectsData: CreateSubjectDTO[]
  ): Promise<SubjectDetailDTO[]>;

  /**
   * Delete multiple subjects at once
   */
  deleteSubjectsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
