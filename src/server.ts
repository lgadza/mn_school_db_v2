// Register module aliases
import "./register-aliases";

import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { appConfig } from "./config";
import logger from "./common/utils/logging/logger";

// Import middleware
import CorsMiddleware from "@/shared/middleware/cors";
import CompressionMiddleware from "@/shared/middleware/compression";
import configureHelmet from "@/shared/middleware/helmet";
import RateLimiter from "@/shared/middleware/rateLimiter";
import errorHandlerMiddleware from "@/shared/middleware/errorHandler";
import RequestLoggerMiddleware from "@/shared/middleware/requestLogger";
import DiagnosticsUtil from "@/common/utils/system/diagnosticsUtil";

// Import database and Redis clients
import db from "@/config/database";
import redis from "@/config/redis";

// Import API routers
import apiV1Router from "@/routes/v1";

// Initialize Express app
const app: Express = express();
const PORT = appConfig.port || 3000;

// -----------------------------------------------------------
// Middleware registration (order matters)
// -----------------------------------------------------------

// 1. Request ID generation and basic logging
app.use((req: Request, res: Response, next) => {
  req.headers["x-request-id"] = req.headers["x-request-id"] || uuidv4();
  next();
});

// 2. Security headers with Helmet
configureHelmet(app);

// 3. CORS configuration
CorsMiddleware.configure(app);

// 4. Compression for response size reduction
CompressionMiddleware.configure(app);

// 5. Request parsing
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cookieParser(
    appConfig.security.cookieSecret ||
      process.env.COOKIE_SECRET ||
      "mn-school-db-secret"
  )
);

// 6. Serving static files (if needed)
app.use(express.static(path.join(__dirname, "public")));

// 7. Morgan HTTP request logger for development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// 8. Request logging for all environments
app.use(RequestLoggerMiddleware.create());

// 9. Rate limiting protection
app.use(RateLimiter.createApiLimiter());
app.use(RateLimiter.createAuthLimiter("/api/auth/login"));

// 10. High load protection
app.use(errorHandlerMiddleware.highLoadProtection);

// -----------------------------------------------------------
// API Routes with Versioning
// -----------------------------------------------------------

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Minnesota School Database API",
    version: process.env.npm_package_version || "1.0.0",
    environment: appConfig.env,
    documentation: "/api/docs",
    availableVersions: {
      v1: "/api/v1",
      // future versions can be added here
    },
  });
});

// API version routes
app.use("/api/v1", apiV1Router);

// Catch-all route for undefined API versions
app.all("/api/:version/*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "API Version Not Found",
    message: `API version '${req.params.version}' does not exist or is not supported`,
    availableVersions: [
      "v1",
      // Add future versions here
    ],
  });
});

// System health endpoints (available across all versions)
app.get("/api/health", async (req: Request, res: Response) => {
  const healthCheck = await DiagnosticsUtil.performHealthCheck();
  const statusCode =
    healthCheck.status === "healthy"
      ? 200
      : healthCheck.status === "degraded"
      ? 200
      : 503;

  res.status(statusCode).json(healthCheck);
});

app.get("/api/metrics", (req: Request, res: Response) => {
  const metrics = DiagnosticsUtil.getSystemMetrics();
  res.json(metrics);
});

// -----------------------------------------------------------
// Error handling
// -----------------------------------------------------------

// 404 handler - should be after all routes
app.use(errorHandlerMiddleware.notFoundHandler);

// Global error handler - should be last
app.use(errorHandlerMiddleware.globalErrorHandler);

// -----------------------------------------------------------
// Server startup
// -----------------------------------------------------------

// Graceful shutdown function
const gracefulShutdown = async () => {
  logger.info("Shutting down server gracefully...");

  // Close database connection
  try {
    await db.disconnect();
    logger.info("Database connections closed");
  } catch (error) {
    logger.error("Error closing database connections:", error);
  }

  // Close Redis connection
  try {
    await redis.quit();
    logger.info("Redis connection closed");
  } catch (error) {
    logger.error("Error closing Redis connection:", error);
  }

  // Close server
  process.exit(0);
};

// Start the server
const startServer = async () => {
  try {
    // Check database connection
    logger.info("Checking database connection...");
    const dbHealth = await db.healthCheck();
    if (!dbHealth) {
      logger.warn("Database connection check failed, but continuing startup");
    }

    // Check Redis connection
    logger.info("Checking Redis connection...");
    try {
      await redis.ping();
      logger.info("Redis connection successful");
    } catch (error) {
      logger.warn(
        "Redis connection check failed, but continuing startup:",
        error
      );
    }

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running in ${appConfig.env} mode on port ${PORT}`);
      logger.info(
        `Health check available at http://localhost:${PORT}/api/health`
      );
      logger.info(`Metrics available at http://localhost:${PORT}/api/metrics`);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION:", error);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UNHANDLED REJECTION:", { reason, promise });
  gracefulShutdown();
});

// Start the server
startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});

export default app;
