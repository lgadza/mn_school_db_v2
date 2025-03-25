import {
  BehaviorTypeInterface,
  BehaviorTypeStatistics,
} from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for behavior type information
 */
export interface BehaviorTypeBaseDTO {
  id: string;
  description: string;
  category: "POSITIVE" | "NEGATIVE";
  schoolId: string;
}

/**
 * Detailed behavior type DTO with timestamps
 */
export interface BehaviorTypeDetailDTO extends BehaviorTypeBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple behavior type DTO without timestamps
 */
export interface BehaviorTypeSimpleDTO extends BehaviorTypeBaseDTO {}

/**
 * DTO for creating a new behavior type
 */
export interface CreateBehaviorTypeDTO {
  description: string;
  category: "POSITIVE" | "NEGATIVE";
  schoolId: string;
}

/**
 * DTO for updating a behavior type
 */
export interface UpdateBehaviorTypeDTO {
  description?: string;
  category?: "POSITIVE" | "NEGATIVE";
  schoolId?: string;
}

/**
 * Query parameters for behavior type list
 */
export interface BehaviorTypeListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  category?: "POSITIVE" | "NEGATIVE";
}

/**
 * Paginated behavior type list response
 */
export interface PaginatedBehaviorTypeListDTO {
  behaviorTypes: BehaviorTypeDetailDTO[];
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
 * Behavior type statistics DTO
 */
export interface BehaviorTypeStatisticsDTO extends BehaviorTypeStatistics {}

/**
 * Mapper class for converting between BehaviorType entities and DTOs
 */
export class BehaviorTypeDTOMapper {
  /**
   * Map BehaviorType entity to BaseDTO
   */
  public static toBaseDTO(
    behaviorType: BehaviorTypeInterface
  ): BehaviorTypeBaseDTO {
    return {
      id: behaviorType.id,
      description: behaviorType.description,
      category: behaviorType.category,
      schoolId: behaviorType.schoolId,
    };
  }

  /**
   * Map BehaviorType entity to DetailDTO
   */
  public static toDetailDTO(behaviorType: any): BehaviorTypeDetailDTO {
    const baseDTO = this.toBaseDTO(behaviorType);

    return {
      ...baseDTO,
      createdAt: behaviorType.createdAt
        ? behaviorType.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: behaviorType.updatedAt
        ? behaviorType.updatedAt.toISOString()
        : new Date().toISOString(),
      school: behaviorType.school ? behaviorType.school : undefined,
    };
  }

  /**
   * Map BehaviorType entity to SimpleDTO
   */
  public static toSimpleDTO(
    behaviorType: BehaviorTypeInterface
  ): BehaviorTypeSimpleDTO {
    return this.toBaseDTO(behaviorType);
  }
}
