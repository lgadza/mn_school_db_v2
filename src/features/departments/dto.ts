import {
  DepartmentInterface,
  DepartmentStatistics,
} from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../schools/dto";

/**
 * Base DTO for department information
 */
export interface DepartmentBaseDTO {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  headOfDepartmentId: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  facultyCount: number | null;
  studentCount: number | null;
  location: string | null;
  budget: number | null;
  schoolId: string;
  isDefault: boolean;
}

/**
 * Detailed department DTO with timestamps
 */
export interface DepartmentDetailDTO extends DepartmentBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple department DTO without timestamps
 */
export interface DepartmentSimpleDTO extends DepartmentBaseDTO {}

/**
 * DTO for creating a new department
 */
export interface CreateDepartmentDTO {
  name: string;
  code?: string | null;
  description?: string | null;
  headOfDepartmentId?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  facultyCount?: number | null;
  studentCount?: number | null;
  location?: string | null;
  budget?: number | null;
  schoolId: string;
  isDefault?: boolean;
}

/**
 * DTO for updating a department
 */
export interface UpdateDepartmentDTO {
  name?: string;
  code?: string | null;
  description?: string | null;
  headOfDepartmentId?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  facultyCount?: number | null;
  studentCount?: number | null;
  location?: string | null;
  budget?: number | null;
  schoolId?: string;
  isDefault?: boolean;
}

/**
 * Query parameters for department list
 */
export interface DepartmentListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  headOfDepartmentId?: string;
  isDefault?: boolean;
  minFacultyCount?: number;
  maxFacultyCount?: number;
  minStudentCount?: number;
  maxStudentCount?: number;
  minBudget?: number;
  maxBudget?: number;
}

/**
 * Paginated department list response
 */
export interface PaginatedDepartmentListDTO {
  departments: DepartmentDetailDTO[];
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
 * Department statistics DTO
 */
export interface DepartmentStatisticsDTO extends DepartmentStatistics {}

/**
 * Mapper class for converting between Department entities and DTOs
 */
export class DepartmentDTOMapper {
  /**
   * Map Department entity to BaseDTO
   */
  public static toBaseDTO(department: DepartmentInterface): DepartmentBaseDTO {
    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      headOfDepartmentId: department.headOfDepartmentId,
      contactEmail: department.contactEmail,
      phoneNumber: department.phoneNumber,
      facultyCount: department.facultyCount,
      studentCount: department.studentCount,
      location: department.location,
      budget: department.budget ? Number(department.budget) : null,
      schoolId: department.schoolId,
      isDefault: department.isDefault,
    };
  }

  /**
   * Map Department entity to DetailDTO
   */
  public static toDetailDTO(department: any): DepartmentDetailDTO {
    const baseDTO = this.toBaseDTO(department);

    return {
      ...baseDTO,
      createdAt: department.createdAt
        ? department.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: department.updatedAt
        ? department.updatedAt.toISOString()
        : new Date().toISOString(),
      school: department.school ? department.school : undefined,
    };
  }

  /**
   * Map Department entity to SimpleDTO
   */
  public static toSimpleDTO(
    department: DepartmentInterface
  ): DepartmentSimpleDTO {
    return this.toBaseDTO(department);
  }
}
