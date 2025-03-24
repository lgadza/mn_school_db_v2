import { Request, Response } from "express";
import { IClassroomService } from "./interfaces/services";
import classroomService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ClassroomController {
  private service: IClassroomService;

  constructor(service: IClassroomService) {
    this.service = service;
  }

  /**
   * Get classroom by ID
   */
  public getClassroomById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getClassroomById(id);

      ResponseUtil.sendSuccess(res, result, "Classroom retrieved successfully");
    } catch (error) {
      logger.error("Error in getClassroomById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving classroom",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new classroom
   */
  public createClassroom = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const classroomData = req.body;
      const result = await this.service.createClassroom(classroomData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Classroom created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createClassroom controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating classroom",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a classroom
   */
  public updateClassroom = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const classroomData = req.body;
      const result = await this.service.updateClassroom(id, classroomData);

      ResponseUtil.sendSuccess(res, result, "Classroom updated successfully");
    } catch (error) {
      logger.error("Error in updateClassroom controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating classroom",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a classroom
   */
  public deleteClassroom = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteClassroom(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Classroom deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteClassroom controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting classroom",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classroom list
   */
  public getClassroomList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getClassroomList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        blockId: params.blockId as string,
        roomType: params.roomType as string,
        status: params.status as string,
        minCapacity: params.minCapacity
          ? parseInt(params.minCapacity as string)
          : undefined,
        maxCapacity: params.maxCapacity
          ? parseInt(params.maxCapacity as string)
          : undefined,
        floor: params.floor ? parseInt(params.floor as string) : undefined,
        feature: params.feature as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Classrooms retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassroomList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving classrooms",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classrooms by school
   */
  public getClassroomsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getClassroomsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's classrooms retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassroomsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's classrooms",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classrooms by block
   */
  public getClassroomsByBlock = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { blockId } = req.params;
      const result = await this.service.getClassroomsByBlock(blockId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Block's classrooms retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassroomsByBlock controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving block's classrooms",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classroom statistics
   */
  public getClassroomStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getClassroomStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Classroom statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassroomStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving classroom statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple classrooms at once
   */
  public createClassroomsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classrooms } = req.body;
      const result = await this.service.createClassroomsBulk(classrooms);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Classrooms created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createClassroomsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating classrooms in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple classrooms at once
   */
  public deleteClassroomsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteClassroomsBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Classrooms deleted successfully");
    } catch (error) {
      logger.error("Error in deleteClassroomsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting classrooms in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ClassroomController(classroomService);
