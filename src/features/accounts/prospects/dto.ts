import { ProspectInterface } from "./interfaces/interfaces";
import { UserDetailDTO } from "../../users/dto";
import { SchoolDetailDTO } from "../../schools/dto";
import { AddressDetailDTO } from "../../address/dto";
import { RoleDetailDTO } from "../../rbac/dto/roles.dto";

/**
 * Base DTO for prospect information
 */
export interface ProspectBaseDTO {
  id: string;
  userId: string;
  schoolId: string;
  roleId: string;
  addressId: string;
  interestLevel: string;
  contactDate: string;
  notes: string | null;
  activeStatus: boolean;
  hasApplied: boolean; // Added hasApplied field
}

/**
 * Detailed prospect DTO with timestamps and related entities
 */
export interface ProspectDetailDTO extends ProspectBaseDTO {
  createdAt: string;
  updatedAt: string;
  user?: UserDetailDTO;
  school?: SchoolDetailDTO;
  role?: RoleDetailDTO;
  address?: AddressDetailDTO;
}

/**
 * Simple prospect DTO without timestamps and sensitive data
 */
export interface ProspectSimpleDTO extends ProspectBaseDTO {}

/**
 * DTO for creating a new prospect
 */
export interface CreateProspectDTO {
  userId: string;
  schoolId: string;
  roleId: string;
  addressId: string;
  interestLevel: string;
  contactDate: string | Date;
  notes?: string | null;
  activeStatus?: boolean;
}

/**
 * DTO for updating a prospect
 */
export interface UpdateProspectDTO {
  schoolId?: string;
  roleId?: string;
  addressId?: string;
  interestLevel?: string;
  contactDate?: string | Date;
  notes?: string | null;
  activeStatus?: boolean;
  hasApplied?: boolean; // Added hasApplied field
}

/**
 * Query parameters for prospect list
 */
export interface ProspectListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  roleId?: string;
  interestLevel?: string;
  activeStatus?: boolean;
  contactDateFrom?: string;
  contactDateTo?: string;
}

/**
 * Paginated prospect list response
 */
export interface PaginatedProspectListDTO {
  prospects: ProspectDetailDTO[];
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
 * Prospect statistics DTO
 */
export interface ProspectStatisticsDTO {
  totalProspects: number;
  prospectsPerSchool: { [schoolId: string]: number };
  prospectsPerRole: { [roleId: string]: number };
  activeProspects: number;
  inactiveProspects: number;
  prospectsPerInterestLevel: { [level: string]: number };
  contactsByMonth: { [month: string]: number };
  contactsByYear: { [year: string]: number };
}

/**
 * Mapper class for converting between Prospect entities and DTOs
 */
export class ProspectDTOMapper {
  /**
   * Map Prospect entity to BaseDTO
   */
  public static toBaseDTO(prospect: ProspectInterface): ProspectBaseDTO {
    return {
      id: prospect.id,
      userId: prospect.userId,
      schoolId: prospect.schoolId,
      roleId: prospect.roleId,
      addressId: prospect.addressId,
      interestLevel: prospect.interestLevel,
      contactDate: prospect.contactDate
        ? prospect.contactDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: prospect.notes || null,
      activeStatus: prospect.activeStatus,
      hasApplied: prospect.hasApplied || false, // Added hasApplied field
    };
  }

  /**
   * Map Prospect entity to DetailDTO
   */
  public static toDetailDTO(prospect: ProspectInterface): ProspectDetailDTO {
    const baseDTO = this.toBaseDTO(prospect);
    const detailDTO: ProspectDetailDTO = {
      ...baseDTO,
      createdAt: prospect.createdAt
        ? prospect.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: prospect.updatedAt
        ? prospect.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add related entities if available
    if (prospect.user) {
      detailDTO.user = prospect.user as any;
    }

    if (prospect.school) {
      detailDTO.school = prospect.school as any;
    }

    if (prospect.role) {
      detailDTO.role = prospect.role as any;
    }

    if (prospect.address) {
      detailDTO.address = prospect.address as any;
    }

    return detailDTO;
  }

  /**
   * Map Prospect entity to SimpleDTO
   */
  public static toSimpleDTO(prospect: ProspectInterface): ProspectSimpleDTO {
    return this.toBaseDTO(prospect);
  }

  /**
   * Prepare data for storage
   */
  public static prepareForStorage(
    prospectData: CreateProspectDTO | UpdateProspectDTO
  ): any {
    const dataToSave = { ...prospectData };
    return dataToSave;
  }
}
