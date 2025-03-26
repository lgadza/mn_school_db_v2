/**
 * Project feedback types
 */
export type FeedbackType =
  | "comment"
  | "suggestion"
  | "correction"
  | "praise"
  | "question";

/**
 * Project feedback interface
 */
export interface ProjectFeedbackInterface {
  id: string;
  projectId: string;
  content: string;
  type: FeedbackType;
  authorId: string;
  parentId: string | null;
  status: "active" | "archived" | "deleted";
  isPrivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields for associations
  project?: any;
  author?: any;
  parent?: any;
  replies?: any[];
}

/**
 * Project Feedback deletion result interface
 */
export interface ProjectFeedbackDeletionResult {
  success: boolean;
  count: number;
  message: string;
}
