import multer from "multer";
import { Request } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { appConfig } from "@/config";
import logger from "@/common/utils/logging/logger";
import {
  FileType,
  DEFAULT_MIME_TYPES,
} from "@/common/utils/file/fileUploadUtil";

// Create temp directory for file uploads if it doesn't exist
const tempDir = path.join(appConfig.rootDir, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFileName(file.originalname);
    cb(null, uniqueFilename);
  },
});

// File size limits by type (in bytes)
const SIZE_LIMITS = {
  [FileType.IMAGE]: 5 * 1024 * 1024, // 5MB
  [FileType.DOCUMENT]: 10 * 1024 * 1024, // 10MB
  [FileType.VIDEO]: 100 * 1024 * 1024, // 100MB
  [FileType.AUDIO]: 30 * 1024 * 1024, // 30MB
};

// Filter function to check file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Determine file type based on mimetype
  const fileType = getFileTypeFromMimetype(file.mimetype);

  if (!fileType) {
    return cb(
      new Error(
        `Invalid file type (${file.mimetype}). Allowed types are images, videos, audio, and documents.`
      )
    );
  }

  // Add file type to the file object for later use
  (file as any).fileType = fileType;

  // Get allowed mime types for this file type
  const allowedMimes = DEFAULT_MIME_TYPES[fileType];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid ${fileType} format. Allowed formats: ${allowedMimes.join(
          ", "
        )}`
      )
    );
  }
};

/**
 * Get file type from mimetype
 */
export const getFileTypeFromMimetype = (mimetype: string): FileType | null => {
  if (mimetype.startsWith("image/")) return FileType.IMAGE;
  if (mimetype.startsWith("video/")) return FileType.VIDEO;
  if (mimetype.startsWith("audio/")) return FileType.AUDIO;
  if (mimetype.startsWith("application/") || mimetype.startsWith("text/"))
    return FileType.DOCUMENT;

  return null;
};

/**
 * Generate a unique file name using UUID
 */
export const generateUniqueFileName = (originalName: string): string => {
  const fileExtension = path.extname(originalName).toLowerCase();
  return `${uuidv4()}${fileExtension}`;
};

/**
 * Create multer instance with specified limits
 */
export const createMulterUpload = (options: {
  fileType?: FileType;
  maxFiles?: number;
  maxSize?: number;
}) => {
  const fileType = options.fileType || FileType.DOCUMENT;
  const maxSize = options.maxSize || SIZE_LIMITS[fileType];

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: options.maxFiles || 10,
    },
  });
};

// Default multer instance
const upload = createMulterUpload({ maxSize: 50 * 1024 * 1024 }); // 50MB default

// Export type-specific upload middleware
export const imageUpload = createMulterUpload({ fileType: FileType.IMAGE });
export const documentUpload = createMulterUpload({
  fileType: FileType.DOCUMENT,
});
export const videoUpload = createMulterUpload({ fileType: FileType.VIDEO });
export const audioUpload = createMulterUpload({ fileType: FileType.AUDIO });

export default upload;
