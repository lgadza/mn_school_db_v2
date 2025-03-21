import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import logger from "@/common/utils/logging/logger";
import { s3Client } from "@/config";
import { appConfig } from "@/config";
import { generateUniqueFileName } from "@/shared/middleware/multer";

/**
 * Supported file types
 */
export enum FileType {
  IMAGE = "image",
  DOCUMENT = "document",
  VIDEO = "video",
  AUDIO = "audio",
}

/**
 * Default MIME types for each file type
 */
export const DEFAULT_MIME_TYPES: Record<FileType, string[]> = {
  [FileType.IMAGE]: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
  ],
  [FileType.DOCUMENT]: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    "application/zip",
    "application/x-7z-compressed",
    "application/x-rar-compressed",
  ],
  [FileType.VIDEO]: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
    "video/x-ms-wmv",
  ],
  [FileType.AUDIO]: [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",
    "audio/mp4",
  ],
};

/**
 * File information
 */
export interface FileInfo {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  key: string;
  bucket: string;
  etag?: string;
  lastModified?: Date;
  fileType: FileType;
  checksum?: string;
  metadata?: Record<string, string>;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  directory?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  generateChecksum?: boolean;
  customFileName?: string;
}

/**
 * Default options for different file types
 */
export const DEFAULT_OPTIONS: Record<FileType, FileUploadOptions> = {
  [FileType.IMAGE]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: DEFAULT_MIME_TYPES[FileType.IMAGE],
    directory: "images",
    isPublic: true,
    generateChecksum: true,
  },
  [FileType.DOCUMENT]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: DEFAULT_MIME_TYPES[FileType.DOCUMENT],
    directory: "documents",
    isPublic: false,
    generateChecksum: true,
  },
  [FileType.VIDEO]: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: DEFAULT_MIME_TYPES[FileType.VIDEO],
    directory: "videos",
    isPublic: true,
    generateChecksum: false, // Checksums can be expensive for large files
  },
  [FileType.AUDIO]: {
    maxSize: 30 * 1024 * 1024, // 30MB
    allowedMimeTypes: DEFAULT_MIME_TYPES[FileType.AUDIO],
    directory: "audio",
    isPublic: true,
    generateChecksum: true,
  },
};

/**
 * File Upload Utility
 * Provides standardized methods for file operations
 */
export class FileUploadUtil {
  private static readonly BUCKET_NAME = appConfig.aws.s3.bucketName;

