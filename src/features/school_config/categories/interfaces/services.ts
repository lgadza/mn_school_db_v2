import { CategoryInterface, CategoryStatistics } from "./interfaces";
import {
  CreateCategoryDTO,
  CategoryDetailDTO,
  CategoryListQueryParams,
  PaginatedCategoryListDTO,
  UpdateCategoryDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Category repository interface
 * Defines data access methods for categories
 */
export interface ICategoryRepository {
  /**
   * Find a category by ID
   */
  findCategoryById(id: string): Promise<CategoryInterface | null>;

  /**
   * Create a new category
   */
  createCategory(
    categoryData: CreateCategoryDTO,
    transaction?: Transaction
  ): Promise<CategoryInterface>;

  /**
   * Update a category
   */
  updateCategory(
    id: string,
    categoryData: UpdateCategoryDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a category
   */
  deleteCategory(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get category list with filtering and pagination
   */
  getCategoryList(params: CategoryListQueryParams): Promise<{
    categories: CategoryInterface[];
    total: number;
  }>;

  /**
   * Find categories by school ID
   */
  findCategoriesBySchool(schoolId: string): Promise<CategoryInterface[]>;

  /**
   * Get category statistics
   */
  getCategoryStatistics(): Promise<CategoryStatistics>;

  /**
   * Create multiple categories at once
   */
  createCategoriesBulk(
    categoriesData: CreateCategoryDTO[],
    transaction?: Transaction
  ): Promise<CategoryInterface[]>;

  /**
   * Delete multiple categories at once
   */
  deleteCategoriesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number>;

  /**
   * Find a category by code
   */
  findCategoryByCode(
    code: string,
    schoolId?: string
  ): Promise<CategoryInterface | null>;
}

/**
 * Category service interface
 * Defines business logic methods for categories
 */
export interface ICategoryService {
  /**
   * Get category by ID
   */
  getCategoryById(id: string): Promise<CategoryDetailDTO>;

  /**
   * Create a new category
   */
  createCategory(categoryData: CreateCategoryDTO): Promise<CategoryDetailDTO>;

  /**
   * Update a category
   */
  updateCategory(
    id: string,
    categoryData: UpdateCategoryDTO
  ): Promise<CategoryDetailDTO>;

  /**
   * Delete a category
   */
  deleteCategory(id: string): Promise<boolean>;

  /**
   * Get paginated category list
   */
  getCategoryList(
    params: CategoryListQueryParams
  ): Promise<PaginatedCategoryListDTO>;

  /**
   * Get categories by school
   */
  getCategoriesBySchool(schoolId: string): Promise<CategoryDetailDTO[]>;

  /**
   * Validate category data
   */
  validateCategoryData(
    categoryData: CreateCategoryDTO | UpdateCategoryDTO
  ): Promise<boolean>;

  /**
   * Get category statistics
   */
  getCategoryStatistics(): Promise<CategoryStatistics>;

  /**
   * Create multiple categories at once
   */
  createCategoriesBulk(
    categoriesData: CreateCategoryDTO[]
  ): Promise<CategoryDetailDTO[]>;

  /**
   * Delete multiple categories at once
   */
  deleteCategoriesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;

  /**
   * Get category by code
   */
  getCategoryByCode(
    code: string,
    schoolId?: string
  ): Promise<CategoryDetailDTO | null>;
}
