import { PeriodInterface, PeriodStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for period information
 */
export interface PeriodBaseDTO {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  section: "morning" | "afternoon" | "evening";
  schoolId: string;
}

/**
 * Detailed period DTO with timestamps
 */
export interface PeriodDetailDTO extends PeriodBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple period DTO without timestamps
 */
export interface PeriodSimpleDTO extends PeriodBaseDTO {}

/**
 * DTO for creating a new period
 */
export interface CreatePeriodDTO {
  name: string;
  startTime: string;
  endTime: string;
  duration?: number; // Optional as it can be calculated
  section: "morning" | "afternoon" | "evening";
  schoolId: string;
}

/**
 * DTO for updating a period
 */
export interface UpdatePeriodDTO {
  name?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  section?: "morning" | "afternoon" | "evening";
  schoolId?: string;
}

/**
 * Query parameters for period list
 */
export interface PeriodListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  section?: "morning" | "afternoon" | "evening";
  durationMin?: number;
  durationMax?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  endTimeFrom?: string;
  endTimeTo?: string;
}

/**
 * Paginated period list response
 */
export interface PaginatedPeriodListDTO {
  periods: PeriodDetailDTO[];
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
 * Period statistics DTO
 */
export interface PeriodStatisticsDTO extends PeriodStatistics {}

/**
 * Mapper class for converting between Period entities and DTOs
 */
export class PeriodDTOMapper {
  /**
   * Map Period entity to BaseDTO
   */
  public static toBaseDTO(period: PeriodInterface): PeriodBaseDTO {
    return {
      id: period.id,
      name: period.name,
      startTime: period.startTime,
      endTime: period.endTime,
      duration: period.duration,
      section: period.section,
      schoolId: period.schoolId,
    };
  }

  /**
   * Map Period entity to DetailDTO
   */
  public static toDetailDTO(period: any): PeriodDetailDTO {
    const baseDTO = this.toBaseDTO(period);

    return {
      ...baseDTO,
      createdAt: period.createdAt
        ? period.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: period.updatedAt
        ? period.updatedAt.toISOString()
        : new Date().toISOString(),
      school: period.school ? period.school : undefined,
    };
  }

  /**
   * Map Period entity to SimpleDTO
   */
  public static toSimpleDTO(period: PeriodInterface): PeriodSimpleDTO {
    return this.toBaseDTO(period);
  }
}
