import { Request, Response } from "express";
import { IProspectService } from "./interfaces/services";
import prospectService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ProspectController {
  private service: IProspectService;

  constructor(service: IProspectService) {
    this.service = service;
  }

  /**
   * Get prospect by ID
   */
  public getProspectById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getProspectById(id);

      ResponseUtil.sendSuccess(res, result, "Prospect retrieved successfully");
    } catch (error) {
      logger.error("Error in getProspectById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving prospect",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get prospect by user ID
   */
  public getProspectByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.service.getProspectByUserId(userId);

      ResponseUtil.sendSuccess(res, result, "Prospect retrieved successfully");
    } catch (error) {
      logger.error("Error in getProspectByUserId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving prospect by user ID",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new prospect
   */
  public createProspect = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const prospectData = req.body;
      const result = await this.service.createProspect(prospectData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Prospect created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createProspect controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating prospect",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a prospect
   */
  public updateProspect = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const prospectData = req.body;
      const result = await this.service.updateProspect(id, prospectData);

      ResponseUtil.sendSuccess(res, result, "Prospect updated successfully");
    } catch (error) {
      logger.error("Error in updateProspect controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating prospect",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a prospect
   */
  public deleteProspect = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteProspect(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Prospect deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteProspect controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting prospect",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get prospect list
   */
  public getProspectList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getProspectList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        roleId: params.roleId as string,
        interestLevel: params.interestLevel as string,
        activeStatus:
          params.activeStatus === "true"
            ? true
            : params.activeStatus === "false"
            ? false
            : undefined,
        contactDateFrom: params.contactDateFrom as string,
        contactDateTo: params.contactDateTo as string,
      });

      ResponseUtil.sendSuccess(res, result, "Prospects retrieved successfully");
    } catch (error) {
      logger.error("Error in getProspectList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving prospects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get prospects by school
   */
  public getProspectsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getProspectsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's prospects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProspectsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's prospects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get prospects by role
   */
  public getProspectsByRole = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { roleId } = req.params;
      const result = await this.service.getProspectsByRole(roleId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Role's prospects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProspectsByRole controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving role's prospects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get prospects by interest level
   */
  public getProspectsByInterestLevel = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { interestLevel } = req.params;
      const result = await this.service.getProspectsByInterestLevel(
        interestLevel
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        `Prospects with interest level '${interestLevel}' retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getProspectsByInterestLevel controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving prospects by interest level",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get prospect statistics
   */
  public getProspectStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getProspectStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Prospect statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProspectStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving prospect statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ProspectController(prospectService);
