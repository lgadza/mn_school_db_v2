import { Request, Response } from "express";
import { IBehaviorService } from "./interfaces/services";
import behaviorService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BehaviorController {
  private service: IBehaviorService;

  constructor(service: IBehaviorService) {
    this.service = service;
  }

  /**
   * Get behavior by ID
   */
  public getBehaviorById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getBehaviorById(id);

      ResponseUtil.sendSuccess(res, result, "Behavior retrieved successfully");
    } catch (error) {
      logger.error("Error in getBehaviorById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behavior",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new behavior
   */
  public createBehavior = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const behaviorData = req.body;
      const result = await this.service.createBehavior(behaviorData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBehavior controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating behavior",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a behavior
   */
  public updateBehavior = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const behaviorData = req.body;
      const result = await this.service.updateBehavior(id, behaviorData);

      ResponseUtil.sendSuccess(res, result, "Behavior updated successfully");
    } catch (error) {
      logger.error("Error in updateBehavior controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating behavior",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a behavior
   */
  public deleteBehavior = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteBehavior(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Behavior deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteBehavior controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting behavior",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behavior list
   */
  public getBehaviorList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getBehaviorList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        classId: params.classId as string,
        studentId: params.studentId as string,
        behaviorTypeId: params.behaviorTypeId as string,
        staffId: params.staffId as string,
        startDate: params.startDate as string,
        endDate: params.endDate as string,
        resolutionStatus: params.resolutionStatus as
          | "Pending"
          | "Resolved"
          | "Dismissed"
          | "Under Investigation"
          | undefined,
        priority: params.priority as "High" | "Medium" | "Low" | undefined,
        category: params.category as "POSITIVE" | "NEGATIVE" | undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Behaviors retrieved successfully");
    } catch (error) {
      logger.error("Error in getBehaviorList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behaviors",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behaviors by school
   */
  public getBehaviorsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getBehaviorsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's behaviors retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's behaviors",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behaviors by student
   */
  public getBehaviorsByStudent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { studentId } = req.params;
      const result = await this.service.getBehaviorsByStudent(studentId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Student's behaviors retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorsByStudent controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving student's behaviors",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behaviors by class
   */
  public getBehaviorsByClass = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classId } = req.params;
      const result = await this.service.getBehaviorsByClass(classId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Class's behaviors retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorsByClass controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving class's behaviors",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behaviors by behavior type
   */
  public getBehaviorsByBehaviorType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { behaviorTypeId } = req.params;
      const result = await this.service.getBehaviorsByBehaviorType(
        behaviorTypeId
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behaviors by type retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorsByBehaviorType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behaviors by type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behavior statistics
   */
  public getBehaviorStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getBehaviorStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behavior statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple behaviors at once
   */
  public createBehaviorsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { behaviors } = req.body;
      const result = await this.service.createBehaviorsBulk(behaviors);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behaviors created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBehaviorsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating behaviors in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple behaviors at once
   */
  public deleteBehaviorsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteBehaviorsBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Behaviors deleted successfully");
    } catch (error) {
      logger.error("Error in deleteBehaviorsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting behaviors in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new BehaviorController(behaviorService);
