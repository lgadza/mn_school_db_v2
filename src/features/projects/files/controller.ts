import { Request, Response } from "express";
import { IProjectFileService } from "./interfaces/services";
import fileService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import fileUploadUtil, { FileType } from "@/common/utils/file/fileUploadUtil";
import { ProjectFileDTOMapper } from "./dto";

export class ProjectFileController {
  private service: IProjectFileService;

  constructor(service: IProjectFileService) {
    this.service = service;
  }

  /**
   * Get project file by ID
   */
  public getProjectFileById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const file = await this.service.getProjectFileById(id);
      const fileDTO = ProjectFileDTOMapper.toDetailDTO(file);

      ResponseUtil.sendSuccess(
        res,
        fileDTO,
        "Project file retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectFileById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving project file",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get project files by project ID
   */
  public getProjectFiles = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const files = await this.service.getFilesByProjectId(projectId);
      const fileDTOs = files.map((file) =>
        ProjectFileDTOMapper.toDetailDTO(file)
      );

      ResponseUtil.sendSuccess(
        res,
        fileDTOs,
        "Project files retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectFiles controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving project files",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Upload a project file
   */
  public uploadProjectFile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { description } = req.body;
      const userId = req.user?.id;

      if (!req.file) {
        ResponseUtil.sendError(
          res,
          "No file uploaded",
          HttpStatus.BAD_REQUEST,
          { code: ErrorCode.VAL_MISSING_REQUIRED_FIELD }
        );
        return;
      }

      if (!userId) {
        ResponseUtil.sendError(
          res,
          "User ID not found",
          HttpStatus.UNAUTHORIZED,
          { code: ErrorCode.AUTH_MISSING_TOKEN }
        );
        return;
      }

      // Upload file to storage
      const uploadResult = await fileUploadUtil.uploadToS3(
        req.file,
        FileType.ANY,
        {
          directory: `projects/${projectId}/files`,
        }
      );

      // Create file record in database
      const fileData = {
        projectId,
        filename: req.file.originalname,
        description: description || null,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        filePath: uploadResult.key,
        uploadedById: userId,
        fileUrl: uploadResult.url,
        thumbnailUrl: null, // Can be updated later if needed
      };

      const newFile = await this.service.createProjectFile(fileData);
      const fileDTO = ProjectFileDTOMapper.toDetailDTO(newFile);

      ResponseUtil.sendSuccess(
        res,
        fileDTO,
        "File uploaded successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in uploadProjectFile controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error uploading file",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a project file
   */
  public updateProjectFile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const fileData = req.body;

      const updatedFile = await this.service.updateProjectFile(id, fileData);
      const fileDTO = ProjectFileDTOMapper.toDetailDTO(updatedFile);

      ResponseUtil.sendSuccess(
        res,
        fileDTO,
        "Project file updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateProjectFile controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating project file",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a project file
   */
  public deleteProjectFile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteProjectFile(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Project file deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteProjectFile controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting project file",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Bulk delete project files
   */
  public bulkDeleteProjectFiles = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      const result = await this.service.bulkDeleteProjectFiles(projectId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Project files deleted successfully"
      );
    } catch (error) {
      logger.error("Error in bulkDeleteProjectFiles controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting project files",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Download a project file
   */
  public downloadProjectFile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { file, url } = await this.service.downloadProjectFile(id);

      // Create a simplified response that includes the download URL
      const response = {
        id: file.id,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        downloadUrl: url,
        downloadCount: file.downloadCount + 1, // Already incremented in the service
      };

      ResponseUtil.sendSuccess(
        res,
        response,
        "File download link generated successfully"
      );
    } catch (error) {
      logger.error("Error in downloadProjectFile controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error downloading project file",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get project file list
   */
  public getProjectFileList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = {
        projectId: req.query.projectId as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        fileType: req.query.fileType as string,
      };

      const { files, pagination } = await this.service.getProjectFileList(
        params
      );

      // Map files to DTOs
      const fileDTOs = files.map((file) =>
        ProjectFileDTOMapper.toDetailDTO(file)
      );

      ResponseUtil.sendSuccess(
        res,
        {
          files: fileDTOs,
          meta: pagination,
        },
        "Project files retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectFileList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving project file list",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new ProjectFileController(fileService);
