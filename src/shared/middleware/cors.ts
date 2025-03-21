import cors from "cors";
import { Express, Request, Response } from "express";
import { appConfig } from "@/config";
import logger from "@/common/utils/logging/logger";

/**
 * CORS options interface
 */
interface CorsOptions {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

/**
 * CORS Configuration Middleware
 * Provides enterprise-grade CORS protection and configuration
 */
export class CorsMiddleware {
  /**
   * Default CORS options
   */
  private static readonly DEFAULT_OPTIONS: CorsOptions = {
    allowedOrigins: appConfig.cors?.allowedOrigins || ["http://localhost:3000"],
    allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Request-ID",
    ],
    exposedHeaders: [
      "X-Request-ID",
      "X-Response-Time",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
    maxAge: 86400, // 24 hours in seconds
    credentials: true,
  };

  /**
   * Configure CORS middleware for the Express application
   *
   * @param app - Express application
   * @param options - CORS configuration options
   */
  public static configure(app: Express, options?: Partial<CorsOptions>): void {
    const corsOptions = { ...this.DEFAULT_OPTIONS, ...options };

    logger.info("Configuring CORS middleware", {
      origins:
        corsOptions.allowedOrigins.length > 5
          ? `${corsOptions.allowedOrigins.slice(0, 5).join(", ")}... (${
              corsOptions.allowedOrigins.length
            } total)`
          : corsOptions.allowedOrigins.join(", "),
    });

    // Configure the CORS middleware
    app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps, curl requests)
          if (!origin) return callback(null, true);

          // Check if the origin is allowed
          if (
            corsOptions.allowedOrigins.includes("*") ||
            corsOptions.allowedOrigins.includes(origin)
          ) {
            return callback(null, true);
          }

          // Log blocked origins in non-production environments
          if (process.env.NODE_ENV !== "production") {
            logger.warn(`CORS blocked request from origin: ${origin}`);
          }

          callback(new Error("CORS policy: Origin not allowed"), false);
        },
        methods: corsOptions.allowedMethods,
        allowedHeaders: corsOptions.allowedHeaders,
        exposedHeaders: corsOptions.exposedHeaders,
        maxAge: corsOptions.maxAge,
        credentials: corsOptions.credentials,
      })
    );

    // Handle CORS preflight requests
    app.options("*", cors(corsOptions));

    // Add diagnostic endpoint for CORS testing
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      app.get("/api/cors-test", (req: Request, res: Response) => {
        res.json({
          message: "CORS is working correctly",
          origin: req.headers.origin || "No origin",
          headers: req.headers,
        });
      });
    }
  }
}

export default CorsMiddleware;
