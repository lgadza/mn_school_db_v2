import { Request, Response } from "express";
import { IPeriodService } from "./interfaces/services";
import periodService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class PeriodController {
  private service: IPeriodService;

  constructor(service: IPeriodService) {
    this.service = service;
  }

  /**
   * Get period by ID
   */
  public getPeriodById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getPeriodById(id);

      ResponseUtil.sendSuccess(res, result, "Period retrieved successfully");
    } catch (error) {
      logger.error("Error in getPeriodById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving period",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new period
   */
  public createPeriod = async (req: Request, res: Response): Promise<void> => {
    try {
      const periodData = req.body;
      const result = await this.service.createPeriod(periodData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Period created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createPeriod controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating period",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a period
   */
  public updatePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const periodData = req.body;
      const result = await this.service.updatePeriod(id, periodData);

      ResponseUtil.sendSuccess(res, result, "Period updated successfully");
    } catch (error) {
      logger.error("Error in updatePeriod controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating period",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a period
   */
  public deletePeriod = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deletePeriod(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Period deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deletePeriod controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting period",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get period list
   */
  public getPeriodList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getPeriodList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        section: params.section as
          | "morning"
          | "afternoon"
          | "evening"
          | undefined,
        durationMin: params.durationMin
          ? parseInt(params.durationMin as string)
          : undefined,
        durationMax: params.durationMax
          ? parseInt(params.durationMax as string)
          : undefined,
        startTimeFrom: params.startTimeFrom as string,
        startTimeTo: params.startTimeTo as string,
        endTimeFrom: params.endTimeFrom as string,
        endTimeTo: params.endTimeTo as string,
      });

      ResponseUtil.sendSuccess(res, result, "Periods retrieved successfully");
    } catch (error) {
      logger.error("Error in getPeriodList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving periods",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get periods by school
   */
  public getPeriodsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getPeriodsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's periods retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getPeriodsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's periods",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get period statistics
   */
  public getPeriodStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getPeriodStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Period statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getPeriodStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving period statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple periods at once
   */
  public createPeriodsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { periods } = req.body;
      const result = await this.service.createPeriodsBulk(periods);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Periods created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createPeriodsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating periods in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple periods at once
   */
  public deletePeriodsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deletePeriodsBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Periods deleted successfully");
    } catch (error) {
      logger.error("Error in deletePeriodsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting periods in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new PeriodController(periodService);
