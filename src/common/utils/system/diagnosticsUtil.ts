import { performance } from "perf_hooks";
import os from "os";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "@/common/utils/logging/logger";
import db from "@/config/database";
import redis from "@/config/redis";
import { appConfig } from "@/config";
import DBConnectUtil from "@/common/utils/db/dbConnect";

/**
 * System metrics interface
 */
export interface SystemMetrics {
  timestamp: string;
  memory: {
    total: number;
    free: number;
    used: number;
    percentUsed: number;
  };
  cpu: {
    cores: number;
    loadAvg: number[];
    model: string;
  };
  uptime: {
    system: number;
    process: number;
  };
  network: {
    hostname: string;
    interfaces: {
      [key: string]: os.NetworkInterfaceInfo[];
    };
  };
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  components: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
    redis: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
    system: {
      cpuLoad: number;
      memoryUsedPercent: number;
    };
  };
  checks: Record<string, any>;
  uptime: number;
  responseTime: number;
}

/**
 * Request timing middleware interface
 */
export interface RequestTimingInfo {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  userAgent?: string;
  timestamp: string;
}

/**
 * System Diagnostics Utility
 * Provides methods for system health checks and performance monitoring
 */
export class DiagnosticsUtil {
  /**
   * Get system metrics
   *
   * @returns System metrics
   */
  public static getSystemMetrics(): SystemMetrics {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const percentUsed = (usedMemory / totalMemory) * 100;

    return {
      timestamp: new Date().toISOString(),
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        percentUsed,
      },
      cpu: {
        cores: os.cpus().length,
        loadAvg: os.loadavg(),
        model: os.cpus()[0]?.model || "Unknown",
      },
      uptime: {
        system: os.uptime(),
        process: process.uptime(),
      },
      network: {
        hostname: os.hostname(),
        interfaces: Object.fromEntries(
          Object.entries(os.networkInterfaces() || {}).filter(
            ([_, value]) => value !== undefined
          ) as [string, os.NetworkInterfaceInfo[]][]
        ),
      },
    };
  }

  /**
   * Perform a comprehensive health check
   *
   * @returns Health check result
   */
  public static async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    const checks: Record<string, any> = {};
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

    // Check database
    try {
      checks.database = await DBConnectUtil.checkHealth();
      if (!checks.database.isHealthy) {
        overallStatus = "degraded";
      }
    } catch (error) {
      logger.error("Database health check failed:", error);
      checks.database = { isHealthy: false, error: (error as Error).message };
      overallStatus = "unhealthy";
    }

    // Add more health checks here...

    const endTime = performance.now();

    return {
      status: overallStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime: endTime - startTime,
      checks,
      version: "v1",
      environment: appConfig.env || "unknown",
      components: {
        database: {
          status: checks.database.isHealthy ? "up" : "down",
          latencyMs: checks.database.latencyMs,
          error: checks.database.error,
        },
        redis: {
          status: redis.status === "ready" ? "up" : "down", // Check Redis connection status
        },
        system: {
          cpuLoad: os.loadavg()[0],
          memoryUsedPercent:
            ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        },
      },
    };
  }

  /**
   * Express middleware for request timing
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Express NextFunction
   */
  public static requestTimingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Generate a unique ID for this request
    const requestId = uuidv4();
    req.headers["x-request-id"] = requestId;

    // Record the start time
    const startTime = performance.now();

    // Capture the original end method
    const originalEnd = res.end;

    // Override the end method to calculate and log the response time
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
      // Calculate the response time
      const endTime = performance.now();
      const responseTimeMs = endTime - startTime;

      // Create timing info
      const info: RequestTimingInfo = {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      };

      // Log request timing
      const logLevel = res.statusCode >= 400 ? "warn" : "info";
      logger[logLevel](
        `${req.method} ${req.originalUrl} ${
          res.statusCode
        } ${responseTimeMs.toFixed(2)}ms`,
        info
      );

      // Add timing header
      res.setHeader("X-Response-Time", `${responseTimeMs.toFixed(2)}ms`);
      res.setHeader("X-Request-ID", requestId);

      // Call the original end method
      return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
  }

  /**
   * Check if the system is under high load
   *
   * @returns Whether the system is under high load
   */
  public static isSystemUnderHighLoad(): boolean {
    const loadAvg = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const memoryUsedPercent =
      ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;

    // System is considered under high load if:
    // 1. Load average per CPU core is > 0.7 (70% load)
    // 2. Memory usage is > 85%
    return loadAvg / cpuCount > 0.7 || memoryUsedPercent > 85;
  }
}

export default DiagnosticsUtil;
