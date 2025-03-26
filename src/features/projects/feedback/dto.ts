import {
  ProjectFeedbackInterface,
  FeedbackType,
} from "./interfaces/interfaces";
import { UserBaseDTO } from "@/features/users/dto";
import { ProjectSimpleDTO } from "../project/dto";

/**
 * Base DTO for project feedback information
 */
export interface FeedbackBaseDTO {
  id: string;
  projectId: string;
  content: string;
  type: FeedbackType;
  authorId: string;
  parentId: string | null;
  status: "active" | "archived" | "deleted";
  isPrivate: boolean;
}

/**
 * Detailed project feedback DTO with timestamps and related entities
 */
export interface FeedbackDetailDTO extends FeedbackBaseDTO {
  createdAt: string;
  updatedAt: string;
  project?: ProjectSimpleDTO;
  author?: UserBaseDTO;
  parent?: FeedbackBaseDTO;
  replies?: FeedbackBaseDTO[];
  repliesCount?: number;
}

/**
 * Simple project feedback DTO without timestamps
 */
export interface FeedbackSimpleDTO extends FeedbackBaseDTO {}

/**
 * DTO for creating a new project feedback
 */
export interface CreateFeedbackDTO {
  projectId: string;
  content: string;
  type?: FeedbackType;
  authorId: string;
  parentId?: string | null;
  isPrivate?: boolean;
}

/**
 * DTO for updating a project feedback
 */
export interface UpdateFeedbackDTO {
  content?: string;
  type?: FeedbackType;
  status?: "active" | "archived" | "deleted";
  isPrivate?: boolean;
}

/**
 * Query parameters for project feedback list
 */
export interface FeedbackListQueryParams {
  projectId: string;
  page?: number;
  limit?: number;
  authorId?: string;
  parentId?: string;
  type?: FeedbackType;
  status?: "active" | "archived" | "deleted";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Mapper class for converting between ProjectFeedback entities and DTOs
 */
export class FeedbackDTOMapper {
  /**
   * Map ProjectFeedback entity to BaseDTO
   */
  public static toBaseDTO(feedback: ProjectFeedbackInterface): FeedbackBaseDTO {
    return {
      id: feedback.id,
      projectId: feedback.projectId,
      content: feedback.content,
      type: feedback.type,
      authorId: feedback.authorId,
      parentId: feedback.parentId,
      status: feedback.status,
      isPrivate: feedback.isPrivate,
    };
  }

  /**
   * Map ProjectFeedback entity to DetailDTO
   */
  public static toDetailDTO(feedback: any): FeedbackDetailDTO {
    const detailDTO: FeedbackDetailDTO = {
      ...this.toBaseDTO(feedback),
      createdAt: feedback.createdAt
        ? feedback.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: feedback.updatedAt
        ? feedback.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add associated entities if available
    if (feedback.project) detailDTO.project = feedback.project;
    if (feedback.author) detailDTO.author = feedback.author;
    if (feedback.parent) detailDTO.parent = this.toBaseDTO(feedback.parent);

    // Add replies if available, or just the count
    if (feedback.replies) {
      if (Array.isArray(feedback.replies)) {
        detailDTO.replies = feedback.replies.map(
          (reply: ProjectFeedbackInterface): FeedbackBaseDTO =>
            this.toBaseDTO(reply)
        );
        detailDTO.repliesCount = feedback.replies.length;
      } else {
        detailDTO.repliesCount = feedback.replies;
      }
    }

    return detailDTO;
  }

  /**
   * Map ProjectFeedback entity to SimpleDTO
   */
  public static toSimpleDTO(
    feedback: ProjectFeedbackInterface
  ): FeedbackSimpleDTO {
    return this.toBaseDTO(feedback);
  }
}
