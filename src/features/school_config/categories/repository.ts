import { ICategoryRepository } from "./interfaces/services";
import { CategoryInterface, CategoryStatistics } from "./interfaces/interfaces";
import Category from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  CategoryListQueryParams,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class CategoryRepository implements ICategoryRepository {
  /**
   * Find a category by ID
   */
  public async findCategoryById(id: string): Promise<CategoryInterface | null> {
    try {
      return await Category.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding category by ID:", error);
      throw new DatabaseError("Database error while finding category", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId: id },
      });
    }
  }

  /**
   * Create a new category
   */
  public async createCategory(
    categoryData: CreateCategoryDTO,
    transaction?: Transaction
  ): Promise<CategoryInterface> {
    try {
      return await Category.create(categoryData as any, { transaction });
    } catch (error) {
      logger.error("Error creating category:", error);
      throw new DatabaseError("Database error while creating category", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a category
   */
  public async updateCategory(
    id: string,
    categoryData: UpdateCategoryDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Category.update(categoryData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating category:", error);
      throw new DatabaseError("Database error while updating category", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId: id },
      });
    }
  }

  /**
   * Delete a category
   */
  public async deleteCategory(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Category.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting category:", error);
      throw new DatabaseError("Database error while deleting category", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId: id },
      });
    }
  }

  /**
   * Get category list with filtering and pagination
   */
  public async getCategoryList(params: CategoryListQueryParams): Promise<{
    categories: CategoryInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        schoolId,
        code,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (code) {
        where.code = code;
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { code: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get categories and total count
      const { count, rows } = await Category.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });

      return {
        categories: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting category list:", error);
      throw new DatabaseError("Database error while getting category list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find categories by school ID
   */
  public async findCategoriesBySchool(
    schoolId: string
  ): Promise<CategoryInterface[]> {
    try {
      return await Category.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding categories by school:", error);
      throw new DatabaseError(
        "Database error while finding categories by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Get category statistics
   */
  public async getCategoryStatistics(): Promise<CategoryStatistics> {
    try {
      // Get total categories count
      const totalCategories = await Category.count();

      // Get categories per school
      const categoriesPerSchoolResult = await Category.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const categoriesPerSchool: { [schoolId: string]: number } = {};
      categoriesPerSchoolResult.forEach((result: any) => {
        categoriesPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get categories by code
      const categoriesByCodeResult = await Category.findAll({
        attributes: [
          "code",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          code: {
            [Op.ne]: null,
          },
        },
        group: ["code"],
        raw: true,
      });

      const categoriesByCode: { [code: string]: number } = {};
      categoriesByCodeResult.forEach((result: any) => {
        if (result.code) {
          categoriesByCode[result.code] = parseInt(result.count, 10);
        }
      });

      return {
        totalCategories,
        categoriesPerSchool,
        categoriesByCode,
      };
    } catch (error) {
      logger.error("Error getting category statistics:", error);
      throw new DatabaseError(
        "Database error while getting category statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple categories at once
   */
  public async createCategoriesBulk(
    categoriesData: CreateCategoryDTO[],
    transaction?: Transaction
  ): Promise<CategoryInterface[]> {
    try {
      // Create all categories
      const createdCategories = await Category.bulkCreate(
        categoriesData as any,
        {
          transaction,
        }
      );

      // Return the created categories
      return createdCategories;
    } catch (error) {
      logger.error("Error bulk creating categories:", error);
      throw new DatabaseError("Database error while bulk creating categories", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple categories at once
   */
  public async deleteCategoriesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Category.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting categories:", error);
      throw new DatabaseError("Database error while bulk deleting categories", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          categoryIds: ids,
        },
      });
    }
  }

  /**
   * Find a category by code
   */
  public async findCategoryByCode(
    code: string,
    schoolId?: string
  ): Promise<CategoryInterface | null> {
    try {
      const whereClause: any = { code };

      if (schoolId) {
        whereClause.schoolId = schoolId;
      }

      return await Category.findOne({
        where: whereClause,
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding category by code:", error);
      throw new DatabaseError("Database error while finding category by code", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          categoryCode: code,
          schoolId,
        },
      });
    }
  }
}

// Create and export repository instance
export default new CategoryRepository();
