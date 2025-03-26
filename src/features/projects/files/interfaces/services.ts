import { Transaction } from "sequelize";
import { ProjectFileInterface, ProjectFileDeletionResult } from "./interfaces";
import {
  CreateProjectFileDTO,
  UpdateProjectFileDTO,
  ProjectFileListQueryParams,
} from "../dto";

export interface IProjectFileRepository {
  /**
   * Find a project file by ID
   */
  findProjectFileById(id: string): Promise<ProjectFileInterface | null>;

  /**
   * Find project files by project ID
   */
  findFilesByProjectId(projectId: string): Promise<ProjectFileInterface[]>;

  /**
   * Find project files by uploader ID
   */
  findFilesByUploaderId(uploadedById: string): Promise<ProjectFileInterface[]>;

  /**
   * Create a new project file
   */
  createProjectFile(
    fileData: CreateProjectFileDTO,
    transaction?: Transaction
  ): Promise<ProjectFileInterface>;

  /**
   * Update a project file
   */
  updateProjectFile(
    id: string,
    fileData: UpdateProjectFileDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a project file
   */
  deleteProjectFile(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Bulk delete project files
   */
  bulkDeleteProjectFiles(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectFileDeletionResult>;

  /**
   * Get project file list with pagination
   */
  getProjectFileList(params: ProjectFileListQueryParams): Promise<{
    files: ProjectFileInterface[];
    total: number;
  }>;

  /**
   * Increment download count for a file
   */
  incrementDownloadCount(id: string): Promise<boolean>;
}

export interface IProjectFileService {
  /**
   * Get project file by ID
   */
  getProjectFileById(id: string): Promise<ProjectFileInterface>;

  /**
   * Get project files by project ID
   */
  getFilesByProjectId(projectId: string): Promise<ProjectFileInterface[]>;

  /**
   * Create a new project file
   */
  createProjectFile(
    fileData: CreateProjectFileDTO
  ): Promise<ProjectFileInterface>;

  /**
   * Update a project file
   */
  updateProjectFile(
    id: string,
    fileData: UpdateProjectFileDTO
  ): Promise<ProjectFileInterface>;

  /**
   * Delete a project file
   */
  deleteProjectFile(id: string): Promise<boolean>;

  /**
   * Bulk delete project files
   */
  bulkDeleteProjectFiles(projectId: string): Promise<ProjectFileDeletionResult>;

  /**
   * Download a project file
   */
  downloadProjectFile(id: string): Promise<{
    file: ProjectFileInterface;
    url: string;
  }>;

  /**
   * Get project file list with pagination
   */
  getProjectFileList(params: ProjectFileListQueryParams): Promise<{
    files: ProjectFileInterface[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
}
