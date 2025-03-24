import { Request, Response } from "express";
import { IBlockService } from "./interfaces/services";
import blockService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BlockController {
  private service: IBlockService;

  constructor(service: IBlockService) {
    this.service = service;
  }

  /**
   * Get block by ID
   */
  public getBlockById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getBlockById(id);

      ResponseUtil.sendSuccess(res, result, "Block retrieved successfully");
    } catch (error) {
      logger.error("Error in getBlockById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving block",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new block
   */
  public createBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const blockData = req.body;
      const result = await this.service.createBlock(blockData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Block created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBlock controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating block",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a block
   */
  public updateBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const blockData = req.body;
      const result = await this.service.updateBlock(id, blockData);

      ResponseUtil.sendSuccess(res, result, "Block updated successfully");
    } catch (error) {
      logger.error("Error in updateBlock controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating block",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a block
   */
  public deleteBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteBlock(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Block deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteBlock controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting block",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get block list
   */
  public getBlockList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getBlockList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        status: params.status as string,
        yearBuiltMin: params.yearBuiltMin
          ? parseInt(params.yearBuiltMin as string)
          : undefined,
        yearBuiltMax: params.yearBuiltMax
          ? parseInt(params.yearBuiltMax as string)
          : undefined,
        minClassrooms: params.minClassrooms
          ? parseInt(params.minClassrooms as string)
          : undefined,
        maxClassrooms: params.maxClassrooms
          ? parseInt(params.maxClassrooms as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Blocks retrieved successfully");
    } catch (error) {
      logger.error("Error in getBlockList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving blocks",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get blocks by school
   */
  public getBlocksBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getBlocksBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's blocks retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBlocksBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's blocks",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get block statistics
   */
  public getBlockStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getBlockStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Block statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBlockStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving block statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple blocks at once
   */
  public createBlocksBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { blocks } = req.body;
      const result = await this.service.createBlocksBulk(blocks);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Blocks created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBlocksBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating blocks in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple blocks at once
   */
  public deleteBlocksBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteBlocksBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Blocks deleted successfully");
    } catch (error) {
      logger.error("Error in deleteBlocksBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting blocks in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new BlockController(blockService);
