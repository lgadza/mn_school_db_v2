import { BlockInterface, BlockStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for block information
 */
export interface BlockBaseDTO {
  id: string;
  schoolId: string;
  name: string;
  numberOfClassrooms: number;
  details: string | null;
  location: string | null;
  yearBuilt: number | null;
  status: string | null;
}

/**
 * Detailed block DTO with timestamps
 */
export interface BlockDetailDTO extends BlockBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple block DTO without timestamps
 */
export interface BlockSimpleDTO extends BlockBaseDTO {}

/**
 * DTO for creating a new block
 */
export interface CreateBlockDTO {
  schoolId: string;
  name: string;
  numberOfClassrooms: number;
  details?: string | null;
  location?: string | null;
  yearBuilt?: number | null;
  status?: string | null;
}

/**
 * DTO for updating a block
 */
export interface UpdateBlockDTO {
  schoolId?: string;
  name?: string;
  numberOfClassrooms?: number;
  details?: string | null;
  location?: string | null;
  yearBuilt?: number | null;
  status?: string | null;
}

/**
 * Query parameters for block list
 */
export interface BlockListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  status?: string;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  minClassrooms?: number;
  maxClassrooms?: number;
}

/**
 * Paginated block list response
 */
export interface PaginatedBlockListDTO {
  blocks: BlockDetailDTO[];
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
 * Block statistics DTO
 */
export interface BlockStatisticsDTO extends BlockStatistics {}

/**
 * Mapper class for converting between Block entities and DTOs
 */
export class BlockDTOMapper {
  /**
   * Map Block entity to BaseDTO
   */
  public static toBaseDTO(block: BlockInterface): BlockBaseDTO {
    return {
      id: block.id,
      schoolId: block.schoolId,
      name: block.name,
      numberOfClassrooms: block.numberOfClassrooms,
      details: block.details,
      location: block.location,
      yearBuilt: block.yearBuilt,
      status: block.status,
    };
  }

  /**
   * Map Block entity to DetailDTO
   */
  public static toDetailDTO(block: any): BlockDetailDTO {
    const baseDTO = this.toBaseDTO(block);

    return {
      ...baseDTO,
      createdAt: block.createdAt
        ? block.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: block.updatedAt
        ? block.updatedAt.toISOString()
        : new Date().toISOString(),
      school: block.school ? block.school : undefined,
    };
  }

  /**
   * Map Block entity to SimpleDTO
   */
  public static toSimpleDTO(block: BlockInterface): BlockSimpleDTO {
    return this.toBaseDTO(block);
  }
}
