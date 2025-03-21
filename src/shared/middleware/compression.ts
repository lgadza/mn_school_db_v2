import compression from "compression";
import { Express, Request, Response } from "express";
import logger from "@/common/utils/logging/logger";

/**
 * Compression options interface
 */
interface CompressionOptions {
  level: number;
  threshold: number;
  filter: (req: Request, res: Response) => boolean;
}

/**
 * Compression Middleware
 * Provides response compression for improved performance
 */
export class CompressionMiddleware {
  /**
   * Default compression options
   */
  private static readonly DEFAULT_OPTIONS: CompressionOptions = {
    level: 6, // Compression level (0-9, where 9 is highest but slowest)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req: Request, res: Response) => {
      // Don't compress if client doesn't accept it
      if (req.headers["x-no-compression"]) {
        return false;
      }

      // Use compression filter from the compression middleware
      return compression.filter(req, res);
    },
  };

  /**
   * Configure compression middleware for the Express application
   *
   * @param app - Express application
   * @param options - Compression configuration options
   */
  public static configure(
    app: Express,
    options?: Partial<CompressionOptions>
  ): void {
    const compressionOptions = { ...this.DEFAULT_OPTIONS, ...options };

    logger.info("Configuring compression middleware", {
      level: compressionOptions.level,
      threshold: compressionOptions.threshold,
    });

    // Apply compression middleware
    app.use(
      compression({
        level: compressionOptions.level,
        threshold: compressionOptions.threshold,
        filter: compressionOptions.filter,
      })
    );
  }
}

export default CompressionMiddleware;
