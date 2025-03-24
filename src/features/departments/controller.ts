import { Request, Response } from "express";
import { IDepartmentService } from "./interfaces/services";
import departmentService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class DepartmentController {
  private service: IDepartmentService;

  constructor(service: IDepartmentService) {
    this.service = service;
  }

  /**
   * Get department by ID
   */
  public getDepartmentById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getDepartmentById(id);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDepartmentById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving department",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get department by code
   */
  public getDepartmentByCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { code } = req.params;
      const result = await this.service.getDepartmentByCode(code);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDepartmentByCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving department by code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new department
   */
  public createDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const departmentData = req.body;
      const result = await this.service.createDepartment(departmentData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating department",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a department
   */
  public updateDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const departmentData = req.body;
      const result = await this.service.updateDepartment(id, departmentData);

      ResponseUtil.sendSuccess(res, result, "Department updated successfully");
    } catch (error) {
      logger.error("Error in updateDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating department",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a department
   */
  public deleteDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteDepartment(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Department deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting department",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get department list
   */
  public getDepartmentList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getDepartmentList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        headOfDepartmentId: params.headOfDepartmentId as string,
        isDefault:
          params.isDefault === "true"
            ? true
            : params.isDefault === "false"
            ? false
            : undefined,
        minFacultyCount: params.minFacultyCount
          ? parseInt(params.minFacultyCount as string)
          : undefined,
        maxFacultyCount: params.maxFacultyCount
          ? parseInt(params.maxFacultyCount as string)
          : undefined,
        minStudentCount: params.minStudentCount
          ? parseInt(params.minStudentCount as string)
          : undefined,
        maxStudentCount: params.maxStudentCount
          ? parseInt(params.maxStudentCount as string)
          : undefined,
        minBudget: params.minBudget
          ? parseFloat(params.minBudget as string)
          : undefined,
        maxBudget: params.maxBudget
          ? parseFloat(params.maxBudget as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Departments retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDepartmentList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving departments",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get departments by school
   */
  public getDepartmentsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getDepartmentsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's departments retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDepartmentsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's departments",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get departments by head
   */
  public getDepartmentsByHead = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { headId } = req.params;
      const result = await this.service.getDepartmentsByHead(headId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Head's departments retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDepartmentsByHead controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving head's departments",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate a department code
   */
  public generateDepartmentCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { name, schoolId } = req.query;

      if (!name || !schoolId) {
        ResponseUtil.sendBadRequest(
          res,
          "Department name and school ID are required"
        );
        return;
      }

      const departmentCode = await this.service.generateDepartmentCode(
        name as string,
        schoolId as string
      );

      ResponseUtil.sendSuccess(
        res,
        { departmentCode },
        "Department code generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateDepartmentCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating department code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get department statistics
   */
  public getDepartmentStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getDepartmentStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDepartmentStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving department statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get default department for a school
   */
  public getDefaultDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getDefaultDepartment(schoolId);

      if (!result) {
        ResponseUtil.sendSuccess(
          res,
          null,
          "No default department found for this school"
        );
        return;
      }

      ResponseUtil.sendSuccess(
        res,
        result,
        "Default department retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDefaultDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving default department",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Set a department as default for a school
   */
  public setDefaultDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { schoolId } = req.body;

      const result = await this.service.setDefaultDepartment(id, schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department set as default successfully"
      );
    } catch (error) {
      logger.error("Error in setDefaultDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error setting department as default",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new DepartmentController(departmentService);
