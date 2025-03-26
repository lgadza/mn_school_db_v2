import {
  IProjectFeedbackService,
  IProjectFeedbackRepository,
} from "./interfaces/services";
import {
  ProjectFeedbackInterface,
  ProjectFeedbackDeletionResult,
} from "./interfaces/interfaces";
import {
  CreateFeedbackDTO,
  UpdateFeedbackDTO,
  FeedbackListQueryParams,
  FeedbackDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  NotFoundError,
  BadRequestError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import projectService from "../project/service";
import userService from "../../users/service";
import db from "@/config/database";

export class ProjectFeedbackService implements IProjectFeedbackService {
  private repository: IProjectFeedbackRepository;
  private readonly CACHE_PREFIX = "project-feedback:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IProjectFeedbackRepository) {
    this.repository = repository;
  }

  /**
   * Get feedback by ID
   */
  public async getFeedbackById(id: string): Promise<ProjectFeedbackInterface> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedFeedback = await cache.get(cacheKey);

      if (cachedFeedback) {
        return JSON.parse(cachedFeedback);
      }

      // Get from database if not in cache
      const feedback = await this.repository.findFeedbackById(id);
      if (!feedback) {
        throw new NotFoundError(`Feedback with ID ${id} not found`);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(feedback), this.CACHE_TTL);

      return feedback;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getFeedbackById service:", error);
      throw new AppError("Failed to get feedback");
    }
  }

  /**
   * Get all feedback for a project
   */
  public async getFeedbackByProjectId(
    projectId: string
  ): Promise<ProjectFeedbackInterface[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}project:${projectId}`;
      const cachedFeedback = await cache.get(cacheKey);

      if (cachedFeedback) {
        return JSON.parse(cachedFeedback);
      }

      // Verify project exists
      try {
        await projectService.getProjectById(projectId);
      } catch (error) {
        throw new NotFoundError(`Project with ID ${projectId} not found`);
      }

      // Get from database
      const feedback = await this.repository.findFeedbackByProjectId(projectId);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(feedback), this.CACHE_TTL);

      return feedback;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getFeedbackByProjectId service:", error);
      throw new AppError("Failed to get project feedback");
    }
  }

  /**
   * Get feedback by author
   */
  public async getFeedbackByAuthorId(
    authorId: string
  ): Promise<ProjectFeedbackInterface[]> {
    try {
      // Verify user exists
      try {
        await userService.getUserById(authorId);
      } catch (error) {
        throw new NotFoundError(`User with ID ${authorId} not found`);
      }

      return await this.repository.findFeedbackByAuthorId(authorId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getFeedbackByAuthorId service:", error);
      throw new AppError("Failed to get author feedback");
    }
  }

  /**
   * Get replies to a feedback
   */
  public async getRepliesByParentId(
    parentId: string
  ): Promise<ProjectFeedbackInterface[]> {
    try {
      // Check if parent feedback exists
      const parentFeedback = await this.repository.findFeedbackById(parentId);
      if (!parentFeedback) {
        throw new NotFoundError(
          `Parent feedback with ID ${parentId} not found`
        );
      }

      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}replies:${parentId}`;
      const cachedReplies = await cache.get(cacheKey);

      if (cachedReplies) {
        return JSON.parse(cachedReplies);
      }

      // Get from database
      const replies = await this.repository.findRepliesByParentId(parentId);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(replies), this.CACHE_TTL);

      return replies;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getRepliesByParentId service:", error);
      throw new AppError("Failed to get feedback replies");
    }
  }

  /**
   * Create new feedback
   */
  public async createFeedback(
    feedbackData: CreateFeedbackDTO
  ): Promise<ProjectFeedbackInterface> {
    try {
      // Verify project exists
      try {
        await projectService.getProjectById(feedbackData.projectId);
      } catch (error) {
        throw new NotFoundError(
          `Project with ID ${feedbackData.projectId} not found`
        );
      }

      // Verify author exists
      try {
        await userService.getUserById(feedbackData.authorId);
      } catch (error) {
        throw new NotFoundError(
          `User with ID ${feedbackData.authorId} not found`
        );
      }

      // If a parent ID is provided, check if it exists
      if (feedbackData.parentId) {
        const parentFeedback = await this.repository.findFeedbackById(
          feedbackData.parentId
        );
        if (!parentFeedback) {
          throw new NotFoundError(
            `Parent feedback with ID ${feedbackData.parentId} not found`
          );
        }
      }

      // Create the feedback
      const newFeedback = await this.repository.createFeedback(feedbackData);

      // Clear project feedback cache
      await this.clearProjectFeedbackCache(feedbackData.projectId);

      // If this is a reply, clear the parent's replies cache
      if (feedbackData.parentId) {
        await this.clearRepliesCache(feedbackData.parentId);
      }

      return newFeedback;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createFeedback service:", error);
      throw new AppError("Failed to create feedback");
    }
  }

  /**
   * Update feedback
   */
  public async updateFeedback(
    id: string,
    feedbackData: UpdateFeedbackDTO
  ): Promise<ProjectFeedbackInterface> {
    try {
      // Check if feedback exists
      const existingFeedback = await this.repository.findFeedbackById(id);
      if (!existingFeedback) {
        throw new NotFoundError(`Feedback with ID ${id} not found`);
      }

      // Update the feedback
      await this.repository.updateFeedback(id, feedbackData);

      // Clear caches
      await this.clearFeedbackCache(id);
      await this.clearProjectFeedbackCache(existingFeedback.projectId);

      // If this is a reply, clear the parent's replies cache
      if (existingFeedback.parentId) {
        await this.clearRepliesCache(existingFeedback.parentId);
      }

      // Get the updated feedback
      return this.getFeedbackById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateFeedback service:", error);
      throw new AppError("Failed to update feedback");
    }
  }

  /**
   * Delete feedback
   */
  public async deleteFeedback(id: string): Promise<boolean> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if feedback exists
      const existingFeedback = await this.repository.findFeedbackById(id);
      if (!existingFeedback) {
        throw new NotFoundError(`Feedback with ID ${id} not found`);
      }

      // Delete the feedback
      const result = await this.repository.deleteFeedback(id, transaction);

      // Commit transaction
      await transaction.commit();

      // Clear caches
      await this.clearFeedbackCache(id);
      await this.clearProjectFeedbackCache(existingFeedback.projectId);

      // If this is a reply, clear the parent's replies cache
      if (existingFeedback.parentId) {
        await this.clearRepliesCache(existingFeedback.parentId);
      }

      return result;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteFeedback service:", error);
      throw new AppError("Failed to delete feedback");
    }
  }

  /**
   * Bulk delete feedback for a project
   */
  public async bulkDeleteFeedback(
    projectId: string
  ): Promise<ProjectFeedbackDeletionResult> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify project exists
      try {
        await projectService.getProjectById(projectId);
      } catch (error) {
        throw new NotFoundError(`Project with ID ${projectId} not found`);
      }

      // Delete all feedback for the project
      const result = await this.repository.bulkDeleteFeedback(
        projectId,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      // Clear project feedback cache
      await this.clearProjectFeedbackCache(projectId);

      return result;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in bulkDeleteFeedback service:", error);
      throw new AppError("Failed to bulk delete project feedback");
    }
  }

  /**
   * Get paginated feedback list
   */
  public async getFeedbackList(params: FeedbackListQueryParams): Promise<{
    feedback: ProjectFeedbackInterface[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    try {
      // Verify project exists if projectId is provided
      if (params.projectId) {
        try {
          await projectService.getProjectById(params.projectId);
        } catch (error) {
          throw new NotFoundError(
            `Project with ID ${params.projectId} not found`
          );
        }
      }

      const { feedback, total } = await this.repository.getFeedbackList(params);
      const { page = 1, limit = 20 } = params;

      return {
        feedback,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getFeedbackList service:", error);
      throw new AppError("Failed to get feedback list");
    }
  }

  /**
   * Clear feedback cache
   */
  private async clearFeedbackCache(feedbackId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${feedbackId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear project feedback cache
   */
  private async clearProjectFeedbackCache(projectId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}project:${projectId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear feedback replies cache
   */
  private async clearRepliesCache(parentId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}replies:${parentId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new ProjectFeedbackService(repository);
