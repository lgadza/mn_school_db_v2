import { CategoryInterface, CategoryStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";

/**
 * Base DTO for category information
 */
export interface CategoryBaseDTO {
  id: string;
  name: string;
  code: string | null;
  schoolId: string;
  description: string | null;
}

/**
 * Detailed category DTO with timestamps
 */
export interface CategoryDetailDTO extends CategoryBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
}

/**
 * Simple category DTO without timestamps
 */
export interface CategorySimpleDTO extends CategoryBaseDTO {}

/**
 * DTO for creating a new category
 */
export interface CreateCategoryDTO {
  name: string;
  code?: string | null;
  schoolId: string;
  description?: string | null;
}

/**
 * DTO for updating a category
 */
export interface UpdateCategoryDTO {
  name?: string;
  code?: string | null;
  schoolId?: string;
  description?: string | null;
}

/**
 * Query parameters for category list
 */
export interface CategoryListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  code?: string;
}

/**
 * Paginated category list response
 */
export interface PaginatedCategoryListDTO {
  categories: CategoryDetailDTO[];
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
 * Category statistics DTO
 */
export interface CategoryStatisticsDTO extends CategoryStatistics {}

/**
 * Mapper class for converting between Category entities and DTOs
 */
export class CategoryDTOMapper {
  /**
   * Map Category entity to BaseDTO
   */
  public static toBaseDTO(category: CategoryInterface): CategoryBaseDTO {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      schoolId: category.schoolId,
      description: category.description,
    };
  }

  /**
   * Map Category entity to DetailDTO
   */
  public static toDetailDTO(category: any): CategoryDetailDTO {
    const baseDTO = this.toBaseDTO(category);

    return {
      ...baseDTO,
      createdAt: category.createdAt
        ? category.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: category.updatedAt
        ? category.updatedAt.toISOString()
        : new Date().toISOString(),
      school: category.school ? category.school : undefined,
    };
  }

  /**
   * Map Category entity to SimpleDTO
   */
  public static toSimpleDTO(category: CategoryInterface): CategorySimpleDTO {
    return this.toBaseDTO(category);
  }
}
