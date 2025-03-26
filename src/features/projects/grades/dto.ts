import { ProjectGradeInterface } from "./interfaces/interfaces";
import { UserBaseDTO } from "@/features/users/dto";
import { ProjectSimpleDTO } from "../project/dto";
import { StudentBaseDTO } from "@/features/accounts/students/dto";

/**
 * Base DTO for project grade information
 */
export interface GradeBaseDTO {
  id: string;
  projectId: string;
  studentId: string;
  graderId: string;
  score: number;
  maxScore: number;
  comments: string | null;
  submissionDate: string | null;
  gradedDate: string;
  status: "pending" | "graded" | "revised" | "final";
}

/**
 * Detailed project grade DTO with timestamps and related entities
 */
export interface GradeDetailDTO extends GradeBaseDTO {
  createdAt: string;
  updatedAt: string;
  project?: ProjectSimpleDTO;
  student?: StudentBaseDTO;
  grader?: UserBaseDTO;
  scorePercentage?: number;
}

/**
 * Simple project grade DTO without timestamps
 */
export interface GradeSimpleDTO extends GradeBaseDTO {}

/**
 * DTO for creating a new project grade
 */
export interface CreateGradeDTO {
  projectId: string;
  studentId: string;
  graderId: string;
  score: number;
  maxScore: number;
  comments?: string | null;
  submissionDate?: Date | string | null;
  gradedDate?: Date | string;
  status?: "pending" | "graded" | "revised" | "final";
}

/**
 * DTO for updating a project grade
 */
export interface UpdateGradeDTO {
  score?: number;
  maxScore?: number;
  comments?: string | null;
  submissionDate?: Date | string | null;
  gradedDate?: Date | string;
  status?: "pending" | "graded" | "revised" | "final";
}

/**
 * Query parameters for project grade list
 */
export interface GradeListQueryParams {
  projectId?: string;
  studentId?: string;
  graderId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minScore?: number;
  maxScore?: number;
}

/**
 * Mapper class for converting between ProjectGrade entities and DTOs
 */
export class GradeDTOMapper {
  /**
   * Map ProjectGrade entity to BaseDTO
   */
  public static toBaseDTO(grade: ProjectGradeInterface): GradeBaseDTO {
    return {
      id: grade.id,
      projectId: grade.projectId,
      studentId: grade.studentId,
      graderId: grade.graderId,
      score: grade.score,
      maxScore: grade.maxScore,
      comments: grade.comments,
      submissionDate: grade.submissionDate
        ? grade.submissionDate.toISOString()
        : null,
      gradedDate: grade.gradedDate.toISOString(),
      status: grade.status,
    };
  }

  /**
   * Map ProjectGrade entity to DetailDTO
   */
  public static toDetailDTO(grade: any): GradeDetailDTO {
    const detailDTO: GradeDetailDTO = {
      ...this.toBaseDTO(grade),
      createdAt: grade.createdAt
        ? grade.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: grade.updatedAt
        ? grade.updatedAt.toISOString()
        : new Date().toISOString(),
      scorePercentage:
        grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0,
    };

    // Add associated entities if available
    if (grade.project) detailDTO.project = grade.project;
    if (grade.student) detailDTO.student = grade.student;
    if (grade.grader) detailDTO.grader = grade.grader;

    return detailDTO;
  }

  /**
   * Map ProjectGrade entity to SimpleDTO
   */
  public static toSimpleDTO(grade: ProjectGradeInterface): GradeSimpleDTO {
    return this.toBaseDTO(grade);
  }
}
