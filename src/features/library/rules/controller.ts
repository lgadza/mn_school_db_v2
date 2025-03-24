import { Request, Response } from "express";
import rentalRuleService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class RentalRuleController {
  /**
   * Get rule by ID
   */
  public getRuleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await rentalRuleService.getRuleById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Rental rule retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getRuleById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving rental rule",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new rental rule
   */
  public createRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const ruleData = req.body;
      const result = await rentalRuleService.createRule(ruleData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Rental rule created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createRule controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating rental rule",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a rental rule
   */
  public updateRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ruleData = req.body;
      const result = await rentalRuleService.updateRule(id, ruleData);

      ResponseUtil.sendSuccess(res, result, "Rental rule updated successfully");
    } catch (error) {
      logger.error("Error in updateRule controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating rental rule",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a rental rule
   */
  public deleteRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await rentalRuleService.deleteRule(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Rental rule deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteRule controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting rental rule",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get rental rule list
   */
  public getRuleList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await rentalRuleService.getRuleList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Rental rules retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getRuleList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving rental rules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get rules by school
   */
  public getRulesBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const params = req.query;

      const result = await rentalRuleService.getRulesBySchool(schoolId, {
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "School rental rules retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getRulesBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school rental rules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new RentalRuleController();
