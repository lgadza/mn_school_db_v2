import { Request, Response } from "express";
import { IModuleService } from "./interfaces/services";
import moduleService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ModuleController {
  private service: IModuleService;

  constructor(service: IModuleService) {
    this.service = service;
  }

  /**
   * Get module by ID
   */
  public getModuleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getModuleById(id);

      ResponseUtil.sendSuccess(res, result, "Module retrieved successfully");
    } catch (error) {
      logger.error("Error in getModuleById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving module",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get modules by class ID
   */
  public getModulesByClassId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classId } = req.params;
      const result = await this.service.getModulesByClassId(classId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Class modules retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getModulesByClassId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving class modules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get modules by subject ID
   */
  public getModulesBySubjectId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { subjectId } = req.params;
      const result = await this.service.getModulesBySubjectId(subjectId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Subject modules retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getModulesBySubjectId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving subject modules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get modules by teacher ID
   */
  public getModulesByTeacherId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { teacherId } = req.params;
      const result = await this.service.getModulesByTeacherId(teacherId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Teacher modules retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getModulesByTeacherId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher modules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new module
   */
  public createModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const moduleData = req.body;
      const result = await this.service.createModule(moduleData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Module created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createModule controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating module",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk create modules
   */
  public bulkCreateModules = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const modulesData = req.body;
      const result = await this.service.bulkCreateModules(modulesData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Modules created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in bulkCreateModules controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error bulk creating modules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a module
   */
  public updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const moduleData = req.body;
      const result = await this.service.updateModule(id, moduleData);

      ResponseUtil.sendSuccess(res, result, "Module updated successfully");
    } catch (error) {
      logger.error("Error in updateModule controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating module",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a module
   */
  public deleteModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteModule(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Module deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteModule controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting module",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk delete modules
   */
  public bulkDeleteModules = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const criteria = req.body;
      const result = await this.service.bulkDeleteModules(criteria);

      ResponseUtil.sendSuccess(res, result, "Modules deleted successfully");
    } catch (error) {
      logger.error("Error in bulkDeleteModules controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error bulk deleting modules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get module list
   */
  public getModuleList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getModuleList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        classId: params.classId as string,
        subjectId: params.subjectId as string,
        teacherId: params.teacherId as string,
        assistantTeacherId: params.assistantTeacherId as string,
        schoolId: params.schoolId as string,
        classroomId: params.classroomId as string,
        termId: params.termId as string,
        classType: params.classType as string,
      });

      ResponseUtil.sendSuccess(res, result, "Modules retrieved successfully");
    } catch (error) {
      logger.error("Error in getModuleList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving modules",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ModuleController(moduleService);
