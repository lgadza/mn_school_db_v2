import { Request, Response } from "express";
import { IProjectService } from "./interfaces/services";
import projectService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ProjectController {
  private service: IProjectService;

  constructor(service: IProjectService) {
    this.service = service;
  }

  /**
   * Get project by ID
   */
  public getProjectById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getProjectById(id);

      ResponseUtil.sendSuccess(res, result, "Project retrieved successfully");
    } catch (error) {
      logger.error("Error in getProjectById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving project",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get projects by class ID
   */
  public getProjectsByClassId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { classId } = req.params;
      const result = await this.service.getProjectsByClassId(classId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Class projects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectsByClassId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving class projects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get projects by subject ID
   */
  public getProjectsBySubjectId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { subjectId } = req.params;
      const result = await this.service.getProjectsBySubjectId(subjectId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Subject projects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectsBySubjectId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving subject projects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get projects by teacher ID
   */
  public getProjectsByTeacherId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { teacherId } = req.params;
      const result = await this.service.getProjectsByTeacherId(teacherId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Teacher projects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectsByTeacherId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving teacher projects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new project
   */
  public createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectData = req.body;
      const result = await this.service.createProject(projectData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Project created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createProject controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating project",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk create projects
   */
  public bulkCreateProjects = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const projectsData = req.body;
      const result = await this.service.bulkCreateProjects(projectsData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Projects created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in bulkCreateProjects controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error bulk creating projects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a project
   */
  public updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const projectData = req.body;
      const result = await this.service.updateProject(id, projectData);

      ResponseUtil.sendSuccess(res, result, "Project updated successfully");
    } catch (error) {
      logger.error("Error in updateProject controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating project",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a project
   */
  public deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteProject(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Project deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteProject controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting project",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk delete projects
   */
  public bulkDeleteProjects = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const criteria = req.body;
      const result = await this.service.bulkDeleteProjects(criteria);

      ResponseUtil.sendSuccess(res, result, "Projects deleted successfully");
    } catch (error) {
      logger.error("Error in bulkDeleteProjects controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error bulk deleting projects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get project list
   */
  public getProjectList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getProjectList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        classId: params.classId as string,
        subjectId: params.subjectId as string,
        teacherId: params.teacherId as string,
        schoolId: params.schoolId as string,
        status: params.status as any,
        difficulty: params.difficulty as any,
        isGroupProject:
          params.isGroupProject === "true"
            ? true
            : params.isGroupProject === "false"
            ? false
            : undefined,
        fromDueDate: params.fromDueDate as string,
        toDueDate: params.toDueDate as string,
      });

      ResponseUtil.sendSuccess(res, result, "Projects retrieved successfully");
    } catch (error) {
      logger.error("Error in getProjectList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving projects",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ProjectController(projectService);
