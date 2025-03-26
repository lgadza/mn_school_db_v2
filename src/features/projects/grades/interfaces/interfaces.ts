/**
 * Project grade interface
 */
export interface ProjectGradeInterface {
  id: string;
  projectId: string;
  studentId: string;
  graderId: string;
  score: number;
  maxScore: number;
  comments: string | null;
  submissionDate: Date | null;
  gradedDate: Date;
  status: "pending" | "graded" | "revised" | "final";
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields for associations
  project?: any;
  student?: any;
  grader?: any;
}

/**
 * Project Grade deletion result interface
 */
export interface ProjectGradeDeletionResult {
  success: boolean;
  count: number;
  message: string;
}
