import { StudentInterface, StudentStatistics } from "./interfaces";
import {
  CreateStudentDTO,
  StudentDetailDTO,
  StudentListQueryParams,
  PaginatedStudentListDTO,
  UpdateStudentDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Student repository interface
 * Defines data access methods for students
 */
export interface IStudentRepository {
  /**
   * Find a student by ID
   */
  findStudentById(id: string): Promise<StudentInterface | null>;

  /**
   * Find a student by user ID
   */
  findStudentByUserId(userId: string): Promise<StudentInterface | null>;

  /**
   * Find a student by student number
   */
  findStudentByStudentNumber(
    studentNumber: string
  ): Promise<StudentInterface | null>;

  /**
   * Create a new student
   */
  createStudent(
    studentData: CreateStudentDTO,
    transaction?: Transaction
  ): Promise<StudentInterface>;

  /**
   * Update a student
   */
  updateStudent(
    id: string,
    studentData: UpdateStudentDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a student
   */
  deleteStudent(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get student list with filtering and pagination
   */
  getStudentList(params: StudentListQueryParams): Promise<{
    students: StudentInterface[];
    total: number;
  }>;

  /**
   * Find students by school ID
   */
  findStudentsBySchool(schoolId: string): Promise<StudentInterface[]>;

  /**
   * Find students by grade ID
   */
  findStudentsByGrade(gradeId: string): Promise<StudentInterface[]>;

  /**
   * Find students by class ID
   */
  findStudentsByClass(classId: string): Promise<StudentInterface[]>;

  /**
   * Check if a student number is already taken
   */
  isStudentNumberTaken(
    studentNumber: string,
    excludeId?: string
  ): Promise<boolean>;

  /**
   * Get student statistics
   */
  getStudentStatistics(): Promise<StudentStatistics>;
}

/**
 * Student service interface
 * Defines business logic methods for students
 */
export interface IStudentService {
  /**
   * Get student by ID
   */
  getStudentById(id: string): Promise<StudentDetailDTO>;

  /**
   * Get student by user ID
   */
  getStudentByUserId(userId: string): Promise<StudentDetailDTO>;

  /**
   * Get student by student number
   */
  getStudentByStudentNumber(studentNumber: string): Promise<StudentDetailDTO>;

  /**
   * Create a new student
   */
  createStudent(studentData: CreateStudentDTO): Promise<StudentDetailDTO>;

  /**
   * Update a student
   */
  updateStudent(
    id: string,
    studentData: UpdateStudentDTO
  ): Promise<StudentDetailDTO>;

  /**
   * Delete a student
   */
  deleteStudent(id: string): Promise<boolean>;

  /**
   * Get paginated student list
   */
  getStudentList(
    params: StudentListQueryParams
  ): Promise<PaginatedStudentListDTO>;

  /**
   * Get students by school
   */
  getStudentsBySchool(schoolId: string): Promise<StudentDetailDTO[]>;

  /**
   * Get students by grade
   */
  getStudentsByGrade(gradeId: string): Promise<StudentDetailDTO[]>;

  /**
   * Get students by class
   */
  getStudentsByClass(classId: string): Promise<StudentDetailDTO[]>;

  /**
   * Generate a unique student number
   */
  generateStudentNumber(schoolId: string, gradeId: string): Promise<string>;

  /**
   * Validate student data
   */
  validateStudentData(
    studentData: CreateStudentDTO | UpdateStudentDTO
  ): Promise<boolean>;

  /**
   * Get student statistics
   */
  getStudentStatistics(): Promise<StudentStatistics>;
}
