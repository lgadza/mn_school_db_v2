import { Request, Response } from "express";
import { ISubjectService } from "./interfaces/services";
import subjectService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SubjectController {
  private service: ISubjectService;

  constructor(service: ISubjectService) {
    this.service = service;
  }

  /**
   * Get subject by ID
   */
  public getSubjectById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSubjectById(id);

      ResponseUtil.sendSuccess(res, result, "Subject retrieved successfully");
    } catch (error) {
      logger.error("Error in getSubjectById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving subject",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new subject
   */
  public createSubject = async (req: Request, res: Response): Promise<void> => {
    try {
      const subjectData = req.body;
      const result = await this.service.createSubject(subjectData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Subject created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSubject controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating subject",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a subject
   */
  public updateSubject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const subjectData = req.body;
      const result = await this.service.updateSubject(id, subjectData);

      ResponseUtil.sendSuccess(res, result, "Subject updated successfully");
    } catch (error) {
      logger.error("Error in updateSubject controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating subject",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a subject
   */
  public deleteSubject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteSubject(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Subject deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteSubject controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting subject",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get subject list
   */
  public getSubjectList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getSubjectList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        categoryId: params.categoryId as string,
        departmentId: params.departmentId as string,
        level: params.level as string,
        compulsory:
          params.compulsory === "true"
            ? true
            : params.compulsory === "false"
            ? false
            : undefined,
        hasPrerequisite:
          params.hasPrerequisite === "true"
            ? true
            : params.hasPrerequisite === "false"
            ? false
            : undefined,
        isDefault:
          params.isDefault === "true"
            ? true
            : params.isDefault === "false"
            ? false
            : undefined,
        minCredits: params.minCredits
          ? parseFloat(params.minCredits as string)
          : undefined,
        maxCredits: params.maxCredits
          ? parseFloat(params.maxCredits as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Subjects retrieved successfully");
    } catch (error) {
      logger.error("Error in getSubjectList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving subjects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get subjects by school
   */
  public getSubjectsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getSubjectsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's subjects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSubjectsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's subjects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get subjects by category
   */
  public getSubjectsByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const result = await this.service.getSubjectsByCategory(categoryId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Category's subjects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSubjectsByCategory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving category's subjects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get subjects by department
   */
  public getSubjectsByDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { departmentId } = req.params;
      const result = await this.service.getSubjectsByDepartment(departmentId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department's subjects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSubjectsByDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving department's subjects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get subject by code
   */
  public getSubjectByCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { code } = req.params;
      const { schoolId } = req.query;
      const result = await this.service.getSubjectByCode(
        code,
        schoolId as string | undefined
      );

      ResponseUtil.sendSuccess(res, result, "Subject retrieved successfully");
    } catch (error) {
      logger.error("Error in getSubjectByCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving subject by code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get subject statistics
   */
  public getSubjectStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getSubjectStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Subject statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSubjectStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving subject statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple subjects at once
   */
  public createSubjectsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { subjects } = req.body;
      const result = await this.service.createSubjectsBulk(subjects);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Subjects created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSubjectsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating subjects in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple subjects at once
   */
  public deleteSubjectsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteSubjectsBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Subjects deleted successfully");
    } catch (error) {
      logger.error("Error in deleteSubjectsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting subjects in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new SubjectController(subjectService);