  /**
   * Express middleware for handling file uploads to S3
   *
   * @param uploadField - Field name for the file in the request
   * @param fileType - Type of file being uploaded
   * @param options - Upload options
   */
  public static uploadToS3Middleware(
    uploadField: string,
    fileType: FileType = FileType.DOCUMENT,
    options: Partial<FileUploadOptions> = {}
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check if file exists in request
        if (!req.file && !(req.files && Object.keys(req.files).length > 0)) {
          return next();
        }

        // Single file upload
        if (req.file) {
          const fileInfo = await this.uploadToS3(req.file, fileType, options);
          // Add file info to request for use in controllers
          req.fileInfo = fileInfo;
        }
        // Multiple files upload (array or fields)
        else if (req.files) {
          const filesInfo: any = {};

          // Handle array of files
          if (Array.isArray(req.files)) {
            const uploads = await Promise.all(
              req.files.map((file) => this.uploadToS3(file, fileType, options))
            );
            filesInfo[uploadField] = uploads;
          }
          // Handle fields with files
          else {
            for (const field in req.files) {
              const fieldFiles = req.files[field] as Express.Multer.File[];
              if (Array.isArray(fieldFiles)) {
                const uploads = await Promise.all(
                  fieldFiles.map((file) =>
                    this.uploadToS3(file, fileType, options)
                  )
                );
                filesInfo[field] = uploads;
              }
            }
          }

          // Add all files info to request
          req.filesInfo = filesInfo;
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Upload a file to S3
   *
   * @param file - File to upload
   * @param fileType - File type
   * @param options - Upload options
   * @returns File information
   */
  public static async uploadToS3(
    file: Express.Multer.File,
    fileType: FileType = FileType.DOCUMENT,
    options: Partial<FileUploadOptions> = {}
  ): Promise<FileInfo> {
    const mergedOptions = {
      ...DEFAULT_OPTIONS[fileType],
      ...options,
    };

    try {
      // Validate file type if not already done
      if (!(file as any).fileType) {
        this.validateFileType(file, fileType, mergedOptions.allowedMimeTypes);
      }

      // Generate a unique key
      const filename =
        mergedOptions.customFileName ||
        path.basename(file.path) ||
        generateUniqueFileName(file.originalname);

      const key = `${mergedOptions.directory}/${filename}`;

      // Generate checksum if enabled
      let checksum: string | undefined;
      if (mergedOptions.generateChecksum) {
        const fileContent = fs.readFileSync(file.path);
        checksum = crypto
          .createHash("sha256")
          .update(fileContent)
          .digest("hex");
      }

      // Read the file content
      const fileContent = fs.readFileSync(file.path);

      // Prepare metadata
      const metadata: Record<string, string> = {
        ...mergedOptions.metadata,
        originalname: encodeURIComponent(file.originalname),
        fileType,
        contentType: file.mimetype,
      };

      if (checksum) {
        metadata.checksum = checksum;
      }

      // Upload the file to S3
      const command = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: file.mimetype,
        ACL: mergedOptions.isPublic ? "public-read" : "private",
        Metadata: metadata,
      });

      const response = await s3Client.send(command);

      // Clean up the temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Create file info
      const fileUrl = mergedOptions.isPublic
        ? `https://${this.BUCKET_NAME}.s3.${appConfig.aws.s3.region}.amazonaws.com/${key}`
        : await this.generateSignedUrl(key);

      const fileInfo: FileInfo = {
        originalName: file.originalname,
        filename: path.basename(key),
        mimetype: file.mimetype,
        size: file.size,
        path: key,
        url: fileUrl,
        key,
        bucket: this.BUCKET_NAME,
        etag: response.ETag?.replace(/"/g, ""),
        fileType,
        checksum,
        metadata: mergedOptions.metadata,
      };

      logger.info("File uploaded to S3 successfully", {
        filename: fileInfo.filename,
        size: fileInfo.size,
        mimetype: fileInfo.mimetype,
        bucket: fileInfo.bucket,
      });

      return fileInfo;
    } catch (error) {
      logger.error("Error uploading file to S3:", error);

      // Clean up the temp file if it exists
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      throw error;
    }
  }

  /**
   * Validate file type and mime type
   */
  private static validateFileType(
    file: Express.Multer.File,
    fileType: FileType,
    allowedMimeTypes?: string[]
  ): void {
    if (!allowedMimeTypes) {
      allowedMimeTypes = DEFAULT_MIME_TYPES[fileType];
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type for ${fileType}. Allowed types: ${allowedMimeTypes.join(
          ", "
        )}`
      );
    }

    // Set the file type on the file object
    (file as any).fileType = fileType;
  }

  /**
   * Generate a signed URL for a file
   *
   * @param key - File key
   * @param expirationSeconds - URL expiration in seconds
   * @returns Signed URL
   */
  public static async generateSignedUrl(
    key: string,
    expirationSeconds: number = 900 // 15 minutes
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: expirationSeconds,
      });

      return signedUrl;
    } catch (error) {
      logger.error("Error generating signed URL:", error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   *
   * @param key - File key
   * @returns Whether the operation was successful
   */
  public static async deleteFromS3(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);

      logger.info("File deleted from S3 successfully", { key });

      return true;
    } catch (error) {
      logger.error("Error deleting file from S3:", error);
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   *
   * @param key - File key
   * @returns File metadata
   */
  public static async getFileMetadata(key: string): Promise<FileInfo | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);

      if (!response) {
        return null;
      }

      let originalName = key;
      let fileType = FileType.DOCUMENT;

      // Extract metadata
      if (response.Metadata) {
        if (response.Metadata.originalname) {
          originalName = decodeURIComponent(response.Metadata.originalname);
        }
        if (response.Metadata.filetype as FileType) {
          fileType = response.Metadata.filetype as FileType;
        }
      }

      // Determine if file should be public based on its type
      const isPublic = DEFAULT_OPTIONS[fileType].isPublic;

      const fileUrl = isPublic
        ? `https://${this.BUCKET_NAME}.s3.${appConfig.aws.s3.region}.amazonaws.com/${key}`
        : await this.generateSignedUrl(key);

      return {
        originalName,
        filename: path.basename(key),
        mimetype: response.ContentType || "application/octet-stream",
        size: response.ContentLength || 0,
        path: key,
        url: fileUrl,
        key,
        bucket: this.BUCKET_NAME,
        etag: response.ETag?.replace(/"/g, ""),
        lastModified: response.LastModified,
        fileType,
        checksum: response.Metadata?.checksum,
        metadata: response.Metadata,
      };
    } catch (error) {
      logger.error("Error getting file metadata from S3:", error);
      return null;
    }
  }

  /**
   * Copy a file in S3
   *
   * @param sourceKey - Source file key
   * @param targetKey - Target file key
   * @param makePublic - Whether to make the copied file public
   * @returns Target file info
   */
  public static async copyFile(
    sourceKey: string,
    targetKey: string,
    makePublic: boolean = false
  ): Promise<FileInfo | null> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.BUCKET_NAME,
        CopySource: `${this.BUCKET_NAME}/${sourceKey}`,
        Key: targetKey,
        ACL: makePublic ? "public-read" : "private",
        MetadataDirective: "COPY",
      });

      await s3Client.send(command);

      logger.info("File copied in S3 successfully", {
        sourceKey,
        targetKey,
      });

      return this.getFileMetadata(targetKey);
    } catch (error) {
      logger.error("Error copying file in S3:", error);
      throw error;
    }
  }
}

// Add file info to Express Request type
declare global {
  namespace Express {
    interface Request {
      fileInfo?: FileInfo;
      filesInfo?: Record<string, FileInfo[]>;
    }
  }
}

export default FileUploadUtil;
