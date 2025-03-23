import {
  SchoolInterface,
  SchoolLevel,
  SchoolType,
} from "./interfaces/interfaces";
import { AddressDetailDTO } from "../address/dto";

/**
 * Base DTO for school information
 */
export interface SchoolBaseDTO {
  id: string;
  name: string;
  level: SchoolLevel;
  isPublic: boolean;
  motto: string | null;
  principalId: string;
  adminId: string | null;
  addressId: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  shortName: string;
  capacity: string | null;
  yearOpened: number;
  schoolCode: string;
  schoolType: SchoolType;
  contactNumber: string;
  email: string | null;
}

/**
 * Detailed school DTO with timestamps
 */
export interface SchoolDetailDTO extends SchoolBaseDTO {
  createdAt: string;
  updatedAt: string;
  address?: AddressDetailDTO;
}

/**
 * Simple school DTO without timestamps
 */
export interface SchoolSimpleDTO extends SchoolBaseDTO {}

/**
 * DTO for creating a new school
 */
export interface CreateSchoolDTO {
  name: string;
  level: SchoolLevel;
  isPublic: boolean;
  motto?: string | null;
  principalId: string;
  adminId?: string | null;
  addressId: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  shortName: string;
  capacity?: string | null;
  yearOpened: number;
  schoolCode?: string;
  schoolType: SchoolType;
  contactNumber: string;
  email?: string | null;
}

/**
 * DTO for updating a school
 */
export interface UpdateSchoolDTO {
  name?: string;
  level?: SchoolLevel;
  isPublic?: boolean;
  motto?: string | null;
  principalId?: string;
  adminId?: string | null;
  addressId?: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  shortName?: string;
  capacity?: string | null;
  yearOpened?: number;
  schoolCode?: string;
  schoolType?: SchoolType;
  contactNumber?: string;
  email?: string | null;
}

/**
 * Query parameters for school list
 */
export interface SchoolListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  level?: SchoolLevel;
  isPublic?: boolean;
  schoolType?: SchoolType;
  yearOpened?: number;
}

/**
 * Paginated school list response
 */
export interface PaginatedSchoolListDTO {
  schools: SchoolDetailDTO[];
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
 * Mapper class for converting between School entities and DTOs
 */
export class SchoolDTOMapper {
  /**
   * Map School entity to BaseDTO
   */
  public static toBaseDTO(school: SchoolInterface): SchoolBaseDTO {
    return {
      id: school.id,
      name: school.name,
      level: school.level,
      isPublic: school.isPublic,
      motto: school.motto,
      principalId: school.principalId,
      adminId: school.adminId,
      addressId: school.addressId,
      logoUrl: school.logoUrl,
      websiteUrl: school.websiteUrl,
      shortName: school.shortName,
      capacity: school.capacity,
      yearOpened: school.yearOpened,
      schoolCode: school.schoolCode,
      schoolType: school.schoolType,
      contactNumber: school.contactNumber,
      email: school.email,
    };
  }

  /**
   * Map School entity to DetailDTO
   */
  public static toDetailDTO(school: any): SchoolDetailDTO {
    return {
      ...this.toBaseDTO(school),
      createdAt: school.createdAt
        ? school.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: school.updatedAt
        ? school.updatedAt.toISOString()
        : new Date().toISOString(),
      address: school.address ? school.address : undefined,
    };
  }

  /**
   * Map School entity to SimpleDTO
   */
  public static toSimpleDTO(school: SchoolInterface): SchoolSimpleDTO {
    return this.toBaseDTO(school);
  }
}
