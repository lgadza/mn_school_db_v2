import { Request, Response, NextFunction } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { appConfig } from "@/config";
import logger from "@/common/utils/logging/logger";
import { FileError, BadRequestError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import multerMiddleware from "@/shared/middleware/multer";

// Change from type to enum
export enum FileType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  ANY = "ANY",
}

// File upload options interface
export interface FileUploadOptions {
  directory?: string;
  isPublic?: boolean;
  allowedTypes?: string[];
  maxSize?: number;
  metadata?: Record<string, string>;
}

// File info interface
export interface FileInfo {
  key: string;
  url: string;
  bucket: string;
  contentType: string;
  size: number;
}

/**
 * File Upload Utility
 * Provides standardized methods for file uploads
 */
export class FileUploadUtil {
  private static s3Client: S3Client;
  private static initialized = false;
  private static defaultBucket: string;
  private static region: string;
  private static baseUrl: string;

  /**
   * Initialize the S3 client
   */
  public static initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      this.s3Client = new S3Client({
        region: appConfig.aws.s3.region,
        credentials: {
          accessKeyId: appConfig.aws.s3.accessKeyId,
          secretAccessKey: appConfig.aws.s3.secretAccessKey,
        },
      });

      this.defaultBucket = appConfig.aws.s3.bucketName;
      this.region = appConfig.aws.s3.region;
      this.baseUrl =
        appConfig.aws.s3.endpoint ||
        `https://${this.defaultBucket}.s3.${this.region}.amazonaws.com`;
      this.initialized = true;

      logger.info("S3 client initialized");
    } catch (error) {
      logger.error("Failed to initialize S3 client:", error);
      throw error;
    }
  }

  /**
   * Upload a file to S3
   *
   * @param file - File object
   * @param fileType - Type of file
   * @param options - Upload options
   * @returns File info
   */
  public static async uploadToS3(
    file: Express.Multer.File,
    fileType: FileType,
    options: FileUploadOptions = {}
  ): Promise<FileInfo> {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      // Validate file exists
      if (!file) {
        throw new BadRequestError("No file provided");
      }

      // Validate file type
      const allowedMimeTypes =
        options.allowedTypes || multerMiddleware.getAllowedMimeTypes(fileType);
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new FileError(
          `Invalid file type. Only ${allowedMimeTypes.join(", ")} are allowed.`,
          ErrorCode.FILE_TYPE_NOT_ALLOWED
        );
      }

      // Validate file size
      const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
      if (file.size > maxSize) {
        throw new FileError(
          `File size exceeds limit. Maximum size is ${
            maxSize / 1024 / 1024
          }MB.`,
          ErrorCode.FILE_SIZE_EXCEEDED
        );
      }

      // Generate a unique key
      const uniqueId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uniqueId}${fileExtension}`;
      const directory = options.directory || "uploads";
      const key = `${directory}/${fileName}`;

      // Read file content
      const fileContent = fs.readFileSync(file.path);

      // Set ACL based on isPublic option
      const acl = options.isPublic ? "public-read" : "private";

      // Set up metadata
      const metadata = {
        ...options.metadata,
        originalname: file.originalname,
      };

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.defaultBucket,
        Key: key,
        Body: fileContent,
        ContentType: file.mimetype,
        ACL: acl,
        Metadata: metadata,
      });

      await this.s3Client.send(command);

      // Construct URL
      const url = `${this.baseUrl}/${key}`;

      // Clean up temp file
      fs.unlinkSync(file.path);

      logger.info(`File uploaded to S3: ${key}`);

      return {
        key,
        url,
        bucket: this.defaultBucket,
        contentType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      // Clean up temp file if it exists
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (error instanceof FileError || error instanceof BadRequestError) {
        throw error;
      }

      logger.error("Failed to upload file to S3:", error);
      throw new FileError("Failed to upload file");
    }
  }

  /**
   * Express middleware for uploading files to S3
   *
   * @param fieldName - Form field name
   * @param fileType - Type of file
   * @param options - Upload options
   * @returns Express middleware
   */
  public static uploadToS3Middleware(
    fieldName: string,
    fileType: FileType,
    options: FileUploadOptions = {}
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const file = req.file;
        if (!file) {
          return next(); // No file to upload, continue
        }

        const fileInfo = await this.uploadToS3(file, fileType, options);

        // Add upload info to request object
        (req as any).uploadedFile = fileInfo;

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export default FileUploadUtil;
