import { Request, Response, NextFunction } from "express";
import {
  RateLimiterRedis,
  RateLimiterMemory,
  RateLimiterRes,
} from "rate-limiter-flexible";
import redis from "@/config/redis";
import logger from "@/common/utils/logging/logger";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";

/**
 * Rate limiting options interface
 */
interface RateLimitOptions {
  points: number; // Maximum number of points (requests)
  duration: number; // Per duration in seconds
  blockDuration?: number; // Block duration in seconds after exceeding points
  keyPrefix?: string; // Redis key prefix
}

/**
 * Enterprise-grade Rate Limiter
 * Provides protection against brute force attacks and prevents API abuse
 * Supports both Redis-backed and memory-based rate limiting
 */
export class RateLimiter {
  private static redisLimiter: RateLimiterRedis | null = null;
  private static memoryLimiter: RateLimiterMemory | null = null;
  private static isRedisAvailable = true;

  /**
   * Initialize rate limiters
   * Creates both Redis and memory limiters, falls back to memory if Redis fails
   *
   * @param options - Rate limiting options
   */
  private static initialize(options: RateLimitOptions) {
    const {
      points,
      duration,
      blockDuration = 0,
      keyPrefix = "rlflx",
    } = options;

    try {
      // Set up Redis rate limiter
      this.redisLimiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points,
        duration,
        blockDuration,
      });

      // Also set up memory limiter as fallback
      this.memoryLimiter = new RateLimiterMemory({
        keyPrefix,
        points,
        duration,
        blockDuration,
      });

