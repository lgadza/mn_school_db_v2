import { SchoolApplicationInterface } from "./interfaces/interfaces";
import { ProspectDetailDTO } from "../prospects/dto";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for school application information
 */
export interface SchoolApplicationBaseDTO {
  id: string;
  prospectId: string;
  schoolId: string;
  applicationDate: string;
  status: string;
  applicationDocumentIds: string[];
  notes: string | null;
}

/**
 * Detailed school application DTO with timestamps and related entities
 */
export interface SchoolApplicationDetailDTO extends SchoolApplicationBaseDTO {
  createdAt: string;
  updatedAt: string;
  prospect?: ProspectDetailDTO;
  school?: SchoolDetailDTO;
}

/**
 * Simple school application DTO without timestamps and sensitive data
 */
export interface SchoolApplicationSimpleDTO extends SchoolApplicationBaseDTO {}

/**
 * DTO for creating a new school application
 */
export interface CreateSchoolApplicationDTO {
  prospectId: string;
  schoolId: string;
  applicationDate?: string | Date;
  status?: string;
  applicationDocumentIds?: string[];
  notes?: string | null;
}

/**
 * DTO for updating a school application
 */
export interface UpdateSchoolApplicationDTO {
  status?: string;
  applicationDocumentIds?: string[];
  notes?: string | null;
}

/**
 * Query parameters for school application list
 */
export interface SchoolApplicationListQueryParams {
  page?: number;
  limit?: number;
  prospectId?: string;
  schoolId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  applicationDateFrom?: string;
  applicationDateTo?: string;
}

/**
 * Paginated school application list response
 */
export interface PaginatedSchoolApplicationListDTO {
  applications: SchoolApplicationDetailDTO[];
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
 * School application statistics DTO
 */
export interface SchoolApplicationStatisticsDTO {
  totalApplications: number;
  applicationsBySchool: { [schoolId: string]: number };
  applicationsByStatus: { [status: string]: number };
  applicationsPerMonth: { [month: string]: number };
  applicationsPerYear: { [year: string]: number };
  applicationsPerInterestLevel: { [level: string]: number };
  averageApplicationsPerProspect: number;
  multipleApplicationsCount: number;
  schoolsWithMostApplications: Array<{ schoolId: string; count: number }>;
}

/**
 * Mapper class for converting between SchoolApplication entities and DTOs
 */
export class SchoolApplicationDTOMapper {
  /**
   * Map SchoolApplication entity to BaseDTO
   */
  public static toBaseDTO(
    application: SchoolApplicationInterface
  ): SchoolApplicationBaseDTO {
    return {
      id: application.id,
      prospectId: application.prospectId,
      schoolId: application.schoolId,
      applicationDate: application.applicationDate
        ? application.applicationDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: application.status,
      applicationDocumentIds: application.applicationDocumentIds || [],
      notes: application.notes || null,
    };
  }

  /**
   * Map SchoolApplication entity to DetailDTO
   */
  public static toDetailDTO(
    application: SchoolApplicationInterface
  ): SchoolApplicationDetailDTO {
    const baseDTO = this.toBaseDTO(application);
    const detailDTO: SchoolApplicationDetailDTO = {
      ...baseDTO,
      createdAt: application.createdAt
        ? application.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: application.updatedAt
        ? application.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add related entities if available
    if (application.prospect) {
      detailDTO.prospect = application.prospect as any;
    }

    if (application.school) {
      detailDTO.school = application.school as any;
    }

    return detailDTO;
  }

  /**
   * Map SchoolApplication entity to SimpleDTO
   */
  public static toSimpleDTO(
    application: SchoolApplicationInterface
  ): SchoolApplicationSimpleDTO {
    return this.toBaseDTO(application);
  }

  /**
   * Prepare data for storage
   */
  public static prepareForStorage(
    applicationData: CreateSchoolApplicationDTO | UpdateSchoolApplicationDTO
  ): any {
    const dataToSave = { ...applicationData };
    return dataToSave;
  }
}
