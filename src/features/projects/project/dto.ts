import {
  ProjectInterface,
  ProjectStatus,
  ProjectDifficulty,
} from "./interfaces/interfaces";
import { TeacherBaseDTO } from "@/features/teachers/dto";
import { ClassBaseDTO } from "@/features/school_config/classes/dto";
import { SubjectBaseDTO } from "@/features/school_config/subjects/dto";
import { SchoolBaseDTO } from "@/features/schools/dto";
import { UserBaseDTO } from "@/features/users/dto";

/**
 * Base DTO for project information
 */
export interface ProjectBaseDTO {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  dueDate: string | null;
  assignedDate: string | null;
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
}

/**
 * Detailed project DTO with timestamps and related entities
 */
export interface ProjectDetailDTO extends ProjectBaseDTO {
  createdAt: string;
  updatedAt: string;
  subject?: SubjectBaseDTO;
  class?: ClassBaseDTO;
  teacher?: TeacherBaseDTO;
  school?: SchoolBaseDTO;
  createdBy?: UserBaseDTO;
  modifiedBy?: UserBaseDTO;
  // Include summary counts of related entities
  filesCount?: number;
  gradesCount?: number;
  feedbackCount?: number;
}

/**
 * Simple project DTO without timestamps
 */
export interface ProjectSimpleDTO extends ProjectBaseDTO {}

/**
 * DTO for creating a new project
 */
export interface CreateProjectDTO {
  title: string;
  description?: string | null;
  instructions?: string | null;
  dueDate?: Date | string | null;
  assignedDate?: Date | string | null;
  status?: ProjectStatus;
  subjectId: string;
  classId?: string | null;
  teacherId: string;
  schoolId: string;
  difficulty?: ProjectDifficulty | null;
  maxPoints?: number | null;
  isGroupProject?: boolean;
  createdById: string;
}

/**
 * DTO for bulk creating projects
 */
export interface BulkCreateProjectDTO extends CreateProjectDTO {}

/**
 * DTO for updating a project
 */
export interface UpdateProjectDTO {
  title?: string;
  description?: string | null;
  instructions?: string | null;
  dueDate?: Date | string | null;
  assignedDate?: Date | string | null;
  status?: ProjectStatus;
  subjectId?: string;
  classId?: string | null;
  teacherId?: string;
  schoolId?: string;
  difficulty?: ProjectDifficulty | null;
  maxPoints?: number | null;
  isGroupProject?: boolean;
  modifiedById: string;
}

/**
 * DTO for bulk deleting projects
 */
export interface BulkDeleteProjectDTO {
  ids?: string[];
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  schoolId?: string;
}

/**
 * Query parameters for project list
 */
export interface ProjectListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  schoolId?: string;
  status?: ProjectStatus;
  difficulty?: ProjectDifficulty;
  isGroupProject?: boolean;
  fromDueDate?: Date | string;
  toDueDate?: Date | string;
}

/**
 * Paginated project list response
 */
export interface PaginatedProjectListDTO {
  projects: ProjectDetailDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Mapper class for converting between Project entities and DTOs
 */
export class ProjectDTOMapper {
  /**
   * Map Project entity to BaseDTO
   */
  public static toBaseDTO(project: ProjectInterface): ProjectBaseDTO {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      instructions: project.instructions,
      dueDate: project.dueDate ? project.dueDate.toISOString() : null,
      assignedDate: project.assignedDate
        ? project.assignedDate.toISOString()
        : null,
      status: project.status,
      subjectId: project.subjectId,
      classId: project.classId,
      teacherId: project.teacherId,
      schoolId: project.schoolId,
      difficulty: project.difficulty,
      maxPoints: project.maxPoints,
      isGroupProject: project.isGroupProject,
      createdById: project.createdById,
      modifiedById: project.modifiedById,
    };
  }

  /**
   * Map Project entity to DetailDTO
   */
  public static toDetailDTO(project: any): ProjectDetailDTO {
    const detailDTO: ProjectDetailDTO = {
      ...this.toBaseDTO(project),
      createdAt: project.createdAt
        ? project.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: project.updatedAt
        ? project.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add associated entities if available
    if (project.subject) detailDTO.subject = project.subject;
    if (project.class) detailDTO.class = project.class;
    if (project.teacher) detailDTO.teacher = project.teacher;
    if (project.school) detailDTO.school = project.school;
    if (project.createdBy) detailDTO.createdBy = project.createdBy;
    if (project.modifiedBy) detailDTO.modifiedBy = project.modifiedBy;

    // Add counts of related entities if available
    if (project.files) detailDTO.filesCount = project.files.length;
    if (project.grades) detailDTO.gradesCount = project.grades.length;
    if (project.feedback) detailDTO.feedbackCount = project.feedback.length;

    return detailDTO;
  }

  /**
   * Map Project entity to SimpleDTO
   */
  public static toSimpleDTO(project: ProjectInterface): ProjectSimpleDTO {
    return this.toBaseDTO(project);
  }
}
