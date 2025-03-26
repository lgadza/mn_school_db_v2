/**
 * ProjectFile interface
 */
export interface ProjectFileInterface {
  id: string;
  projectId: string;
  filename: string;
  description: string | null;
  fileSize: number | null;
  fileType: string | null;
  filePath: string | null;
  uploadedById: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  downloadCount: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields for associations
  project?: any;
  uploadedBy?: any;
}

/**
 * Project File deletion result
 */
export interface ProjectFileDeletionResult {
  success: boolean;
  count: number;
  message: string;
}
