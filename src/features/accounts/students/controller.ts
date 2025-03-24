import { Request, Response } from "express";
import { IStudentService } from "./interfaces/services";
import studentService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class StudentController {
  private service: IStudentService;

  constructor(service: IStudentService) {
    this.service = service;
  }

  /**
   * Get student by ID
   */
  public getStudentById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getStudentById(id);

      ResponseUtil.sendSuccess(res, result, "Student retrieved successfully");
    } catch (error) {
      logger.error("Error in getStudentById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving student",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get student by user ID
   */
  public getStudentByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.service.getStudentByUserId(userId);

      ResponseUtil.sendSuccess(res, result, "Student retrieved successfully");
    } catch (error) {
      logger.error("Error in getStudentByUserId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving student by user ID",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get student by student number
   */
  public getStudentByStudentNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { studentNumber } = req.params;
      const result = await this.service.getStudentByStudentNumber(
        studentNumber
      );

      ResponseUtil.sendSuccess(res, result, "Student retrieved successfully");
    } catch (error) {
      logger.error("Error in getStudentByStudentNumber controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving student by student number",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new student
   */
  public createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const studentData = req.body;
      const result = await this.service.createStudent(studentData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Student created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createStudent controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating student",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a student
   */
  public updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const studentData = req.body;
      const result = await this.service.updateStudent(id, studentData);

      ResponseUtil.sendSuccess(res, result, "Student updated successfully");
    } catch (error) {
      logger.error("Error in updateStudent controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating student",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a student
   */
  public deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteStudent(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Student deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteStudent controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting student",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get student list
   */
  public getStudentList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getStudentList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        gradeId: params.gradeId as string,
        classId: params.classId as string,
        activeStatus:
          params.activeStatus === "true"
            ? true
            : params.activeStatus === "false"
            ? false
            : undefined,
        enrollmentDateFrom: params.enrollmentDateFrom as string,
        enrollmentDateTo: params.enrollmentDateTo as string,
      });

      ResponseUtil.sendSuccess(res, result, "Students retrieved successfully");
    } catch (error) {
      logger.error("Error in getStudentList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving students",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get students by school
   */
  public getStudentsBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getStudentsBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's students retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getStudentsBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's students",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get students by grade
   */
  public getStudentsByGrade = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { gradeId } = req.params;
      const result = await this.service.getStudentsByGrade(gradeId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Grade's students retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getStudentsByGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade's students",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get students by class
   */
  public getStudentsByClass = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classId } = req.params;
      const result = await this.service.getStudentsByClass(classId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Class's students retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getStudentsByClass controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving class's students",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Generate a student number
   */
  public generateStudentNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId, gradeId } = req.query;

      if (!schoolId || !gradeId) {
        ResponseUtil.sendBadRequest(res, "School ID and Grade ID are required");
        return;
      }

      const studentNumber = await this.service.generateStudentNumber(
        schoolId as string,
        gradeId as string
      );

      ResponseUtil.sendSuccess(
        res,
        { studentNumber },
        "Student number generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateStudentNumber controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error generating student number",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get student statistics
   */
  public getStudentStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getStudentStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Student statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getStudentStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving student statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new StudentController(studentService);
