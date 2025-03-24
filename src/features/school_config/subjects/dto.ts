import { SubjectInterface, SubjectStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";
import { CategoryDetailDTO } from "../categories/dto";
import { DepartmentDetailDTO } from "../departments/dto";

/**
 * Base DTO for subject information
 */
export interface SubjectBaseDTO {
  id: string;
  name: string;
  sortOrder: number | null;
  code: string | null;
  description: string | null;
  level: string;
  isDefault: boolean;
  schoolId: string;
  categoryId: string | null;
  prerequisite: string | null;
  departmentId: string | null;
  credits: number | null;
  compulsory: boolean;
  syllabus: string | null;
}

/**
 * Detailed subject DTO with timestamps and related entities
 */
export interface SubjectDetailDTO extends SubjectBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
  category?: CategoryDetailDTO;
  department?: DepartmentDetailDTO;
  prerequisiteSubject?: SubjectBaseDTO;
}

/**
 * Simple subject DTO without timestamps
 */
export interface SubjectSimpleDTO extends SubjectBaseDTO {}

/**
 * DTO for creating a new subject
 */
export interface CreateSubjectDTO {
  name: string;
  sortOrder?: number | null;
  code?: string | null;
  description?: string | null;
  level: string;
  isDefault?: boolean;
  schoolId: string;
  categoryId?: string | null;
  prerequisite?: string | null;
  departmentId?: string | null;
  credits?: number | null;
  compulsory?: boolean;
  syllabus?: string | null;
}

/**
 * DTO for updating a subject
 */
export interface UpdateSubjectDTO {
  name?: string;
  sortOrder?: number | null;
  code?: string | null;
  description?: string | null;
  level?: string;
  isDefault?: boolean;
  schoolId?: string;
  categoryId?: string | null;
  prerequisite?: string | null;
  departmentId?: string | null;
  credits?: number | null;
  compulsory?: boolean;
  syllabus?: string | null;
}

/**
 * Query parameters for subject list
 */
export interface SubjectListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  categoryId?: string;
  departmentId?: string;
  level?: string;
  compulsory?: boolean;
  hasPrerequisite?: boolean;
  isDefault?: boolean;
  minCredits?: number;
  maxCredits?: number;
}

/**
 * Paginated subject list response
 */
export interface PaginatedSubjectListDTO {
  subjects: SubjectDetailDTO[];
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
 * Subject statistics DTO
 */
export interface SubjectStatisticsDTO extends SubjectStatistics {}

/**
 * Mapper class for converting between Subject entities and DTOs
 */
export class SubjectDTOMapper {
  /**
   * Map Subject entity to BaseDTO
   */
  public static toBaseDTO(subject: SubjectInterface): SubjectBaseDTO {
    return {
      id: subject.id,
      name: subject.name,
      sortOrder: subject.sortOrder,
      code: subject.code,
      description: subject.description,
      level: subject.level,
      isDefault: subject.isDefault,
      schoolId: subject.schoolId,
      categoryId: subject.categoryId,
      prerequisite: subject.prerequisite,
      departmentId: subject.departmentId,
      credits: subject.credits,
      compulsory: subject.compulsory,
      syllabus: subject.syllabus,
    };
  }

  /**
   * Map Subject entity to DetailDTO
   */
  public static toDetailDTO(subject: any): SubjectDetailDTO {
    const baseDTO = this.toBaseDTO(subject);

    const detailDTO: SubjectDetailDTO = {
      ...baseDTO,
      createdAt: subject.createdAt
        ? subject.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: subject.updatedAt
        ? subject.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add related entities if available
    if (subject.school) {
      detailDTO.school = subject.school;
    }

    if (subject.category) {
      detailDTO.category = subject.category;
    }

    if (subject.department) {
      detailDTO.department = subject.department;
    }

    if (subject.prerequisiteSubject) {
      detailDTO.prerequisiteSubject = this.toBaseDTO(
        subject.prerequisiteSubject
      );
    }

    return detailDTO;
  }

  /**
   * Map Subject entity to SimpleDTO
   */
  public static toSimpleDTO(subject: SubjectInterface): SubjectSimpleDTO {
    return this.toBaseDTO(subject);
  }
}
