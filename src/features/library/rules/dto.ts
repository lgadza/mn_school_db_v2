import { RentalRuleInterface } from "./model";

/**
 * Base DTO for rental rule information
 */
export interface RentalRuleBaseDTO {
  id: string;
  name: string;
  rentalPeriodDays: number;
  maxBooksPerStudent: number;
  renewalAllowed: boolean;
  lateFeePerDay: number | null;
  schoolId: string;
  description: string | null;
  renewalLimit: number | null;
}

/**
 * Detailed rental rule DTO with timestamps
 */
export interface RentalRuleDetailDTO extends RentalRuleBaseDTO {
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new rental rule
 */
export interface CreateRentalRuleDTO {
  name: string;
  rentalPeriodDays: number;
  maxBooksPerStudent: number;
  renewalAllowed: boolean;
  lateFeePerDay?: number | null;
  schoolId: string;
  description?: string | null;
  renewalLimit?: number | null;
}

/**
 * DTO for updating a rental rule
 */
export interface UpdateRentalRuleDTO {
  name?: string;
  rentalPeriodDays?: number;
  maxBooksPerStudent?: number;
  renewalAllowed?: boolean;
  lateFeePerDay?: number | null;
  description?: string | null;
  renewalLimit?: number | null;
}

/**
 * Query parameters for rental rule list
 */
export interface RentalRuleListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
}

/**
 * Paginated rental rule list response
 */
export interface PaginatedRentalRuleListDTO {
  rules: RentalRuleDetailDTO[];
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
 * Mapper class for converting between RentalRule entities and DTOs
 */
export class RentalRuleDTOMapper {
  /**
   * Map RentalRule entity to BaseDTO
   */
  public static toBaseDTO(rule: RentalRuleInterface): RentalRuleBaseDTO {
    return {
      id: rule.id,
      name: rule.name,
      rentalPeriodDays: rule.rentalPeriodDays,
      maxBooksPerStudent: rule.maxBooksPerStudent,
      renewalAllowed: rule.renewalAllowed,
      lateFeePerDay:
        rule.lateFeePerDay !== undefined ? rule.lateFeePerDay : null,
      schoolId: rule.schoolId,
      description: rule.description !== undefined ? rule.description : null,
      renewalLimit: rule.renewalLimit !== undefined ? rule.renewalLimit : null,
    };
  }

  /**
   * Map RentalRule entity to DetailDTO
   */
  public static toDetailDTO(rule: RentalRuleInterface): RentalRuleDetailDTO {
    return {
      ...this.toBaseDTO(rule),
      createdAt: rule.createdAt
        ? rule.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: rule.updatedAt
        ? rule.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
