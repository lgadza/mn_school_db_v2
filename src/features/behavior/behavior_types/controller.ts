import { Request, Response } from "express";
import { IBehaviorTypeService } from "./interfaces/services";
import behaviorTypeService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BehaviorTypeController {
  private service: IBehaviorTypeService;

  constructor(service: IBehaviorTypeService) {
    this.service = service;
  }

  /**
   * Get behavior type by ID
   */
  public getBehaviorTypeById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getBehaviorTypeById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior type retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorTypeById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behavior type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new behavior type
   */
  public createBehaviorType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const behaviorTypeData = req.body;
      const result = await this.service.createBehaviorType(behaviorTypeData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior type created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBehaviorType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating behavior type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a behavior type
   */
  public updateBehaviorType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const behaviorTypeData = req.body;
      const result = await this.service.updateBehaviorType(
        id,
        behaviorTypeData
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior type updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateBehaviorType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating behavior type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a behavior type
   */
  public deleteBehaviorType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteBehaviorType(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Behavior type deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteBehaviorType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting behavior type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behavior type list
   */
  public getBehaviorTypeList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getBehaviorTypeList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        category: params.category as "POSITIVE" | "NEGATIVE" | undefined,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior types retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorTypeList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behavior types",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behavior types by school
   */
  public getBehaviorTypesBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getBehaviorTypesBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's behavior types retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorTypesBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's behavior types",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behavior types by category
   */
  public getBehaviorTypesByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { category } = req.params;
      const result = await this.service.getBehaviorTypesByCategory(
        category as "POSITIVE" | "NEGATIVE"
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        `${category} behavior types retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getBehaviorTypesByCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behavior types by category",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get behavior type statistics
   */
  public getBehaviorTypeStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getBehaviorTypeStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior type statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBehaviorTypeStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving behavior type statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple behavior types at once
   */
  public createBehaviorTypesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { behaviorTypes } = req.body;
      const result = await this.service.createBehaviorTypesBulk(behaviorTypes);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior types created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBehaviorTypesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating behavior types in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple behavior types at once
   */
  public deleteBehaviorTypesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteBehaviorTypesBulk(ids);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Behavior types deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteBehaviorTypesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting behavior types in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new BehaviorTypeController(behaviorTypeService);
