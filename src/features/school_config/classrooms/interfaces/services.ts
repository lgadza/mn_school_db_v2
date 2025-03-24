import { ClassroomInterface, ClassroomStatistics } from "./interfaces";
import {
  CreateClassroomDTO,
  ClassroomDetailDTO,
  ClassroomListQueryParams,
  PaginatedClassroomListDTO,
  UpdateClassroomDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Classroom repository interface
 * Defines data access methods for classrooms
 */
export interface IClassroomRepository {
  /**
   * Find a classroom by ID
   */
  findClassroomById(id: string): Promise<ClassroomInterface | null>;

  /**
   * Create a new classroom
   */
  createClassroom(
    classroomData: CreateClassroomDTO,
    transaction?: Transaction
  ): Promise<ClassroomInterface>;

  /**
   * Update a classroom
   */
  updateClassroom(
    id: string,
    classroomData: UpdateClassroomDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a classroom
   */
  deleteClassroom(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get classroom list with filtering and pagination
   */
  getClassroomList(params: ClassroomListQueryParams): Promise<{
    classrooms: ClassroomInterface[];
    total: number;
  }>;

  /**
   * Find classrooms by school ID
   */
  findClassroomsBySchool(schoolId: string): Promise<ClassroomInterface[]>;

  /**
   * Find classrooms by block ID
   */
  findClassroomsByBlock(blockId: string): Promise<ClassroomInterface[]>;

  /**
   * Get classroom statistics
   */
  getClassroomStatistics(): Promise<ClassroomStatistics>;

  /**
   * Create multiple classrooms at once
   */
  createClassroomsBulk(
    classroomsData: CreateClassroomDTO[],
    transaction?: Transaction
  ): Promise<ClassroomInterface[]>;

  /**
   * Delete multiple classrooms at once
   */
  deleteClassroomsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number>;
}

/**
 * Classroom service interface
 * Defines business logic methods for classrooms
 */
export interface IClassroomService {
  /**
   * Get classroom by ID
   */
  getClassroomById(id: string): Promise<ClassroomDetailDTO>;

  /**
   * Create a new classroom
   */
  createClassroom(
    classroomData: CreateClassroomDTO
  ): Promise<ClassroomDetailDTO>;

  /**
   * Update a classroom
   */
  updateClassroom(
    id: string,
    classroomData: UpdateClassroomDTO
  ): Promise<ClassroomDetailDTO>;

  /**
   * Delete a classroom
   */
  deleteClassroom(id: string): Promise<boolean>;

  /**
   * Get paginated classroom list
   */
  getClassroomList(
    params: ClassroomListQueryParams
  ): Promise<PaginatedClassroomListDTO>;

  /**
   * Get classrooms by school
   */
  getClassroomsBySchool(schoolId: string): Promise<ClassroomDetailDTO[]>;

  /**
   * Get classrooms by block
   */
  getClassroomsByBlock(blockId: string): Promise<ClassroomDetailDTO[]>;

  /**
   * Validate classroom data
   */
  validateClassroomData(
    classroomData: CreateClassroomDTO | UpdateClassroomDTO
  ): Promise<boolean>;

  /**
   * Get classroom statistics
   */
  getClassroomStatistics(): Promise<ClassroomStatistics>;

  /**
   * Create multiple classrooms at once
   */
  createClassroomsBulk(
    classroomsData: CreateClassroomDTO[]
  ): Promise<ClassroomDetailDTO[]>;

  /**
   * Delete multiple classrooms at once
   */
  deleteClassroomsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
