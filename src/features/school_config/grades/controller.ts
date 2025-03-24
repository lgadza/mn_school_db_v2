import { Request, Response } from "express";
import { IGradeService } from "./interfaces/services";
import gradeService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class GradeController {
  private service: IGradeService;

  constructor(service: IGradeService) {
    this.service = service;
  }

  /**
   * Get grade by ID
   */
  public getGradeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getGradeById(id);

      ResponseUtil.sendSuccess(res, result, "Grade retrieved successfully");
    } catch (error) {
      logger.error("Error in getGradeById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new grade
   */
  public createGrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const gradeData = req.body;
      const result = await this.service.createGrade(gradeData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Grade created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a grade
   */
  public updateGrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const gradeData = req.body;
      const result = await this.service.updateGrade(id, gradeData);

      ResponseUtil.sendSuccess(res, result, "Grade updated successfully");
    } catch (error) {
      logger.error("Error in updateGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a grade
   */
  public deleteGrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteGrade(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Grade deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grade list
   */
  public getGradeList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getGradeList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        teacherId: params.teacherId as string,
        applicationOpen:
          params.applicationOpen === "true"
            ? true
            : params.applicationOpen === "false"
            ? false
            : undefined,
        minAgeFrom: params.minAgeFrom
          ? parseInt(params.minAgeFrom as string)
          : undefined,
        minAgeTo: params.minAgeTo
          ? parseInt(params.minAgeTo as string)
          : undefined,
        maxAgeFrom: params.maxAgeFrom
          ? parseInt(params.maxAgeFrom as string)
          : undefined,
        maxAgeTo: params.maxAgeTo
          ? parseInt(params.maxAgeTo as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Grades retrieved successfully");
    } catch (error) {
      logger.error("Error in getGradeList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grades",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grades by school
   */
  public getGradesBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getGradesBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's grades retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradesBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's grades",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grades by teacher
   */
  public getGradesByTeacher = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { teacherId } = req.params;
      const result = await this.service.getGradesByTeacher(teacherId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Teacher's grades retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradesByTeacher controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher's grades",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grade statistics
   */
  public getGradeStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getGradeStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Grade statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradeStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple grades at once
   */
  public createGradesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { grades } = req.body;
      const result = await this.service.createGradesBulk(grades);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Grades created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createGradesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating grades in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple grades at once
   */
  public deleteGradesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteGradesBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Grades deleted successfully");
    } catch (error) {
      logger.error("Error in deleteGradesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting grades in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new GradeController(gradeService);