      this.isRedisAvailable = true;
      logger.info("Redis rate limiter initialized");
    } catch (error) {
      // If Redis fails, fall back to memory limiter
      logger.warn("Redis rate limiter failed, using memory limiter:", error);
      this.isRedisAvailable = false;

      if (!this.memoryLimiter) {
        this.memoryLimiter = new RateLimiterMemory({
          keyPrefix,
          points,
          duration,
          blockDuration,
        });
      }
    }
  }

  /**
   * Create API rate limiting middleware
   * Limits requests based on IP address
   *
   * @param options - Rate limiting options
   * @returns Express middleware function
   */
  public static createApiLimiter(
    options: RateLimitOptions = {
      points: 60, // 60 requests
      duration: 60, // per 1 minute
      blockDuration: 60 * 5, // 5 minutes block after exceeding
      keyPrefix: "rl:api",
    }
  ) {
    this.initialize(options);

    return async (req: Request, res: Response, next: NextFunction) => {
      // Get client IP
      const clientIp = this.getClientIp(req);

      try {
        // Attempt to consume a point from the rate limiter
        const limiterRes = await this.consumePoint(`${clientIp}`);

        // Set rate limit headers
        this.setRateLimitHeaders(res, limiterRes);

        next();
      } catch (error) {
        if (error instanceof RateLimiterRes) {
          // Rate limit exceeded
          const retryAfterSeconds = Math.ceil(error.msBeforeNext / 1000);

          // Set retry header
          res.setHeader("Retry-After", String(retryAfterSeconds));

          this.setRateLimitHeaders(res, error);

          return ResponseUtil.sendError(
            res,
            "Too many requests. Please try again later.",
            HttpStatus.TOO_MANY_REQUESTS,
            { retryAfter: retryAfterSeconds }
          );
        }

        // If an unexpected error occurs, log it and continue
        logger.error("Rate limiting error:", error);
        next();
      }
    };
  }

  /**
   * Create authentication rate limiting middleware
   * Stricter limits for authentication attempts
   *
   * @param loginRoute - Route path for login
   * @returns Express middleware function
   */
  public static createAuthLimiter(loginRoute: string = "/api/auth/login") {
    // Stricter limits for auth routes
    const authOptions: RateLimitOptions = {
      points: 5, // 5 attempts
      duration: 60 * 15, // per 15 minutes
      blockDuration: 60 * 60, // 1 hour block after exceeding
      keyPrefix: "rl:auth",
    };

    this.initialize(authOptions);

    return async (req: Request, res: Response, next: NextFunction) => {
      // Only apply to specific authentication routes
      if (req.path === loginRoute && req.method === "POST") {
        const key = `${this.getClientIp(req)}:${req.body.email || "unknown"}`;

        try {
          const limiterRes = await this.consumePoint(key);
          this.setRateLimitHeaders(res, limiterRes);
          next();
        } catch (error) {
          if (error instanceof RateLimiterRes) {
            const retryAfterSeconds = Math.ceil(error.msBeforeNext / 1000);
            res.setHeader("Retry-After", String(retryAfterSeconds));
            this.setRateLimitHeaders(res, error);

            return ResponseUtil.sendError(
              res,
              "Too many login attempts. Please try again later.",
              HttpStatus.TOO_MANY_REQUESTS,
              { retryAfter: retryAfterSeconds }
            );
          }

          logger.error("Auth rate limiting error:", error);
          next();
        }
      } else {
        next();
      }
    };
  }

  /**
   * Create user-specific rate limiting middleware
   * Limits requests based on authenticated user ID
   *
   * @param options - Rate limiting options
   * @returns Express middleware function
   */
  public static createUserLimiter(
    options: RateLimitOptions = {
      points: 100, // 100 requests
      duration: 60, // per 1 minute
      blockDuration: 0, // No block after exceeding
      keyPrefix: "rl:user",
    }
  ) {
    this.initialize(options);

    return async (req: Request, res: Response, next: NextFunction) => {
      // Get user ID from request (added by auth middleware)
      const userId = req.user?.userId || "anonymous";

      // Use both user ID and IP as the key to prevent abuse from multiple IPs
      const key = `${userId}:${this.getClientIp(req)}`;

      try {
        const limiterRes = await this.consumePoint(key);
        this.setRateLimitHeaders(res, limiterRes);
        next();
      } catch (error) {
        if (error instanceof RateLimiterRes) {
          const retryAfterSeconds = Math.ceil(error.msBeforeNext / 1000);
          res.setHeader("Retry-After", String(retryAfterSeconds));
          this.setRateLimitHeaders(res, error);

          return ResponseUtil.sendError(
            res,
            "Rate limit exceeded. Please try again later.",
            HttpStatus.TOO_MANY_REQUESTS,
            { retryAfter: retryAfterSeconds }
          );
        }

        logger.error("User rate limiting error:", error);
        next();
      }
    };
  }

  /**
   * Consume a point from the appropriate rate limiter
   *
   * @param key - Rate limiting key
   * @returns Rate limiter result
   */
  private static async consumePoint(key: string): Promise<RateLimiterRes> {
    if (this.isRedisAvailable && this.redisLimiter) {
      try {
        return await this.redisLimiter.consume(key);
      } catch (error) {
        // If Redis fails, fall back to memory limiter
        logger.warn(
          "Redis rate limiter failed, falling back to memory:",
          error
        );
        this.isRedisAvailable = false;

        if (this.memoryLimiter) {
          return await this.memoryLimiter.consume(key);
        }
        throw error;
      }
    } else if (this.memoryLimiter) {
      return await this.memoryLimiter.consume(key);
    }

    throw new Error("No rate limiter available");
  }

  /**
   * Get client IP address from request
   *
   * @param req - Express request
   * @returns Client IP address
   */
  private static getClientIp(req: Request): string {
    // Get IP from X-Forwarded-For header if behind proxy
    const forwardedFor = req.headers["x-forwarded-for"];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(",")[0].trim();
      return ips;
    }

    return req.ip || "127.0.0.1";
  }

  /**
   * Set rate limit headers in the response
   *
   * @param res - Express response
   * @param limiterRes - Rate limiter result
   */
  private static setRateLimitHeaders(
    res: Response,
    limiterRes: RateLimiterRes
  ): void {
    res.setHeader("X-RateLimit-Limit", (limiterRes.remainingPoints + limiterRes.consumedPoints).toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      limiterRes.remainingPoints.toString()
    );
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(Date.now() + limiterRes.msBeforeNext).toString()
    );
  }
}

export default RateLimiter;
