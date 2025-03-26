import { IProjectFeedbackRepository } from "./interfaces/services";
import {
  ProjectFeedbackInterface,
  ProjectFeedbackDeletionResult,
} from "./interfaces/interfaces";
import ProjectFeedback from "./model";
import Project from "../project/model";
import User from "../../users/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  CreateFeedbackDTO,
  UpdateFeedbackDTO,
  FeedbackListQueryParams,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ProjectFeedbackRepository implements IProjectFeedbackRepository {
  /**
   * Find feedback by ID
   */
  public async findFeedbackById(
    id: string
  ): Promise<ProjectFeedbackInterface | null> {
    try {
      return await ProjectFeedback.findByPk(id, {
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: User,
            as: "author",
            attributes: ["id", "firstName", "lastName", "email", "avatar"],
          },
          {
            model: ProjectFeedback,
            as: "parent",
          },
          {
            model: ProjectFeedback,
            as: "replies",
            separate: true,
            order: [["createdAt", "DESC"]],
            include: [
              {
                model: User,
                as: "author",
                attributes: ["id", "firstName", "lastName", "email", "avatar"],
              },
            ],
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding feedback by ID:", error);
      throw new DatabaseError("Database error while finding feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, feedbackId: id },
      });
    }
  }

  /**
   * Find all feedback for a project
   */
  public async findFeedbackByProjectId(
    projectId: string
  ): Promise<ProjectFeedbackInterface[]> {
    try {
      return await ProjectFeedback.findAll({
        where: {
          projectId,
          parentId: null, // Only get top-level feedback, not replies
          status: "active",
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "firstName", "lastName", "email", "avatar"],
          },
          {
            model: ProjectFeedback,
            as: "replies",
            separate: true,
            order: [["createdAt", "ASC"]],
            include: [
              {
                model: User,
                as: "author",
                attributes: ["id", "firstName", "lastName", "email", "avatar"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding feedback by project ID:", error);
      throw new DatabaseError("Database error while finding project feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId },
      });
    }
  }

  /**
   * Find feedback by author
   */
  public async findFeedbackByAuthorId(
    authorId: string
  ): Promise<ProjectFeedbackInterface[]> {
    try {
      return await ProjectFeedback.findAll({
        where: { authorId, status: "active" },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: ProjectFeedback,
            as: "parent",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding feedback by author ID:", error);
      throw new DatabaseError("Database error while finding author feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, authorId },
      });
    }
  }

  /**
   * Find replies to a feedback
   */
  public async findRepliesByParentId(
    parentId: string
  ): Promise<ProjectFeedbackInterface[]> {
    try {
      return await ProjectFeedback.findAll({
        where: { parentId, status: "active" },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "firstName", "lastName", "email", "avatar"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding replies by parent ID:", error);
      throw new DatabaseError("Database error while finding feedback replies", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, parentId },
      });
    }
  }

  /**
   * Create new feedback
   */
  public async createFeedback(
    feedbackData: CreateFeedbackDTO,
    transaction?: Transaction
  ): Promise<ProjectFeedbackInterface> {
    try {
      return await ProjectFeedback.create(feedbackData as any, { transaction });
    } catch (error) {
      logger.error("Error creating feedback:", error);
      throw new DatabaseError("Database error while creating feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update feedback
   */
  public async updateFeedback(
    id: string,
    feedbackData: UpdateFeedbackDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await ProjectFeedback.update(feedbackData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating feedback:", error);
      throw new DatabaseError("Database error while updating feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, feedbackId: id },
      });
    }
  }

  /**
   * Delete feedback
   */
  public async deleteFeedback(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Soft delete by updating status to 'deleted'
      const [updated] = await ProjectFeedback.update(
        { status: "deleted" },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error deleting feedback:", error);
      throw new DatabaseError("Database error while deleting feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, feedbackId: id },
      });
    }
  }

  /**
   * Bulk delete feedback for a project
   */
  public async bulkDeleteFeedback(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectFeedbackDeletionResult> {
    try {
      // Soft delete by updating status to 'deleted'
      const [count] = await ProjectFeedback.update(
        { status: "deleted" },
        {
          where: { projectId },
          transaction,
        }
      );

      return {
        success: count > 0,
        count,
        message:
          count > 0 ? `Deleted ${count} feedback items` : "No feedback deleted",
      };
    } catch (error) {
      logger.error("Error bulk deleting feedback:", error);
      throw new DatabaseError("Database error while bulk deleting feedback", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId },
      });
    }
  }

  /**
   * Get paginated feedback list
   */
  public async getFeedbackList(params: FeedbackListQueryParams): Promise<{
    feedback: ProjectFeedbackInterface[];
    total: number;
  }> {
    try {
      const {
        projectId,
        page = 1,
        limit = 20,
        authorId,
        parentId,
        type,
        status = "active",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      // Build where clause
      const where: WhereOptions<any> = { status };

      if (projectId) {
        where.projectId = projectId;
      }

      if (authorId) {
        where.authorId = authorId;
      }

      if (parentId !== undefined) {
        where.parentId = parentId === null ? null : parentId;
      }

      if (type) {
        where.type = type;
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get feedback and total count
      const { count, rows } = await ProjectFeedback.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "firstName", "lastName", "email", "avatar"],
          },
          {
            model: Project,
            as: "project",
          },
          {
            model: ProjectFeedback,
            as: "parent",
          },
          {
            model: ProjectFeedback,
            as: "replies",
            separate: true,
            limit: 5,
            order: [["createdAt", "ASC"]],
            where: { status: "active" },
            include: [
              {
                model: User,
                as: "author",
                attributes: ["id", "firstName", "lastName", "email", "avatar"],
              },
            ],
          },
        ],
      });

      return {
        feedback: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting feedback list:", error);
      throw new DatabaseError("Database error while getting feedback list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }
}

// Create and export repository instance
export default new ProjectFeedbackRepository();
