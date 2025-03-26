import { Transaction } from "sequelize";
import {
  ProjectGradeInterface,
  ProjectGradeDeletionResult,
} from "./interfaces";
import { CreateGradeDTO, UpdateGradeDTO, GradeListQueryParams } from "../dto";

export interface IProjectGradeRepository {
  /**
   * Find grade by ID
   */
  findGradeById(id: string): Promise<ProjectGradeInterface | null>;

  /**
   * Find grades by project ID
   */
  findGradesByProjectId(projectId: string): Promise<ProjectGradeInterface[]>;

  /**
   * Find grades by student ID
   */
  findGradesByStudentId(studentId: string): Promise<ProjectGradeInterface[]>;

  /**
   * Find grade by project and student
   */
  findGradeByProjectAndStudent(
    projectId: string,
    studentId: string
  ): Promise<ProjectGradeInterface | null>;

  /**
   * Create new grade
   */
  createGrade(
    gradeData: CreateGradeDTO,
    transaction?: Transaction
  ): Promise<ProjectGradeInterface>;

  /**
   * Update grade
   */
  updateGrade(
    id: string,
    gradeData: UpdateGradeDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete grade
   */
  deleteGrade(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Bulk delete grades for a project
   */
  bulkDeleteGrades(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectGradeDeletionResult>;

  /**
   * Get paginated grade list
   */
  getGradeList(params: GradeListQueryParams): Promise<{
    grades: ProjectGradeInterface[];
    total: number;
  }>;
}

export interface IProjectGradeService {
  /**
   * Get grade by ID
   */
  getGradeById(id: string): Promise<ProjectGradeInterface>;

  /**
   * Get grades by project ID
   */
  getGradesByProjectId(projectId: string): Promise<ProjectGradeInterface[]>;

  /**
   * Get grades by student ID
   */
  getGradesByStudentId(studentId: string): Promise<ProjectGradeInterface[]>;

  /**
   * Get grade by project and student
   */
  getGradeByProjectAndStudent(
    projectId: string,
    studentId: string
  ): Promise<ProjectGradeInterface | null>;

  /**
   * Create new grade
   */
  createGrade(gradeData: CreateGradeDTO): Promise<ProjectGradeInterface>;

  /**
   * Update grade
   */
  updateGrade(
    id: string,
    gradeData: UpdateGradeDTO
  ): Promise<ProjectGradeInterface>;

  /**
   * Delete grade
   */
  deleteGrade(id: string): Promise<boolean>;

  /**
   * Bulk delete grades for a project
   */
  bulkDeleteGrades(projectId: string): Promise<ProjectGradeDeletionResult>;

  /**
   * Get paginated grade list
   */
  getGradeList(params: GradeListQueryParams): Promise<{
    grades: ProjectGradeInterface[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
}
