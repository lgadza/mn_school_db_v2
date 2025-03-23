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
import swaggerUi from "swagger-ui-express";
import listEndpoints from "express-list-endpoints";
import Table from "cli-table3";
import chalk from "chalk";

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
import { QueryTypes } from "sequelize";
import redis from "@/config/redis";

// Import API routers
import apiV1Router from "@/routes/v1";

// Import the setupAssociations function
import setupAssociations, { syncModelsInOrder } from "@/features/associations";
import swaggerDocs from "./common/utils/docs/swagger";
import { runSeeders } from "./seeders";

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

// Update Swagger UI setup
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
    // Initialize database connection first with retry logic
    logger.info("Checking database connection...");
    let dbConnected = false;
    let retries = 0;
    const maxRetries = 5;

    while (!dbConnected && retries < maxRetries) {
      try {
        const dbHealth = await db.healthCheck();
        if (dbHealth) {
          dbConnected = true;
          logger.info("Database connection successful");
        } else {
          retries++;
          logger.warn(
            `Database connection attempt ${retries}/${maxRetries} failed. Retrying in 3 seconds...`
          );
          // Wait 3 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        retries++;
        logger.error(
          `Database connection attempt ${retries}/${maxRetries} failed with error:`,
          error
        );
        if (retries >= maxRetries) {
          throw new Error(
            "Failed to connect to database after multiple attempts"
          );
        }
        // Wait 3 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    if (!dbConnected) {
      throw new Error("Database connection check failed after maximum retries");
    }

    // Now that database is initialized, set up model associations
    logger.info("Setting up model associations...");
    setupAssociations();

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

    // Sync database more deliberately with error handling
    logger.info("Syncing database models...");
    try {
      // First set up associations so foreign keys are properly defined
      logger.info("Setting up model associations before sync...");
      setupAssociations();

      // Instead of using db.sync which syncs all models at once,
      // use our custom function to sync models in order
      await syncModelsInOrder({ force: false, alter: true });
      logger.info("Database synced successfully");

      // Verify tables exist before seeding
      logger.info("Verifying database tables before seeding...");
      const tableCheck = await db.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        { type: QueryTypes.SELECT }
      );

      const tables = tableCheck.map((t: any) => t.table_name);
      logger.info(`Found database tables: ${tables.join(", ")}`);

      if (tables.length === 0) {
        logger.error(
          "No tables were created during sync. This indicates a database configuration issue."
        );
      } else {
        // Run seeders if tables exist
        logger.info("Running seeders...");
        await runSeeders();
        logger.info("Seeding completed successfully");
      }

      // Start the server
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    } catch (error) {
      logger.error("Failed to sync database:", error);

      // Log more detailed error information
      if (error instanceof Error) {
        logger.error(`Error details: ${error.message}`);
        logger.error(`Error stack: ${error.stack}`);
      }

      // Try to get database connection info for debugging
      try {
        const connectionInfo = await db.sequelize.query(
          "SELECT current_database(), current_user",
          {
            type: QueryTypes.SELECT,
            plain: true,
          }
        );
        logger.info("Database connection info:", connectionInfo);
      } catch (err) {
        logger.error("Could not get database connection info:", err);
      }

      // Exit with error
      process.exit(1);
    }

    // Log all registered endpoints using proper table formatting
    try {
      const endpoints = listEndpoints(app);
      const totalRoutes = endpoints.reduce(
        (count, route) => count + route.methods.length,
        0
      );

      // Define the table with column headers
      const table = new Table({
        head: [
          chalk.bold("METHOD"),
          chalk.bold("PATH"),
          chalk.bold("MIDDLEWARE"),
        ],
        colWidths: [15, 50, 50],
        style: {
          head: ["cyan"],
          border: ["gray"],
        },
      });

      // Add rows to the table
      endpoints.forEach((route) => {
        const path = route.path;
        const middleware = route.middlewares.join(", ") || "none";

        route.methods.forEach((method) => {
          // Color the method based on type
          let coloredMethod;
          switch (method) {
            case "GET":
              coloredMethod = chalk.green(method);
              break;
            case "POST":
              coloredMethod = chalk.yellow(method);
              break;
            case "PUT":
              coloredMethod = chalk.blue(method);
              break;
            case "DELETE":
              coloredMethod = chalk.red(method);
              break;
            default:
              coloredMethod = chalk.gray(method);
          }

          table.push([coloredMethod, path, middleware]);
        });
      });

      // Log the table with a header
      logger.info(`API Routes (${totalRoutes} total routes):`);
      console.log(table.toString());
    } catch (error) {
      logger.error("Failed to generate endpoints table", { error });
    }
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
