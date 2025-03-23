import logger from "@/common/utils/logging/logger";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_PUBLIC_URL || process.env.REDIS_URL;

// Only exit if not in test environment
if (!REDIS_URL && process.env.NODE_ENV !== "test") {
  logger.error("Redis URL is not configured");
  process.exit(1);
} else if (!REDIS_URL) {
  logger.warn(
    "Redis URL is not configured, using mock implementation for testing"
  );
}

// If in test environment and no Redis URL, initialize a mock or in-memory version
const redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        logger.info(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    })
  : process.env.NODE_ENV === "test"
  ? createMockRedisClient()
  : null;

// Mock Redis client for testing
function createMockRedisClient() {
  const store = new Map();
  interface MockRedisClient {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    get: (key: string) => Promise<string | null>;
    set: (
      key: string,
      value: string,
      options?: Record<string, unknown>
    ) => Promise<string>;
    del: (key: string) => Promise<number>;
  }

  function createMockRedisClient(): MockRedisClient {
    const store = new Map<string, string>();

    return {
      connect: async () => Promise.resolve(),
      disconnect: async () => Promise.resolve(),
      get: async (key: string) => store.get(key) || null,
      set: async (
        key: string,
        value: string,
        options?: Record<string, unknown>
      ) => {
        store.set(key, value);
        return "OK";
      },
      del: async (key: string) => {
        return store.delete(key) ? 1 : 0;
      },
      // Add other Redis methods as needed
    };
  }
}

// Handle connection events
if (redis instanceof Redis) {
  redis.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  redis.on("ready", () => {
    logger.info("Redis client is ready");
  });

  redis.on("error", (error) => {
    logger.error("Redis connection error:", error.message);
  });

  redis.on("close", () => {
    logger.warn("Redis connection closed");
  });

  // Verify connection on startup
  const verifyConnection = async () => {
    try {
      await redis.ping();
      logger.info("Redis ping successful");
    } catch (error) {
      logger.error("Redis ping failed:", error);
      process.exit(1);
    }
  };

  verifyConnection();

  process.on("SIGTERM", async () => {
    await redis.quit();
  });
}

export default redis;
