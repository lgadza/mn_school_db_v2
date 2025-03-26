import {
  SchoolFeeInterface,
  SchoolFeeStatistics,
} from "./interfaces/interfaces";

/**
 * School DTO with minimal info for fee responses
 */
export interface SchoolMinimalDTO {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
}

/**
 * Base DTO for school fee information
 */
export interface SchoolFeeBaseDTO {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  amount: number;
  formattedAmount: string;
  currency: string;
  frequency: string;
  dueDate: string | null;
  isOptional: boolean;
  appliesTo: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  category: string;
  lateFee: number | null;
  discountEligible: boolean;
  taxable: boolean;
}

/**
 * Detailed school fee DTO with timestamps and school info
 */
export interface SchoolFeeDetailDTO extends SchoolFeeBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolMinimalDTO;
}

/**
 * Simple school fee DTO without timestamps
 */
export interface SchoolFeeSimpleDTO extends SchoolFeeBaseDTO {}

/**
 * DTO for creating a new school fee
 */
export interface CreateSchoolFeeDTO {
  schoolId: string;
  name: string;
  description?: string | null;
  amount: number;
  currency?: string;
  frequency?: string;
  dueDate?: Date | string | null;
  isOptional?: boolean;
  appliesTo?: string;
  status?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  category?: string;
  lateFee?: number | null;
  discountEligible?: boolean;
  taxable?: boolean;
}

/**
 * DTO for updating a school fee
 */
export interface UpdateSchoolFeeDTO {
  schoolId?: string;
  name?: string;
  description?: string | null;
  amount?: number;
  currency?: string;
  frequency?: string;
  dueDate?: Date | string | null;
  isOptional?: boolean;
  appliesTo?: string;
  status?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  category?: string;
  lateFee?: number | null;
  discountEligible?: boolean;
  taxable?: boolean;
}

/**
 * Query parameters for school fee list
 */
export interface SchoolFeeListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  category?: string;
  frequency?: string;
  status?: string;
  isOptional?: boolean;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  appliesTo?: string;
  discountEligible?: boolean;
  taxable?: boolean;
}

/**
 * Paginated school fee list response
 */
export interface PaginatedSchoolFeeListDTO {
  schoolFees: SchoolFeeDetailDTO[];
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
 * School fee statistics DTO
 */
export interface SchoolFeeStatisticsDTO extends SchoolFeeStatistics {}

/**
 * Mapper class for converting between SchoolFee entities and DTOs
 */
export class SchoolFeeDTOMapper {
  /**
   * Map School entity to minimal DTO
   */
  public static toSchoolMinimalDTO(school: any): SchoolMinimalDTO {
    return {
      id: school.id,
      name: school.name,
      shortName: school.shortName,
      fullName: `${school.name} - ${school.shortName}`,
    };
  }

  /**
   * Map SchoolFee entity to BaseDTO
   */
  public static toBaseDTO(schoolFee: SchoolFeeInterface): SchoolFeeBaseDTO {
    return {
      id: schoolFee.id,
      schoolId: schoolFee.schoolId,
      name: schoolFee.name,
      description: schoolFee.description,
      amount: parseFloat(schoolFee.amount.toString()),
      formattedAmount: `${schoolFee.currency} ${parseFloat(
        schoolFee.amount.toString()
      ).toFixed(2)}`,
      currency: schoolFee.currency,
      frequency: schoolFee.frequency,
      dueDate: schoolFee.dueDate ? schoolFee.dueDate.toISOString() : null,
      isOptional: schoolFee.isOptional,
      appliesTo: schoolFee.appliesTo,
      status: schoolFee.status,
      startDate: schoolFee.startDate ? schoolFee.startDate.toISOString() : null,
      endDate: schoolFee.endDate ? schoolFee.endDate.toISOString() : null,
      category: schoolFee.category,
      lateFee: schoolFee.lateFee
        ? parseFloat(schoolFee.lateFee.toString())
        : null,
      discountEligible: schoolFee.discountEligible,
      taxable: schoolFee.taxable,
    };
  }

  /**
   * Map SchoolFee entity to DetailDTO
   */
  public static toDetailDTO(schoolFee: any): SchoolFeeDetailDTO {
    const baseDTO = this.toBaseDTO(schoolFee);

    return {
      ...baseDTO,
      createdAt: schoolFee.createdAt
        ? schoolFee.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: schoolFee.updatedAt
        ? schoolFee.updatedAt.toISOString()
        : new Date().toISOString(),
      school: schoolFee.school
        ? this.toSchoolMinimalDTO(schoolFee.school)
        : undefined,
    };
  }

  /**
   * Map SchoolFee entity to SimpleDTO
   */
  public static toSimpleDTO(schoolFee: SchoolFeeInterface): SchoolFeeSimpleDTO {
    return this.toBaseDTO(schoolFee);
  }
}
