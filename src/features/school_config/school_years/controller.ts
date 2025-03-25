import { Request, Response } from "express";
import { ISchoolYearService } from "./interfaces/services";
import schoolYearService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SchoolYearController {
  private service: ISchoolYearService;

  constructor(service: ISchoolYearService) {
    this.service = service;
  }

  /**
   * Get school year by ID
   */
  public getSchoolYearById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSchoolYearById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School year retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolYearById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school year",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new school year
   */
  public createSchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const schoolYearData = req.body;
      const result = await this.service.createSchoolYear(schoolYearData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School year created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating school year",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a school year
   */
  public updateSchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const schoolYearData = req.body;
      const result = await this.service.updateSchoolYear(id, schoolYearData);

      ResponseUtil.sendSuccess(res, result, "School year updated successfully");
    } catch (error) {
      logger.error("Error in updateSchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating school year",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a school year
   */
  public deleteSchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteSchoolYear(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "School year deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteSchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting school year",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school year list
   */
  public getSchoolYearList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getSchoolYearList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        status: params.status as string,
        year: params.year as string,
        currentOnly:
          params.currentOnly === "true"
            ? true
            : params.currentOnly === "false"
            ? false
            : undefined,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "School years retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolYearList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school years",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school years by school
   */
  public getSchoolYearsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getSchoolYearsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's years retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolYearsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's years",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school year statistics
   */
  public getSchoolYearStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getSchoolYearStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "School year statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolYearStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school year statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple school years at once
   */
  public createSchoolYearsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolYears } = req.body;
      const result = await this.service.createSchoolYearsBulk(schoolYears);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School years created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSchoolYearsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating school years in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get active school year for a school
   */
  public getActiveSchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getActiveSchoolYear(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        result
          ? "Active school year retrieved successfully"
          : "No active school year found"
      );
    } catch (error) {
      logger.error("Error in getActiveSchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving active school year",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get current school year based on current date
   */
  public getCurrentSchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getCurrentSchoolYear(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        result
          ? "Current school year retrieved successfully"
          : "No current school year found"
      );
    } catch (error) {
      logger.error("Error in getCurrentSchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving current school year",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Set a school year as active
   */
  public setActiveSchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.setActiveSchoolYear(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School year set as active successfully"
      );
    } catch (error) {
      logger.error("Error in setActiveSchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error setting school year as active",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate school years for a school
   */
  public generateSchoolYears = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        schoolId,
        startYear,
        numberOfYears,
        yearStartMonth,
        yearStartDay,
        yearEndMonth,
        yearEndDay,
      } = req.body;

      const result = await this.service.generateSchoolYears({
        schoolId,
        startYear,
        numberOfYears,
        yearStartMonth,
        yearStartDay,
        yearEndMonth,
        yearEndDay,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "School years generated successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in generateSchoolYears controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating school years",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new SchoolYearController(schoolYearService);
