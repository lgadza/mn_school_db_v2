import { Request, Response } from "express";
import { ITeacherService } from "./interfaces/services";
import teacherService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class TeacherController {
  private service: ITeacherService;

  constructor(service: ITeacherService) {
    this.service = service;
  }

  /**
   * Get teacher by ID
   */
  public getTeacherById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getTeacherById(id);

      ResponseUtil.sendSuccess(res, result, "Teacher retrieved successfully");
    } catch (error) {
      logger.error("Error in getTeacherById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get teacher by user ID
   */
  public getTeacherByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.service.getTeacherByUserId(userId);

      ResponseUtil.sendSuccess(res, result, "Teacher retrieved successfully");
    } catch (error) {
      logger.error("Error in getTeacherByUserId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher by user ID",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get teacher by employee ID
   */
  public getTeacherByEmployeeId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const result = await this.service.getTeacherByEmployeeId(employeeId);

      ResponseUtil.sendSuccess(res, result, "Teacher retrieved successfully");
    } catch (error) {
      logger.error("Error in getTeacherByEmployeeId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher by employee ID",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new teacher
   */
  public createTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
      const teacherData = req.body;
      const result = await this.service.createTeacher(teacherData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Teacher created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createTeacher controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating teacher",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a teacher
   */
  public updateTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const teacherData = req.body;
      const result = await this.service.updateTeacher(id, teacherData);

      ResponseUtil.sendSuccess(res, result, "Teacher updated successfully");
    } catch (error) {
      logger.error("Error in updateTeacher controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating teacher",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a teacher
   */
  public deleteTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteTeacher(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Teacher deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteTeacher controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting teacher",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get teacher list
   */
  public getTeacherList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getTeacherList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        departmentId: params.departmentId as string,
        activeStatus:
          params.activeStatus === "true"
            ? true
            : params.activeStatus === "false"
            ? false
            : undefined,
        currentStatus: params.currentStatus as string,
        contractType: params.contractType as string,
        minYearsOfExperience: params.minYearsOfExperience
          ? parseInt(params.minYearsOfExperience as string)
          : undefined,
        maxYearsOfExperience: params.maxYearsOfExperience
          ? parseInt(params.maxYearsOfExperience as string)
          : undefined,
        minTeachingLoad: params.minTeachingLoad
          ? parseFloat(params.minTeachingLoad as string)
          : undefined,
        maxTeachingLoad: params.maxTeachingLoad
          ? parseFloat(params.maxTeachingLoad as string)
          : undefined,
        hireDateFrom: params.hireDateFrom as string,
        hireDateTo: params.hireDateTo as string,
        title: params.title as string,
        specialization: params.specialization as string,
      });

      ResponseUtil.sendSuccess(res, result, "Teachers retrieved successfully");
    } catch (error) {
      logger.error("Error in getTeacherList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teachers",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get teachers by school
   */
  public getTeachersBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getTeachersBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's teachers retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTeachersBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's teachers",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get teachers by department
   */
  public getTeachersByDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { departmentId } = req.params;
      const result = await this.service.getTeachersByDepartment(departmentId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department's teachers retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTeachersByDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving department's teachers",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate an employee ID
   */
  public generateEmployeeId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.query;

      if (!schoolId) {
        ResponseUtil.sendBadRequest(res, "School ID is required");
        return;
      }

      const employeeId = await this.service.generateEmployeeId(
        schoolId as string
      );

      ResponseUtil.sendSuccess(
        res,
        { employeeId },
        "Employee ID generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateEmployeeId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating employee ID",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get teacher statistics
   */
  public getTeacherStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getTeacherStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Teacher statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTeacherStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new TeacherController(teacherService);
