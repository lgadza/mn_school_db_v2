import {
  ClassroomInterface,
  ClassroomStatistics,
} from "./interfaces/interfaces";
import { BlockSimpleDTO } from "../blocks/dto";

/**
 * Base DTO for classroom information
 */
export interface ClassroomBaseDTO {
  id: string;
  name: string;
  roomType: string;
  maxStudents: number;
  blockId: string;
  schoolId: string;
  details: string | null;
  floor: number | null;
  features: string[] | null;
  status: string | null;
}

/**
 * Detailed classroom DTO with timestamps and related entities
 */
export interface ClassroomDetailDTO extends ClassroomBaseDTO {
  createdAt: string;
  updatedAt: string;
  block?: BlockSimpleDTO; // Include only simplified block information, not the full school
}

/**
 * Simple classroom DTO without timestamps
 */
export interface ClassroomSimpleDTO extends ClassroomBaseDTO {}

/**
 * DTO for creating a new classroom
 */
export interface CreateClassroomDTO {
  name: string;
  roomType: string;
  maxStudents: number;
  blockId: string;
  schoolId: string;
  details?: string | null;
  floor?: number | null;
  features?: string[] | null;
  status?: string | null;
}

/**
 * DTO for updating a classroom
 */
export interface UpdateClassroomDTO {
  name?: string;
  roomType?: string;
  maxStudents?: number;
  blockId?: string;
  schoolId?: string;
  details?: string | null;
  floor?: number | null;
  features?: string[] | null;
  status?: string | null;
}

/**
 * Query parameters for classroom list
 */
export interface ClassroomListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  blockId?: string;
  roomType?: string;
  status?: string;
  minCapacity?: number;
  maxCapacity?: number;
  floor?: number;
  feature?: string; // To filter by a specific feature
}

/**
 * Paginated classroom list response
 */
export interface PaginatedClassroomListDTO {
  classrooms: ClassroomDetailDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Classroom statistics DTO
 */
export interface ClassroomStatisticsDTO extends ClassroomStatistics {}

/**
 * Mapper class for converting between Classroom entities and DTOs
 */
export class ClassroomDTOMapper {
  /**
   * Map Classroom entity to BaseDTO
   */
  public static toBaseDTO(classroom: ClassroomInterface): ClassroomBaseDTO {
    return {
      id: classroom.id,
      name: classroom.name,
      roomType: classroom.roomType,
      maxStudents: classroom.maxStudents,
      blockId: classroom.blockId,
      schoolId: classroom.schoolId,
      details: classroom.details,
      floor: classroom.floor,
      features: classroom.features,
      status: classroom.status,
    };
  }

  /**
   * Map Classroom entity to DetailDTO
   */
  public static toDetailDTO(classroom: any): ClassroomDetailDTO {
    const baseDTO = this.toBaseDTO(classroom);

    return {
      ...baseDTO,
      createdAt: classroom.createdAt
        ? classroom.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: classroom.updatedAt
        ? classroom.updatedAt.toISOString()
        : new Date().toISOString(),
      block: classroom.block ? classroom.block : undefined,
    };
  }

  /**
   * Map Classroom entity to SimpleDTO
   */
  public static toSimpleDTO(classroom: ClassroomInterface): ClassroomSimpleDTO {
    return this.toBaseDTO(classroom);
  }
}
