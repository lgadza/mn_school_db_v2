import multer from "multer";
import path from "path";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import logger from "@/common/utils/logging/logger";

// Import FileType as a type only
import type { FileType } from "@/common/utils/file/fileUploadUtil";

// Ensure temp upload directory exists
const TEMP_UPLOAD_DIR = path.join(process.cwd(), "temp", "uploads");
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
  logger.info(`Created temp upload directory: ${TEMP_UPLOAD_DIR}`);
}

// Define file types and mime types
export const MIME_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],
  AUDIO: ["audio/mpeg", "audio/wav", "audio/ogg"],
  VIDEO: ["video/mp4", "video/webm", "video/ogg"],
};

// File filter function for multer
export const fileFilter = (allowedTypes: string[] = []) => {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) => {
    if (allowedTypes.length === 0 || allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `Invalid file type. Only ${allowedTypes.join(", ")} are allowed.`
        )
      );
    }
  };
};

// Get allowed mime types based on file type - modify to accept string
export const getAllowedMimeTypes = (fileType: string): string[] => {
  switch (fileType) {
    case "IMAGE":
      return MIME_TYPES.IMAGE;
    case "DOCUMENT":
      return MIME_TYPES.DOCUMENT;
    case "AUDIO":
      return MIME_TYPES.AUDIO;
    case "VIDEO":
      return MIME_TYPES.VIDEO;
    default:
      return [
        ...MIME_TYPES.IMAGE,
        ...MIME_TYPES.DOCUMENT,
        ...MIME_TYPES.AUDIO,
        ...MIME_TYPES.VIDEO,
      ];
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

// Create multer instance with configuration
export const createMulterUpload = (
  fileType: string,
  maxFileSize: number = 5 * 1024 * 1024 // 5MB default
) => {
  const allowedMimeTypes = getAllowedMimeTypes(fileType);

  return multer({
    storage,
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: fileFilter(allowedMimeTypes),
  });
};

export default {
  createMulterUpload,
  fileFilter,
  getAllowedMimeTypes,
  MIME_TYPES,
};
