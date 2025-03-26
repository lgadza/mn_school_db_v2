import { Request, Response } from "express";
import { IProjectGradeService } from "./interfaces/services";
import gradeService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import { GradeDTOMapper } from "./dto";

export class ProjectGradeController {
  private service: IProjectGradeService;

  constructor(service: IProjectGradeService) {
    this.service = service;
  }

  /**
   * Get grade by ID
   */
  public getGradeById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const grade = await this.service.getGradeById(id);
      const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

      ResponseUtil.sendSuccess(
        res,
        gradeDTO,
        "Grade retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradeById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grades by project ID
   */
  public getGradesByProjectId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const grades = await this.service.getGradesByProjectId(projectId);
      const gradeDTOs = grades.map((grade) =>
        GradeDTOMapper.toDetailDTO(grade)
      );

      ResponseUtil.sendSuccess(
        res,
        gradeDTOs,
        "Project grades retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradesByProjectId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving project grades",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grades by student ID
   */
  public getGradesByStudentId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { studentId } = req.params;
      const grades = await this.service.getGradesByStudentId(studentId);
      const gradeDTOs = grades.map((grade) =>
        GradeDTOMapper.toDetailDTO(grade)
      );

      ResponseUtil.sendSuccess(
        res,
        gradeDTOs,
        "Student grades retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradesByStudentId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving student grades",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get grade by project and student
   */
  public getGradeByProjectAndStudent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId, studentId } = req.params;
      const grade = await this.service.getGradeByProjectAndStudent(
        projectId,
        studentId
      );
      
      if (!grade) {
        return ResponseUtil.sendNotFound(
          res,
          "No grade found for this project and student"
        );
      }
      
      const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

      ResponseUtil.sendSuccess(
        res,
        gradeDTO,
        "Grade retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradeByProjectAndStudent controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new grade
   */
  public createGrade = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const gradeData = req.body;
      const newGrade = await this.service.createGrade(gradeData);
      const gradeDTO = GradeDTOMapper.toDetailDTO(newGrade);

      ResponseUtil.sendSuccess(
        res,
        gradeDTO,
        "Grade created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a grade
   */
  public updateGrade = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const gradeData = req.body;
      const updatedGrade = await this.service.updateGrade(id, gradeData);
      const gradeDTO = GradeDTOMapper.toDetailDTO(updatedGrade);

      ResponseUtil.sendSuccess(
        res,
        gradeDTO,
        "Grade updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a grade
   */
  public deleteGrade = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteGrade(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Grade deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteGrade controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting grade",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk delete grades for a project
   */
  public bulkDeleteGrades = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const result = await this.service.bulkDeleteGrades(projectId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Project grades deleted successfully"
      );
    } catch (error) {
      logger.error("Error in bulkDeleteGrades controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting project grades",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get a filtered list of grades
   */
  public getGradeList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = {
        projectId: req.query.projectId as string,
        studentId: req.query.studentId as string,
        graderId: req.query.graderId as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        minScore: req.query.minScore ? parseFloat(req.query.minScore as string) : undefined,
        maxScore: req.query.maxScore ? parseFloat(req.query.maxScore as string) : undefined,
      };

      const { grades, pagination } = await this.service.getGradeList(params);
      const gradeDTOs = grades.map((grade) => 
        GradeDTOMapper.toDetailDTO(grade)
      );

      ResponseUtil.sendSuccess(
        res,
        {
          grades: gradeDTOs,
          meta: pagination,
        },
        "Grade list retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGradeList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving grade list",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ProjectGradeController(gradeService);
