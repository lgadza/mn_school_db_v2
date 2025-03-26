import { Request, Response } from "express";
import { IProjectFeedbackService } from "./interfaces/services";
import feedbackService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import { FeedbackDTOMapper } from "./dto";

export class ProjectFeedbackController {
  private service: IProjectFeedbackService;

  constructor(service: IProjectFeedbackService) {
    this.service = service;
  }

  /**
   * Get feedback by ID
   */
  public getFeedbackById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const feedback = await this.service.getFeedbackById(id);
      const feedbackDTO = FeedbackDTOMapper.toDetailDTO(feedback);

      ResponseUtil.sendSuccess(
        res,
        feedbackDTO,
        "Feedback retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getFeedbackById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving feedback",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get feedback by project ID
   */
  public getFeedbackByProjectId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const feedback = await this.service.getFeedbackByProjectId(projectId);
      const feedbackDTOs = feedback.map((item) =>
        FeedbackDTOMapper.toDetailDTO(item)
      );

      ResponseUtil.sendSuccess(
        res,
        feedbackDTOs,
        "Project feedback retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getFeedbackByProjectId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving project feedback",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get replies to a feedback
   */
  public getRepliesByParentId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { parentId } = req.params;
      const replies = await this.service.getRepliesByParentId(parentId);
      const repliesDTOs = replies.map((reply) =>
        FeedbackDTOMapper.toDetailDTO(reply)
      );

      ResponseUtil.sendSuccess(
        res,
        repliesDTOs,
        "Feedback replies retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getRepliesByParentId controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving feedback replies",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new feedback
   */
  public createFeedback = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const feedbackData = req.body;
      const newFeedback = await this.service.createFeedback(feedbackData);
      const feedbackDTO = FeedbackDTOMapper.toDetailDTO(newFeedback);

      ResponseUtil.sendSuccess(
        res,
        feedbackDTO,
        "Feedback created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createFeedback controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating feedback",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a feedback
   */
  public updateFeedback = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const feedbackData = req.body;
      const updatedFeedback = await this.service.updateFeedback(
        id,
        feedbackData
      );
      const feedbackDTO = FeedbackDTOMapper.toDetailDTO(updatedFeedback);

      ResponseUtil.sendSuccess(
        res,
        feedbackDTO,
        "Feedback updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateFeedback controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating feedback",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a feedback
   */
  public deleteFeedback = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteFeedback(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Feedback deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteFeedback controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting feedback",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk delete feedback for a project
   */
  public bulkDeleteFeedback = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const result = await this.service.bulkDeleteFeedback(projectId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Project feedback deleted successfully"
      );
    } catch (error) {
      logger.error("Error in bulkDeleteFeedback controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting project feedback",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get a filtered list of feedback
   */
  public getFeedbackList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = {
        projectId: req.query.projectId as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        authorId: req.query.authorId as string,
        parentId: req.query.parentId as string,
        type: req.query.type as any,
        status: req.query.status as
          | "active"
          | "archived"
          | "deleted"
          | undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
      };

      const { feedback, pagination } = await this.service.getFeedbackList(
        params
      );
      const feedbackDTOs = feedback.map((item) =>
        FeedbackDTOMapper.toDetailDTO(item)
      );

      ResponseUtil.sendSuccess(
        res,
        {
          feedback: feedbackDTOs,
          meta: pagination,
        },
        "Feedback list retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getFeedbackList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving feedback list",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ProjectFeedbackController(feedbackService);
