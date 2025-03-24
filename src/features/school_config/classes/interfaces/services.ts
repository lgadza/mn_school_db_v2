import { ClassInterface, ClassStatistics } from "./interfaces";
import {
  CreateClassDTO,
  ClassDetailDTO,
  ClassListQueryParams,
  PaginatedClassListDTO,
  UpdateClassDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Class repository interface
 * Defines data access methods for classes
 */
export interface IClassRepository {
  /**
   * Find a class by ID
   */
  findClassById(id: string): Promise<ClassInterface | null>;

  /**
   * Create a new class
   */
  createClass(
    classData: CreateClassDTO,
    transaction?: Transaction
  ): Promise<ClassInterface>;

  /**
   * Update a class
   */
  updateClass(
    id: string,
    classData: UpdateClassDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a class
   */
  deleteClass(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get class list with filtering and pagination
   */
  getClassList(params: ClassListQueryParams): Promise<{
    classes: ClassInterface[];
    total: number;
  }>;

  /**
   * Find classes by school ID
   */
  findClassesBySchool(schoolId: string): Promise<ClassInterface[]>;

  /**
   * Find classes by teacher ID
   */
  findClassesByTeacher(teacherId: string): Promise<ClassInterface[]>;

  /**
   * Find classes by grade ID
   */
  findClassesByGrade(gradeId: string): Promise<ClassInterface[]>;

  /**
   * Find classes by section ID
   */
  findClassesBySection(sectionId: string): Promise<ClassInterface[]>;

  /**
   * Find classes by department ID
   */
  findClassesByDepartment(departmentId: string): Promise<ClassInterface[]>;

  /**
   * Find classes by classroom ID
   */
  findClassesByClassroom(classroomId: string): Promise<ClassInterface[]>;

  /**
   * Find classes by school year ID
   */
  findClassesBySchoolYear(schoolYearId: string): Promise<ClassInterface[]>;

  /**
   * Get class statistics
   */
  getClassStatistics(): Promise<ClassStatistics>;

  /**
   * Create multiple classes at once
   */
  createClassesBulk(
    classesData: CreateClassDTO[],
    transaction?: Transaction
  ): Promise<ClassInterface[]>;

  /**
   * Delete multiple classes at once
   */
  deleteClassesBulk(ids: string[], transaction?: Transaction): Promise<number>;

  /**
   * Update classroom capacity usage
   */
  updateClassroomCapacityUsage(
    classroomId: string,
    transaction?: Transaction
  ): Promise<boolean>;
}

/**
 * Class service interface
 * Defines business logic methods for classes
 */
export interface IClassService {
  /**
   * Get class by ID
   */
  getClassById(id: string): Promise<ClassDetailDTO>;

  /**
   * Create a new class
   */
  createClass(classData: CreateClassDTO): Promise<ClassDetailDTO>;

  /**
   * Update a class
   */
  updateClass(id: string, classData: UpdateClassDTO): Promise<ClassDetailDTO>;

  /**
   * Delete a class
   */
  deleteClass(id: string): Promise<boolean>;

  /**
   * Get paginated class list
   */
  getClassList(params: ClassListQueryParams): Promise<PaginatedClassListDTO>;

  /**
   * Get classes by school
   */
  getClassesBySchool(schoolId: string): Promise<ClassDetailDTO[]>;

  /**
   * Get classes by teacher
   */
  getClassesByTeacher(teacherId: string): Promise<ClassDetailDTO[]>;

  /**
   * Get classes by grade
   */
  getClassesByGrade(gradeId: string): Promise<ClassDetailDTO[]>;

  /**
   * Get classes by section
   */
  getClassesBySection(sectionId: string): Promise<ClassDetailDTO[]>;

  /**
   * Get classes by department
   */
  getClassesByDepartment(departmentId: string): Promise<ClassDetailDTO[]>;

  /**
   * Get classes by classroom
   */
  getClassesByClassroom(classroomId: string): Promise<ClassDetailDTO[]>;

  /**
   * Get classes by school year
   */
  getClassesBySchoolYear(schoolYearId: string): Promise<ClassDetailDTO[]>;

  /**
   * Validate class data
   */
  validateClassData(
    classData: CreateClassDTO | UpdateClassDTO
  ): Promise<boolean>;

  /**
   * Get class statistics
   */
  getClassStatistics(): Promise<ClassStatistics>;

  /**
   * Create multiple classes at once
   */
  createClassesBulk(classesData: CreateClassDTO[]): Promise<ClassDetailDTO[]>;

  /**
   * Delete multiple classes at once
   */
  deleteClassesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
