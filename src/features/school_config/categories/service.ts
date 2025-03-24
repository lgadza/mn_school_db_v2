import { ICategoryService, ICategoryRepository } from "./interfaces/services";
import {
  CategoryDetailDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  PaginatedCategoryListDTO,
  CategoryListQueryParams,
  CategoryDTOMapper,
} from "./dto";
import { CategoryStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import schoolService from "../../schools/service";
import db from "@/config/database";

export class CategoryService implements ICategoryService {
  private repository: ICategoryRepository;
  private readonly CACHE_PREFIX = "category:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ICategoryRepository) {
    this.repository = repository;
  }

  /**
   * Get category by ID
   */
  public async getCategoryById(id: string): Promise<CategoryDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedCategory = await cache.get(cacheKey);

      if (cachedCategory) {
        return JSON.parse(cachedCategory);
      }

      // Get from database if not in cache
      const category = await this.repository.findCategoryById(id);
      if (!category) {
        throw new NotFoundError(`Category with ID ${id} not found`);
      }

      // Map to DTO with school
      const categoryDTO = CategoryDTOMapper.toDetailDTO(category);

      // If the category has a school, map it to a school DTO
      if (category.school) {
        categoryDTO.school = SchoolDTOMapper.toDetailDTO(category.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(categoryDTO), this.CACHE_TTL);

      return categoryDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoryById service:", error);
      throw new AppError("Failed to get category");
    }
  }

  /**
   * Create a new category
   */
  public async createCategory(
    categoryData: CreateCategoryDTO
  ): Promise<CategoryDetailDTO> {
    try {
      // Validate data
      await this.validateCategoryData(categoryData);

      // Check if school exists
      await schoolService.getSchoolById(categoryData.schoolId);

      // Check if code already exists (if provided)
      if (categoryData.code) {
        const existingCategory = await this.repository.findCategoryByCode(
          categoryData.code,
          categoryData.schoolId
        );

        if (existingCategory) {
          throw new BadRequestError(
            `Category with code '${categoryData.code}' already exists in this school`
          );
        }
      }

      // Create the category
      const newCategory = await this.repository.createCategory(categoryData);

      // Get the complete category with school
      const category = await this.repository.findCategoryById(newCategory.id);
      if (!category) {
        throw new AppError("Failed to retrieve created category");
      }

      // Map to DTO with school
      const categoryDTO = CategoryDTOMapper.toDetailDTO(category);

      if (category.school) {
        categoryDTO.school = SchoolDTOMapper.toDetailDTO(category.school);
      }

      return categoryDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createCategory service:", error);
      throw new AppError("Failed to create category");
    }
  }

  /**
   * Update a category
   */
  public async updateCategory(
    id: string,
    categoryData: UpdateCategoryDTO
  ): Promise<CategoryDetailDTO> {
    try {
      // Check if category exists
      const existingCategory = await this.repository.findCategoryById(id);
      if (!existingCategory) {
        throw new NotFoundError(`Category with ID ${id} not found`);
      }

      // Validate data
      await this.validateCategoryData(categoryData);

      // Check if school exists if schoolId is provided
      if (categoryData.schoolId) {
        await schoolService.getSchoolById(categoryData.schoolId);
      }

      // Check if code already exists (if provided and changed)
      if (categoryData.code && categoryData.code !== existingCategory.code) {
        const schoolIdToCheck =
          categoryData.schoolId || existingCategory.schoolId;
        const duplicateCategory = await this.repository.findCategoryByCode(
          categoryData.code,
          schoolIdToCheck
        );

        if (duplicateCategory && duplicateCategory.id !== id) {
          throw new BadRequestError(
            `Category with code '${categoryData.code}' already exists in this school`
          );
        }
      }

      // Update category
      await this.repository.updateCategory(id, categoryData);

      // Clear cache
      await this.clearCategoryCache(id);

      // Get the updated category
      return this.getCategoryById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateCategory service:", error);
      throw new AppError("Failed to update category");
    }
  }

  /**
   * Delete a category
   */
  public async deleteCategory(id: string): Promise<boolean> {
    try {
      // Check if category exists
      const existingCategory = await this.repository.findCategoryById(id);
      if (!existingCategory) {
        throw new NotFoundError(`Category with ID ${id} not found`);
      }

      // Delete the category
      const result = await this.repository.deleteCategory(id);

      // Clear cache
      await this.clearCategoryCache(id);

      // Clear school categories cache
      await cache.del(
        `${this.CACHE_PREFIX}school:${existingCategory.schoolId}`
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteCategory service:", error);
      throw new AppError("Failed to delete category");
    }
  }

  /**
   * Get paginated category list
   */
  public async getCategoryList(
    params: CategoryListQueryParams
  ): Promise<PaginatedCategoryListDTO> {
    try {
      const { categories, total } = await this.repository.getCategoryList(
        params
      );

      // Map to DTOs with schools
      const categoryDTOs = categories.map((category) => {
        const categoryDTO = CategoryDTOMapper.toDetailDTO(category);

        if (category.school) {
          categoryDTO.school = SchoolDTOMapper.toDetailDTO(category.school);
        }

        return categoryDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        categories: categoryDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoryList service:", error);
      throw new AppError("Failed to get category list");
    }
  }

  /**
   * Get categories by school
   */
  public async getCategoriesBySchool(
    schoolId: string
  ): Promise<CategoryDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedCategories = await cache.get(cacheKey);

      if (cachedCategories) {
        return JSON.parse(cachedCategories);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const categories = await this.repository.findCategoriesBySchool(schoolId);

      // Map to DTOs with schools
      const categoryDTOs = categories.map((category) => {
        const categoryDTO = CategoryDTOMapper.toDetailDTO(category);

        if (category.school) {
          categoryDTO.school = SchoolDTOMapper.toDetailDTO(category.school);
        }

        return categoryDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(categoryDTOs), this.CACHE_TTL);

      return categoryDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoriesBySchool service:", error);
      throw new AppError("Failed to get categories by school");
    }
  }

  /**
   * Validate category data
   */
  public async validateCategoryData(
    categoryData: CreateCategoryDTO | UpdateCategoryDTO
  ): Promise<boolean> {
    // Validate name length
    if ("name" in categoryData && categoryData.name) {
      if (categoryData.name.length > 100) {
        throw new BadRequestError("Name cannot exceed 100 characters");
      }
    }

    // Validate code length
    if ("code" in categoryData && categoryData.code) {
      if (categoryData.code.length > 50) {
        throw new BadRequestError("Code cannot exceed 50 characters");
      }
    }

    return true;
  }

  /**
   * Get category statistics
   */
  public async getCategoryStatistics(): Promise<CategoryStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getCategoryStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoryStatistics service:", error);
      throw new AppError("Failed to get category statistics");
    }
  }

  /**
   * Create multiple categories at once
   */
  public async createCategoriesBulk(
    categoriesData: CreateCategoryDTO[]
  ): Promise<CategoryDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check for duplicate codes within the same school
      const codeSchoolMap = new Map<string, string[]>();

      for (const categoryData of categoriesData) {
        await this.validateCategoryData(categoryData);

        // Check if school exists
        await schoolService.getSchoolById(categoryData.schoolId);

        // Track codes by school to check for duplicates in the bulk data
        if (categoryData.code) {
          const schoolCodes = codeSchoolMap.get(categoryData.schoolId) || [];
          if (schoolCodes.includes(categoryData.code)) {
            throw new BadRequestError(
              `Duplicate code '${categoryData.code}' found in bulk creation data for school ${categoryData.schoolId}`
            );
          }
          schoolCodes.push(categoryData.code);
          codeSchoolMap.set(categoryData.schoolId, schoolCodes);

          // Check against existing codes in the database
          const existingCategory = await this.repository.findCategoryByCode(
            categoryData.code,
            categoryData.schoolId
          );

          if (existingCategory) {
            throw new BadRequestError(
              `Category with code '${categoryData.code}' already exists in school ${categoryData.schoolId}`
            );
          }
        }
      }

      // Create categories in bulk
      const newCategories = await this.repository.createCategoriesBulk(
        categoriesData,
        transaction
      );

      await transaction.commit();

      // Get the complete categories with schools
      const categoryIds = newCategories.map((category) => category.id);
      const detailedCategories: CategoryDetailDTO[] = [];

      for (const id of categoryIds) {
        const category = await this.repository.findCategoryById(id);
        if (category) {
          const categoryDTO = CategoryDTOMapper.toDetailDTO(category);

          if (category.school) {
            categoryDTO.school = SchoolDTOMapper.toDetailDTO(category.school);
          }

          detailedCategories.push(categoryDTO);
        }
      }

      return detailedCategories;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createCategoriesBulk service:", error);
      throw new AppError("Failed to create categories in bulk");
    }
  }

  /**
   * Delete multiple categories at once
   */
  public async deleteCategoriesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify categories exist
      const categories = await Promise.all(
        ids.map((id) => this.repository.findCategoryById(id))
      );

      // Filter out any null results (categories not found)
      const existingCategories = categories.filter(
        (category) => category !== null
      );

      if (existingCategories.length === 0) {
        throw new NotFoundError("None of the specified categories were found");
      }

      // Delete categories
      const deletedCount = await this.repository.deleteCategoriesBulk(
        existingCategories.map((category) => category!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted category
      for (const category of existingCategories) {
        if (category) {
          await this.clearCategoryCache(category.id);

          // Clear school categories cache
          await cache.del(`${this.CACHE_PREFIX}school:${category.schoolId}`);
        }
      }

      return {
        success: true,
        count: deletedCount,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteCategoriesBulk service:", error);
      throw new AppError("Failed to delete categories in bulk");
    }
  }

  /**
   * Get category by code
   */
  public async getCategoryByCode(
    code: string,
    schoolId?: string
  ): Promise<CategoryDetailDTO | null> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}code:${code}${
        schoolId ? `:${schoolId}` : ""
      }`;
      const cachedCategory = await cache.get(cacheKey);

      if (cachedCategory) {
        return JSON.parse(cachedCategory);
      }

      // Get from database if not in cache
      const category = await this.repository.findCategoryByCode(code, schoolId);

      if (!category) {
        return null;
      }

      // Map to DTO with school
      const categoryDTO = CategoryDTOMapper.toDetailDTO(category);

      // If the category has a school, map it to a school DTO
      if (category.school) {
        categoryDTO.school = SchoolDTOMapper.toDetailDTO(category.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(categoryDTO), this.CACHE_TTL);

      return categoryDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCategoryByCode service:", error);
      throw new AppError("Failed to get category by code");
    }
  }

  /**
   * Clear category cache
   */
  private async clearCategoryCache(categoryId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${categoryId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new CategoryService(repository);
