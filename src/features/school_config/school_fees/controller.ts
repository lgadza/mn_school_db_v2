import { Request, Response } from "express";
import { ISchoolFeeService } from "./interfaces/services";
import logger from "@/common/utils/logging/logger";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SchoolFeeController {
  private service: ISchoolFeeService;

  constructor(service: ISchoolFeeService) {
    this.service = service;
  }

  /**
   * Get school fee by ID
   */
  public getSchoolFeeById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSchoolFeeById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School fee retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolFeeById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school fee",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new school fee
   */
  public createSchoolFee = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const schoolFeeData = req.body;
      const result = await this.service.createSchoolFee(schoolFeeData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School fee created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSchoolFee controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating school fee",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a school fee
   */
  public updateSchoolFee = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const schoolFeeData = req.body;
      const result = await this.service.updateSchoolFee(id, schoolFeeData);

      ResponseUtil.sendSuccess(res, result, "School fee updated successfully");
    } catch (error) {
      logger.error("Error in updateSchoolFee controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating school fee",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a school fee
   */
  public deleteSchoolFee = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteSchoolFee(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "School fee deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteSchoolFee controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting school fee",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school fee list
   */
  public getSchoolFeeList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getSchoolFeeList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        category: params.category as string,
        frequency: params.frequency as string,
        status: params.status as string,
        isOptional: params.isOptional === "true",
        minAmount: params.minAmount
          ? parseFloat(params.minAmount as string)
          : undefined,
        maxAmount: params.maxAmount
          ? parseFloat(params.maxAmount as string)
          : undefined,
        currency: params.currency as string,
        appliesTo: params.appliesTo as string,
        discountEligible: params.discountEligible === "true",
        taxable: params.taxable === "true",
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "School fees retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolFeeList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school fees",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school fees by school
   */
  public getSchoolFeesBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getSchoolFeesBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's fees retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolFeesBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's fees",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school fees by category
   */
  public getSchoolFeesByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { category } = req.params;
      const result = await this.service.getSchoolFeesByCategory(category);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Category fees retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolFeesByCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category fees",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school fee statistics
   */
  public getSchoolFeeStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getSchoolFeeStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "School fee statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolFeeStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school fee statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple school fees at once
   */
  public createSchoolFeesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolFees } = req.body;
      const result = await this.service.createSchoolFeesBulk(schoolFees);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School fees created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSchoolFeesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating school fees in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple school fees at once
   */
  public deleteSchoolFeesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteSchoolFeesBulk(ids);

      ResponseUtil.sendSuccess(res, result, "School fees deleted successfully");
    } catch (error) {
      logger.error("Error in deleteSchoolFeesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting school fees in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Replace the placeholder initialization with the actual service
import schoolFeeService from "./service";

// Create and export the controller instance with the real service
export default new SchoolFeeController(schoolFeeService);
