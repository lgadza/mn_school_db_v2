/**
 * Project status types
 */
export type ProjectStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "completed"
  | "archived";

/**
 * Project difficulty level
 */
export type ProjectDifficulty = "easy" | "medium" | "hard" | "advanced";

/**
 * Base Project interface
 */
export interface ProjectInterface {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  dueDate: Date | null;
  assignedDate: Date | null;
  status: ProjectStatus;
  subjectId: string;
  classId: string | null;
  teacherId: string;
  schoolId: string;
  difficulty: ProjectDifficulty | null;
  maxPoints: number | null;
  isGroupProject: boolean;
  createdById: string;
  modifiedById: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields for associations
  subject?: any;
  class?: any;
  teacher?: any;
  school?: any;
  createdBy?: any;
  modifiedBy?: any;
  files?: any[];
  grades?: any[];
  feedback?: any[];
}

/**
 * Project deletion result interface
 */
export interface ProjectDeletionResult {
  success: boolean;
  count: number;
  message: string;
}
