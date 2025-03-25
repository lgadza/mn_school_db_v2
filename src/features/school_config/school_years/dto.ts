import {
  SchoolYearInterface,
  SchoolYearStatus,
  SchoolYearStatistics,
} from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for school year information
 */
export interface SchoolYearBaseDTO {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: string | null;
  schoolId: string;
}

/**
 * Detailed school year DTO with timestamps and relations
 */
export interface SchoolYearDetailDTO extends SchoolYearBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple school year DTO without timestamps
 */
export interface SchoolYearSimpleDTO extends SchoolYearBaseDTO {}

/**
 * DTO for creating a new school year
 */
export interface CreateSchoolYearDTO {
  year: string;
  startDate: Date | string;
  endDate: Date | string;
  status?: string | null;
  schoolId: string;
}

/**
 * DTO for updating a school year
 */
export interface UpdateSchoolYearDTO {
  year?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string | null;
  schoolId?: string;
}

/**
 * Query parameters for school year list
 */
export interface SchoolYearListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  status?: string;
  year?: string;
  currentOnly?: boolean; // if true, only return school years where current date is between startDate and endDate
}

/**
 * Paginated school year list response
 */
export interface PaginatedSchoolYearListDTO {
  schoolYears: SchoolYearDetailDTO[];
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
 * School year statistics DTO
 */
export interface SchoolYearStatisticsDTO extends SchoolYearStatistics {}

/**
 * Mapper class for converting between SchoolYear entities and DTOs
 */
export class SchoolYearDTOMapper {
  /**
   * Map SchoolYear entity to BaseDTO
   */
  public static toBaseDTO(schoolYear: SchoolYearInterface): SchoolYearBaseDTO {
    return {
      id: schoolYear.id,
      year: schoolYear.year,
      startDate: schoolYear.startDate.toISOString(),
      endDate: schoolYear.endDate.toISOString(),
      status: schoolYear.status,
      schoolId: schoolYear.schoolId,
    };
  }

  /**
   * Map SchoolYear entity to DetailDTO
   */
  public static toDetailDTO(schoolYear: any): SchoolYearDetailDTO {
    const baseDTO = this.toBaseDTO(schoolYear);

    return {
      ...baseDTO,
      createdAt: schoolYear.createdAt
        ? schoolYear.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: schoolYear.updatedAt
        ? schoolYear.updatedAt.toISOString()
        : new Date().toISOString(),
      school: schoolYear.school ? schoolYear.school : undefined,
    };
  }

  /**
   * Map SchoolYear entity to SimpleDTO
   */
  public static toSimpleDTO(
    schoolYear: SchoolYearInterface
  ): SchoolYearSimpleDTO {
    return this.toBaseDTO(schoolYear);
  }
}
