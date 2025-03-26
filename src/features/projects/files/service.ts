import {
  IProjectFileService,
  IProjectFileRepository,
} from "./interfaces/services";
import {
  ProjectFileInterface,
  ProjectFileDeletionResult,
} from "./interfaces/interfaces";
import {
  CreateProjectFileDTO,
  UpdateProjectFileDTO,
  ProjectFileListQueryParams,
  ProjectFileDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  NotFoundError,
  BadRequestError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import fileUploadUtil from "@/common/utils/file/fileUploadUtil";
import db from "@/config/database";

export class ProjectFileService implements IProjectFileService {
  private repository: IProjectFileRepository;
  private readonly CACHE_PREFIX = "project-file:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IProjectFileRepository) {
    this.repository = repository;
  }

  /**
   * Get project file by ID
   */
  public async getProjectFileById(id: string): Promise<ProjectFileInterface> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedFile = await cache.get(cacheKey);

      if (cachedFile) {
        return JSON.parse(cachedFile);
      }

      // Get from database if not in cache
      const file = await this.repository.findProjectFileById(id);
      if (!file) {
        throw new NotFoundError(`Project file with ID ${id} not found`);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(file), this.CACHE_TTL);

      return file;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProjectFileById service:", error);
      throw new AppError("Failed to get project file");
    }
  }

  /**
   * Get project files by project ID
   */
  public async getFilesByProjectId(
    projectId: string
  ): Promise<ProjectFileInterface[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}project:${projectId}`;
      const cachedFiles = await cache.get(cacheKey);

      if (cachedFiles) {
        return JSON.parse(cachedFiles);
      }

      // Get from database if not in cache
      const files = await this.repository.findFilesByProjectId(projectId);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(files), this.CACHE_TTL);

      return files;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getFilesByProjectId service:", error);
      throw new AppError("Failed to get project files");
    }
  }

  /**
   * Create a new project file
   */
  public async createProjectFile(
    fileData: CreateProjectFileDTO
  ): Promise<ProjectFileInterface> {
    try {
      // Create the file record
      const newFile = await this.repository.createProjectFile(fileData);

      // Clear project files cache
      await this.clearProjectFilesCache(fileData.projectId);

      return newFile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createProjectFile service:", error);
      throw new AppError("Failed to create project file");
    }
  }

  /**
   * Update a project file
   */
  public async updateProjectFile(
    id: string,
    fileData: UpdateProjectFileDTO
  ): Promise<ProjectFileInterface> {
    try {
      // Check if file exists
      const existingFile = await this.repository.findProjectFileById(id);
      if (!existingFile) {
        throw new NotFoundError(`Project file with ID ${id} not found`);
      }

      // Update file
      await this.repository.updateProjectFile(id, fileData);

      // Clear caches
      await this.clearFileCache(id);
      await this.clearProjectFilesCache(existingFile.projectId);

      // Get the updated file
      return this.getProjectFileById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateProjectFile service:", error);
      throw new AppError("Failed to update project file");
    }
  }

  /**
   * Delete a project file
   */
  public async deleteProjectFile(id: string): Promise<boolean> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if file exists
      const existingFile = await this.repository.findProjectFileById(id);
      if (!existingFile) {
        throw new NotFoundError(`Project file with ID ${id} not found`);
      }

      // Delete file from storage if we have a path
      if (existingFile.filePath) {
        try {
          await fileUploadUtil.deleteFromS3(existingFile.filePath);
        } catch (error) {
          const storageError = error as Error;
          logger.warn(
            `Failed to delete file from storage: ${storageError.message}`
          );
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete file record from database
      const result = await this.repository.deleteProjectFile(id, transaction);

      // Commit transaction
      await transaction.commit();

      // Clear caches
      await this.clearFileCache(id);
      await this.clearProjectFilesCache(existingFile.projectId);

      return result;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteProjectFile service:", error);
      throw new AppError("Failed to delete project file");
    }
  }

  /**
   * Bulk delete project files
   */
  public async bulkDeleteProjectFiles(
    projectId: string
  ): Promise<ProjectFileDeletionResult> {
    const transaction = await db.sequelize.transaction();

    try {
      // Get all files for the project
      const files = await this.repository.findFilesByProjectId(projectId);

      // Try to delete files from storage
      for (const file of files) {
        if (file.filePath) {
          try {
            await fileUploadUtil.deleteFromS3(file.filePath);
          } catch (error) {
            const storageError = error as Error;
            logger.warn(
              `Failed to delete file from storage: ${storageError.message}`
            );
            // Continue with other files even if one fails
          }
        }
      }

      // Delete files from database
      const result = await this.repository.bulkDeleteProjectFiles(
        projectId,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      // Clear caches
      for (const file of files) {
        await this.clearFileCache(file.id);
      }
      await this.clearProjectFilesCache(projectId);

      return result;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in bulkDeleteProjectFiles service:", error);
      throw new AppError("Failed to bulk delete project files");
    }
  }

  /**
   * Download a project file
   */
  public async downloadProjectFile(id: string): Promise<{
    file: ProjectFileInterface;
    url: string;
  }> {
    try {
      // Get file
      const file = await this.getProjectFileById(id);

      // Generate download URL if needed or use existing URL
      let downloadUrl = file.fileUrl;

      // Increment download count
      await this.repository.incrementDownloadCount(id);

      // Clear file cache so next fetch will show updated download count
      await this.clearFileCache(id);

      return {
        file,
        url: downloadUrl,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in downloadProjectFile service:", error);
      throw new AppError("Failed to download project file");
    }
  }

  /**
   * Get project file list with pagination
   */
  public async getProjectFileList(params: ProjectFileListQueryParams): Promise<{
    files: ProjectFileInterface[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    try {
      const { files, total } = await this.repository.getProjectFileList(params);
      const { page = 1, limit = 20 } = params;

      return {
        files,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProjectFileList service:", error);
      throw new AppError("Failed to get project file list");
    }
  }

  /**
   * Clear file cache
   */
  private async clearFileCache(fileId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${fileId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear project files cache
   */
  private async clearProjectFilesCache(projectId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}project:${projectId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new ProjectFileService(repository);
