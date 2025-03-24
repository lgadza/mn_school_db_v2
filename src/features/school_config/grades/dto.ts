import { GradeInterface, GradeStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";
import { TeacherDetailDTO } from "../../teachers/dto";

/**
 * Base DTO for grade information
 */
export interface GradeBaseDTO {
  id: string;
  name: string;
  details: string | null;
  schoolId: string;
  applicationOpen: boolean;
  minAge: number | null;
  teacherId: string | null;
  maxAge: number | null;
}

/**
 * Detailed grade DTO with timestamps
 */
export interface GradeDetailDTO extends GradeBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
  teacher?: TeacherDetailDTO;
}

/**
 * Simple grade DTO without timestamps
 */
export interface GradeSimpleDTO extends GradeBaseDTO {}

/**
 * DTO for creating a new grade
 */
export interface CreateGradeDTO {
  name: string;
  details?: string | null;
  schoolId: string;
  applicationOpen?: boolean;
  minAge?: number | null;
  teacherId?: string | null;
  maxAge?: number | null;
}

/**
 * DTO for updating a grade
 */
export interface UpdateGradeDTO {
  name?: string;
  details?: string | null;
  schoolId?: string;
  applicationOpen?: boolean;
  minAge?: number | null;
  teacherId?: string | null;
  maxAge?: number | null;
}

/**
 * Query parameters for grade list
 */
export interface GradeListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  teacherId?: string;
  applicationOpen?: boolean;
  minAgeFrom?: number;
  minAgeTo?: number;
  maxAgeFrom?: number;
  maxAgeTo?: number;
}

/**
 * Paginated grade list response
 */
export interface PaginatedGradeListDTO {
  grades: GradeDetailDTO[];
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
 * Grade statistics DTO
 */
export interface GradeStatisticsDTO extends GradeStatistics {}

/**
 * Mapper class for converting between Grade entities and DTOs
 */
export class GradeDTOMapper {
  /**
   * Map Grade entity to BaseDTO
   */
  public static toBaseDTO(grade: GradeInterface): GradeBaseDTO {
    return {
      id: grade.id,
      name: grade.name,
      details: grade.details,
      schoolId: grade.schoolId,
      applicationOpen: grade.applicationOpen,
      minAge: grade.minAge,
      teacherId: grade.teacherId,
      maxAge: grade.maxAge,
    };
  }

  /**
   * Map Grade entity to DetailDTO
   */
  public static toDetailDTO(grade: any): GradeDetailDTO {
    const baseDTO = this.toBaseDTO(grade);

    return {
      ...baseDTO,
      createdAt: grade.createdAt
        ? grade.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: grade.updatedAt
        ? grade.updatedAt.toISOString()
        : new Date().toISOString(),
      school: grade.school ? grade.school : undefined,
      teacher: grade.teacher ? grade.teacher : undefined,
    };
  }

  /**
   * Map Grade entity to SimpleDTO
   */
  public static toSimpleDTO(grade: GradeInterface): GradeSimpleDTO {
    return this.toBaseDTO(grade);
  }
}
