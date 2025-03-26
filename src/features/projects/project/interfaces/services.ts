import { Transaction } from "sequelize";
import { ProjectInterface, ProjectDeletionResult } from "./interfaces";
import {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectDetailDTO,
  ProjectListQueryParams,
  PaginatedProjectListDTO,
  BulkCreateProjectDTO,
  BulkDeleteProjectDTO,
} from "../dto";

export interface IProjectRepository {
  /**
   * Find a project by ID
   */
  findProjectById(id: string): Promise<ProjectInterface | null>;

  /**
   * Find projects by class ID
   */
  findProjectsByClassId(classId: string): Promise<ProjectInterface[]>;

  /**
   * Find projects by subject ID
   */
  findProjectsBySubjectId(subjectId: string): Promise<ProjectInterface[]>;

  /**
   * Find projects by teacher ID
   */
  findProjectsByTeacherId(teacherId: string): Promise<ProjectInterface[]>;

  /**
   * Find projects by school ID
   */
  findProjectsBySchoolId(schoolId: string): Promise<ProjectInterface[]>;

  /**
   * Create a new project
   */
  createProject(
    projectData: CreateProjectDTO,
    transaction?: Transaction
  ): Promise<ProjectInterface>;

  /**
   * Bulk create projects
   */
  bulkCreateProjects(
    projectsData: BulkCreateProjectDTO[],
    transaction?: Transaction
  ): Promise<ProjectInterface[]>;

  /**
   * Update a project
   */
  updateProject(
    id: string,
    projectData: UpdateProjectDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a project
   */
  deleteProject(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Bulk delete projects
   */
  bulkDeleteProjects(
    criteria: BulkDeleteProjectDTO,
    transaction?: Transaction
  ): Promise<ProjectDeletionResult>;

  /**
   * Get project list with filtering and pagination
   */
  getProjectList(params: ProjectListQueryParams): Promise<{
    projects: ProjectInterface[];
    total: number;
  }>;

  /**
   * Check if a project title exists for the same class/teacher
   */
  isProjectTitleTaken(
    title: string,
    teacherId: string,
    classId?: string,
    excludeId?: string
  ): Promise<boolean>;
}

export interface IProjectService {
  /**
   * Get project by ID
   */
  getProjectById(id: string): Promise<ProjectDetailDTO>;

  /**
   * Get projects by class ID
   */
  getProjectsByClassId(classId: string): Promise<ProjectDetailDTO[]>;

  /**
   * Get projects by subject ID
   */
  getProjectsBySubjectId(subjectId: string): Promise<ProjectDetailDTO[]>;

  /**
   * Get projects by teacher ID
   */
  getProjectsByTeacherId(teacherId: string): Promise<ProjectDetailDTO[]>;

  /**
   * Create a new project
   */
  createProject(projectData: CreateProjectDTO): Promise<ProjectDetailDTO>;

  /**
   * Bulk create projects
   */
  bulkCreateProjects(
    projectsData: BulkCreateProjectDTO[]
  ): Promise<ProjectDetailDTO[]>;

  /**
   * Update a project
   */
  updateProject(
    id: string,
    projectData: UpdateProjectDTO
  ): Promise<ProjectDetailDTO>;

  /**
   * Delete a project
   */
  deleteProject(id: string): Promise<boolean>;

  /**
   * Bulk delete projects
   */
  bulkDeleteProjects(
    criteria: BulkDeleteProjectDTO
  ): Promise<ProjectDeletionResult>;

  /**
   * Get paginated project list
   */
  getProjectList(
    params: ProjectListQueryParams
  ): Promise<PaginatedProjectListDTO>;

  /**
   * Validate project data
   */
  validateProjectData(
    projectData: CreateProjectDTO | UpdateProjectDTO,
    projectId?: string
  ): Promise<boolean>;
}
