import { Transaction } from "sequelize";
import {
  ProjectFeedbackInterface,
  ProjectFeedbackDeletionResult,
} from "./interfaces";
import {
  CreateFeedbackDTO,
  UpdateFeedbackDTO,
  FeedbackListQueryParams,
} from "../dto";

export interface IProjectFeedbackRepository {
  /**
   * Find feedback by ID
   */
  findFeedbackById(id: string): Promise<ProjectFeedbackInterface | null>;

  /**
   * Find all feedback for a project
   */
  findFeedbackByProjectId(
    projectId: string
  ): Promise<ProjectFeedbackInterface[]>;

  /**
   * Find feedback by author
   */
  findFeedbackByAuthorId(authorId: string): Promise<ProjectFeedbackInterface[]>;

  /**
   * Find replies to a feedback
   */
  findRepliesByParentId(parentId: string): Promise<ProjectFeedbackInterface[]>;

  /**
   * Create new feedback
   */
  createFeedback(
    feedbackData: CreateFeedbackDTO,
    transaction?: Transaction
  ): Promise<ProjectFeedbackInterface>;

  /**
   * Update feedback
   */
  updateFeedback(
    id: string,
    feedbackData: UpdateFeedbackDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete feedback
   */
  deleteFeedback(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Bulk delete feedback for a project
   */
  bulkDeleteFeedback(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectFeedbackDeletionResult>;

  /**
   * Get paginated feedback list
   */
  getFeedbackList(params: FeedbackListQueryParams): Promise<{
    feedback: ProjectFeedbackInterface[];
    total: number;
  }>;
}

export interface IProjectFeedbackService {
  /**
   * Get feedback by ID
   */
  getFeedbackById(id: string): Promise<ProjectFeedbackInterface>;

  /**
   * Get all feedback for a project
   */
  getFeedbackByProjectId(
    projectId: string
  ): Promise<ProjectFeedbackInterface[]>;

  /**
   * Get feedback by author
   */
  getFeedbackByAuthorId(authorId: string): Promise<ProjectFeedbackInterface[]>;

  /**
   * Get replies to a feedback
   */
  getRepliesByParentId(parentId: string): Promise<ProjectFeedbackInterface[]>;

  /**
   * Create new feedback
   */
  createFeedback(
    feedbackData: CreateFeedbackDTO
  ): Promise<ProjectFeedbackInterface>;

  /**
   * Update feedback
   */
  updateFeedback(
    id: string,
    feedbackData: UpdateFeedbackDTO
  ): Promise<ProjectFeedbackInterface>;

  /**
   * Delete feedback
   */
  deleteFeedback(id: string): Promise<boolean>;

  /**
   * Bulk delete feedback for a project
   */
  bulkDeleteFeedback(projectId: string): Promise<ProjectFeedbackDeletionResult>;

  /**
   * Get paginated feedback list
   */
  getFeedbackList(params: FeedbackListQueryParams): Promise<{
    feedback: ProjectFeedbackInterface[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
}
