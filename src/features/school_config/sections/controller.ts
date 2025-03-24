import { Request, Response } from "express";
import { ISectionService } from "./interfaces/services";
import sectionService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SectionController {
  private service: ISectionService;

  constructor(service: ISectionService) {
    this.service = service;
  }

  /**
   * Get section by ID
   */
  public getSectionById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSectionById(id);

      ResponseUtil.sendSuccess(res, result, "Section retrieved successfully");
    } catch (error) {
      logger.error("Error in getSectionById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving section",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new section
   */
  public createSection = async (req: Request, res: Response): Promise<void> => {
    try {
      const sectionData = req.body;
      const result = await this.service.createSection(sectionData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Section created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSection controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating section",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a section
   */
  public updateSection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const sectionData = req.body;
      const result = await this.service.updateSection(id, sectionData);

      ResponseUtil.sendSuccess(res, result, "Section updated successfully");
    } catch (error) {
      logger.error("Error in updateSection controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating section",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a section
   */
  public deleteSection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteSection(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Section deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteSection controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting section",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get section list
   */
  public getSectionList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getSectionList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        color: params.color as string,
        capacityMin: params.capacityMin
          ? parseInt(params.capacityMin as string)
          : undefined,
        capacityMax: params.capacityMax
          ? parseInt(params.capacityMax as string)
          : undefined,
        active:
          params.active === "true"
            ? true
            : params.active === "false"
            ? false
            : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Sections retrieved successfully");
    } catch (error) {
      logger.error("Error in getSectionList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving sections",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get sections by school
   */
  public getSectionsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getSectionsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's sections retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSectionsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's sections",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get section statistics
   */
  public getSectionStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getSectionStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Section statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSectionStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving section statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple sections at once
   */
  public createSectionsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { sections } = req.body;
      const result = await this.service.createSectionsBulk(sections);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Sections created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSectionsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating sections in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple sections at once
   */
  public deleteSectionsBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteSectionsBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Sections deleted successfully");
    } catch (error) {
      logger.error("Error in deleteSectionsBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting sections in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new SectionController(sectionService);
