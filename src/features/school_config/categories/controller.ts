import { Request, Response } from "express";
import { ICategoryService } from "./interfaces/services";
import categoryService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class CategoryController {
  private service: ICategoryService;

  constructor(service: ICategoryService) {
    this.service = service;
  }

  /**
   * Get category by ID
   */
  public getCategoryById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCategoryById(id);

      ResponseUtil.sendSuccess(res, result, "Category retrieved successfully");
    } catch (error) {
      logger.error("Error in getCategoryById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new category
   */
  public createCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categoryData = req.body;
      const result = await this.service.createCategory(categoryData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Category created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a category
   */
  public updateCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const result = await this.service.updateCategory(id, categoryData);

      ResponseUtil.sendSuccess(res, result, "Category updated successfully");
    } catch (error) {
      logger.error("Error in updateCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a category
   */
  public deleteCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCategory(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Category deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get category list
   */
  public getCategoryList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getCategoryList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        code: params.code as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Categories retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategoryList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving categories",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get categories by school
   */
  public getCategoriesBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getCategoriesBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's categories retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategoriesBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's categories",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get category statistics
   */
  public getCategoryStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getCategoryStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Category statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategoryStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple categories at once
   */
  public createCategoriesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { categories } = req.body;
      const result = await this.service.createCategoriesBulk(categories);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Categories created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createCategoriesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating categories in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple categories at once
   */
  public deleteCategoriesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteCategoriesBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Categories deleted successfully");
    } catch (error) {
      logger.error("Error in deleteCategoriesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting categories in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get category by code
   */
  public getCategoryByCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { code } = req.params;
      const { schoolId } = req.query;
      const result = await this.service.getCategoryByCode(
        code,
        schoolId as string | undefined
      );

      if (!result) {
        ResponseUtil.sendError(
          res,
          `Category with code ${code} not found`,
          HttpStatus.NOT_FOUND,
          { code: ErrorCode.RES_NOT_FOUND }
        );
        return;
      }

      ResponseUtil.sendSuccess(res, result, "Category retrieved successfully");
    } catch (error) {
      logger.error("Error in getCategoryByCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category by code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new CategoryController(categoryService);
