import { ProjectFileInterface } from "./interfaces/interfaces";
import { UserBaseDTO } from "@/features/users/dto";
import { ProjectSimpleDTO } from "../project/dto";

/**
 * Base DTO for project file information
 */
export interface ProjectFileBaseDTO {
  id: string;
  projectId: string;
  filename: string;
  description: string | null;
  fileSize: number | null;
  fileType: string | null;
  uploadedById: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  downloadCount: number;
}

/**
 * Detailed project file DTO with timestamps and related entities
 */
export interface ProjectFileDetailDTO extends ProjectFileBaseDTO {
  createdAt: string;
  updatedAt: string;
  project?: ProjectSimpleDTO;
  uploadedBy?: UserBaseDTO;
}

/**
 * Simple project file DTO without timestamps
 */
export interface ProjectFileSimpleDTO extends ProjectFileBaseDTO {}

/**
 * DTO for creating a new project file
 */
export interface CreateProjectFileDTO {
  projectId: string;
  filename: string;
  description?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  filePath?: string | null;
  uploadedById: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
}

/**
 * DTO for updating a project file
 */
export interface UpdateProjectFileDTO {
  filename?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
}

/**
 * Query parameters for project file list
 */
export interface ProjectFileListQueryParams {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fileType?: string;
}

/**
 * Mapper class for converting between ProjectFile entities and DTOs
 */
export class ProjectFileDTOMapper {
  /**
   * Map ProjectFile entity to BaseDTO
   */
  public static toBaseDTO(file: ProjectFileInterface): ProjectFileBaseDTO {
    return {
      id: file.id,
      projectId: file.projectId,
      filename: file.filename,
      description: file.description,
      fileSize: file.fileSize,
      fileType: file.fileType,
      uploadedById: file.uploadedById,
      fileUrl: file.fileUrl,
      thumbnailUrl: file.thumbnailUrl,
      downloadCount: file.downloadCount,
    };
  }

  /**
   * Map ProjectFile entity to DetailDTO
   */
  public static toDetailDTO(file: any): ProjectFileDetailDTO {
    const detailDTO: ProjectFileDetailDTO = {
      ...this.toBaseDTO(file),
      createdAt: file.createdAt
        ? file.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: file.updatedAt
        ? file.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add associated entities if available
    if (file.project) detailDTO.project = file.project;
    if (file.uploadedBy) detailDTO.uploadedBy = file.uploadedBy;

    return detailDTO;
  }

  /**
   * Map ProjectFile entity to SimpleDTO
   */
  public static toSimpleDTO(file: ProjectFileInterface): ProjectFileSimpleDTO {
    return this.toBaseDTO(file);
  }
}
