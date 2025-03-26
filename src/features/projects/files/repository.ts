import { IProjectFileRepository } from "./interfaces/services";
import {
  ProjectFileInterface,
  ProjectFileDeletionResult,
} from "./interfaces/interfaces";
import ProjectFile from "./model";
import Project from "../project/model";
import User from "../../users/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  CreateProjectFileDTO,
  UpdateProjectFileDTO,
  ProjectFileListQueryParams,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ProjectFileRepository implements IProjectFileRepository {
  /**
   * Find a project file by ID
   */
  public async findProjectFileById(
    id: string
  ): Promise<ProjectFileInterface | null> {
    try {
      return await ProjectFile.findByPk(id, {
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: User,
            as: "uploadedBy",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding project file by ID:", error);
      throw new DatabaseError("Database error while finding project file", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, fileId: id },
      });
    }
  }

  /**
   * Find project files by project ID
   */
  public async findFilesByProjectId(
    projectId: string
  ): Promise<ProjectFileInterface[]> {
    try {
      return await ProjectFile.findAll({
        where: { projectId },
        include: [
          {
            model: User,
            as: "uploadedBy",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding project files by project ID:", error);
      throw new DatabaseError("Database error while finding project files", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId },
      });
    }
  }

  /**
   * Find project files by uploader ID
   */
  public async findFilesByUploaderId(
    uploadedById: string
  ): Promise<ProjectFileInterface[]> {
    try {
      return await ProjectFile.findAll({
        where: { uploadedById },
        include: [
          {
            model: Project,
            as: "project",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding project files by uploader ID:", error);
      throw new DatabaseError(
        "Database error while finding files by uploader",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, uploadedById },
        }
      );
    }
  }

  /**
   * Create a new project file
   */
  public async createProjectFile(
    fileData: CreateProjectFileDTO,
    transaction?: Transaction
  ): Promise<ProjectFileInterface> {
    try {
      return await ProjectFile.create(fileData as any, { transaction });
    } catch (error) {
      logger.error("Error creating project file:", error);
      throw new DatabaseError("Database error while creating project file", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a project file
   */
  public async updateProjectFile(
    id: string,
    fileData: UpdateProjectFileDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await ProjectFile.update(fileData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating project file:", error);
      throw new DatabaseError("Database error while updating project file", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, fileId: id },
      });
    }
  }

  /**
   * Delete a project file
   */
  public async deleteProjectFile(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await ProjectFile.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting project file:", error);
      throw new DatabaseError("Database error while deleting project file", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, fileId: id },
      });
    }
  }

  /**
   * Bulk delete project files
   */
  public async bulkDeleteProjectFiles(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectFileDeletionResult> {
    try {
      const count = await ProjectFile.destroy({
        where: { projectId },
        transaction,
      });

      return {
        success: count > 0,
        count,
        message: count > 0 ? `Deleted ${count} files` : "No files deleted",
      };
    } catch (error) {
      logger.error("Error bulk deleting project files:", error);
      throw new DatabaseError(
        "Database error while bulk deleting project files",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId },
        }
      );
    }
  }

  /**
   * Get project file list with pagination
   */
  public async getProjectFileList(params: ProjectFileListQueryParams): Promise<{
    files: ProjectFileInterface[];
    total: number;
  }> {
    try {
      const {
        projectId,
        page = 1,
        limit = 20,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        fileType,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = { projectId };

      // Apply filters
      if (fileType) {
        where.fileType = fileType;
      }

      // Search by filename
      if (search) {
        where.filename = { [Op.iLike]: `%${search}%` };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get files and total count
      const { count, rows } = await ProjectFile.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: User,
            as: "uploadedBy",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });

      return {
        files: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting project file list:", error);
      throw new DatabaseError(
        "Database error while getting project file list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
        }
      );
    }
  }

  /**
   * Increment download count for a file
   */
  public async incrementDownloadCount(id: string): Promise<boolean> {
    try {
      const result = await ProjectFile.increment("downloadCount", {
        where: { id },
      });
      // The increment method returns a complex object,
      // we need to check if any rows were affected
      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      logger.error("Error incrementing download count:", error);
      throw new DatabaseError(
        "Database error while incrementing download count",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, fileId: id },
        }
      );
    }
  }
}

// Create and export repository instance
export default new ProjectFileRepository();
