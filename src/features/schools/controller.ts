import { Request, Response } from "express";
import { ISchoolService } from "./interfaces/services";
import schoolService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SchoolController {
  private service: ISchoolService;

  constructor(service: ISchoolService) {
    this.service = service;
  }

  /**
   * Get school by ID
   */
  public getSchoolById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSchoolById(id);

      ResponseUtil.sendSuccess(res, result, "School retrieved successfully");
    } catch (error) {
      logger.error("Error in getSchoolById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school by code
   */
  public getSchoolByCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { code } = req.params;
      const result = await this.service.getSchoolByCode(code);

      ResponseUtil.sendSuccess(res, result, "School retrieved successfully");
    } catch (error) {
      logger.error("Error in getSchoolByCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school by code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new school
   */
  public createSchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const schoolData = req.body;
      const result = await this.service.createSchool(schoolData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating school",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new school with address
   */
  public createSchoolWithAddress = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolData, addressData } = req.body;

      if (!schoolData || !addressData) {
        ResponseUtil.sendBadRequest(
          res,
          "Both school data and address data are required"
        );
        return;
      }

      const result = await this.service.createSchoolWithAddress(
        schoolData,
        addressData
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "School created successfully with address",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createSchoolWithAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating school with address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a school
   */
  public updateSchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const schoolData = req.body;
      const result = await this.service.updateSchool(id, schoolData);

      ResponseUtil.sendSuccess(res, result, "School updated successfully");
    } catch (error) {
      logger.error("Error in updateSchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating school",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a school
   */
  public deleteSchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteSchool(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "School deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteSchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting school",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school list
   */
  public getSchoolList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getSchoolList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        level: params.level as any,
        isPublic:
          params.isPublic === "true"
            ? true
            : params.isPublic === "false"
            ? false
            : undefined,
        schoolType: params.schoolType as any,
        yearOpened: params.yearOpened
          ? parseInt(params.yearOpened as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Schools retrieved successfully");
    } catch (error) {
      logger.error("Error in getSchoolList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving schools",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get schools by principal
   */
  public getSchoolsByPrincipal = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { principalId } = req.params;
      const result = await this.service.getSchoolsByPrincipal(principalId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Principal's schools retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolsByPrincipal controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving principal's schools",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get schools by administrator
   */
  public getSchoolsByAdmin = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { adminId } = req.params;
      const result = await this.service.getSchoolsByAdmin(adminId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Administrator's schools retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolsByAdmin controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving administrator's schools",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate a school code
   */
  public generateSchoolCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { name, level } = req.query;

      if (!name || !level) {
        ResponseUtil.sendBadRequest(res, "School name and level are required");
        return;
      }

      const schoolCode = await this.service.generateSchoolCode(
        name as string,
        level as string
      );

      ResponseUtil.sendSuccess(
        res,
        { schoolCode },
        "School code generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateSchoolCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating school code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new SchoolController(schoolService);
