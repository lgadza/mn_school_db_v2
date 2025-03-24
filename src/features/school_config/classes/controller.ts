import { Request, Response } from "express";
import { IClassService } from "./interfaces/services";
import classService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ClassController {
  private service: IClassService;

  constructor(service: IClassService) {
    this.service = service;
  }

  /**
   * Get class by ID
   */
  public getClassById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getClassById(id);

      ResponseUtil.sendSuccess(res, result, "Class retrieved successfully");
    } catch (error) {
      logger.error("Error in getClassById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving class",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new class
   */
  public createClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const classData = req.body;
      const result = await this.service.createClass(classData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Class created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createClass controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating class",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a class
   */
  public updateClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const classData = req.body;
      const result = await this.service.updateClass(id, classData);

      ResponseUtil.sendSuccess(res, result, "Class updated successfully");
    } catch (error) {
      logger.error("Error in updateClass controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating class",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a class
   */
  public deleteClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteClass(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Class deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteClass controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting class",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get class list
   */
  public getClassList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getClassList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        schoolId: params.schoolId as string,
        teacherId: params.teacherId as string,
        gradeId: params.gradeId as string,
        sectionId: params.sectionId as string,
        departmentId: params.departmentId as string,
        classroomId: params.classroomId as string,
        schoolYearId: params.schoolYearId as string,
        classType: params.classType as string,
        status: params.status as "active" | "archived" | undefined,
        capacityFrom: params.capacityFrom
          ? parseInt(params.capacityFrom as string)
          : undefined,
        capacityTo: params.capacityTo
          ? parseInt(params.capacityTo as string)
          : undefined,
        studentCountFrom: params.studentCountFrom
          ? parseInt(params.studentCountFrom as string)
          : undefined,
        studentCountTo: params.studentCountTo
          ? parseInt(params.studentCountTo as string)
          : undefined,
      });

      ResponseUtil.sendSuccess(res, result, "Classes retrieved successfully");
    } catch (error) {
      logger.error("Error in getClassList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by school
   */
  public getClassesBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const result = await this.service.getClassesBySchool(schoolId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by teacher
   */
  public getClassesByTeacher = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { teacherId } = req.params;
      const result = await this.service.getClassesByTeacher(teacherId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Teacher's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesByTeacher controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by grade
   */
  public getClassesByGrade = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { gradeId } = req.params;
      const result = await this.service.getClassesByGrade(gradeId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Grade's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesByGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by section
   */
  public getClassesBySection = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { sectionId } = req.params;
      const result = await this.service.getClassesBySection(sectionId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Section's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesBySection controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving section's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by department
   */
  public getClassesByDepartment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { departmentId } = req.params;
      const result = await this.service.getClassesByDepartment(departmentId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Department's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesByDepartment controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving department's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by classroom
   */
  public getClassesByClassroom = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classroomId } = req.params;
      const result = await this.service.getClassesByClassroom(classroomId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Classroom's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesByClassroom controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving classroom's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get classes by school year
   */
  public getClassesBySchoolYear = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolYearId } = req.params;
      const result = await this.service.getClassesBySchoolYear(schoolYearId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "School year's classes retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassesBySchoolYear controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school year's classes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get class statistics
   */
  public getClassStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.getClassStatistics();

      ResponseUtil.sendSuccess(
        res,
        result,
        "Class statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getClassStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving class statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create multiple classes at once
   */
  public createClassesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classes } = req.body;
      const result = await this.service.createClassesBulk(classes);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Classes created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createClassesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating classes in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete multiple classes at once
   */
  public deleteClassesBulk = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { ids } = req.body;
      const result = await this.service.deleteClassesBulk(ids);

      ResponseUtil.sendSuccess(res, result, "Classes deleted successfully");
    } catch (error) {
      logger.error("Error in deleteClassesBulk controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting classes in bulk",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ClassController(classService);
