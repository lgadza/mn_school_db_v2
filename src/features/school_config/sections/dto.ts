import { SectionInterface, SectionStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for section information
 */
export interface SectionBaseDTO {
  id: string;
  name: string;
  schoolId: string;
  capacity: number | null;
  details: string | null;
  color: string | null;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Detailed section DTO with timestamps
 */
export interface SectionDetailDTO extends SectionBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple section DTO without timestamps
 */
export interface SectionSimpleDTO extends SectionBaseDTO {}

/**
 * DTO for creating a new section
 */
export interface CreateSectionDTO {
  name: string;
  schoolId: string;
  capacity?: number | null;
  details?: string | null;
  color?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

/**
 * DTO for updating a section
 */
export interface UpdateSectionDTO {
  name?: string;
  schoolId?: string;
  capacity?: number | null;
  details?: string | null;
  color?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

/**
 * Query parameters for section list
 */
export interface SectionListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  color?: string;
  capacityMin?: number;
  capacityMax?: number;
  active?: boolean; // if true, only return sections where current date is between startDate and endDate
}

/**
 * Paginated section list response
 */
export interface PaginatedSectionListDTO {
  sections: SectionDetailDTO[];
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
 * Section statistics DTO
 */
export interface SectionStatisticsDTO extends SectionStatistics {}

/**
 * Mapper class for converting between Section entities and DTOs
 */
export class SectionDTOMapper {
  /**
   * Map Section entity to BaseDTO
   */
  public static toBaseDTO(section: SectionInterface): SectionBaseDTO {
    return {
      id: section.id,
      name: section.name,
      schoolId: section.schoolId,
      capacity: section.capacity,
      details: section.details,
      color: section.color,
      startDate: section.startDate ? section.startDate.toISOString() : null,
      endDate: section.endDate ? section.endDate.toISOString() : null,
    };
  }

  /**
   * Map Section entity to DetailDTO
   */
  public static toDetailDTO(section: any): SectionDetailDTO {
    const baseDTO = this.toBaseDTO(section);

    return {
      ...baseDTO,
      createdAt: section.createdAt
        ? section.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: section.updatedAt
        ? section.updatedAt.toISOString()
        : new Date().toISOString(),
      school: section.school ? section.school : undefined,
    };
  }

  /**
   * Map Section entity to SimpleDTO
   */
  public static toSimpleDTO(section: SectionInterface): SectionSimpleDTO {
    return this.toBaseDTO(section);
  }
}
