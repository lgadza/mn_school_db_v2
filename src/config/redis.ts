import logger from "@/common/utils/logging/logger";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_PUBLIC_URL || process.env.REDIS_URL;

if (!REDIS_URL) {
  logger.error("Redis URL is not configured");
  process.exit(1);
}

logger.info("Connecting to Redis:", REDIS_URL.replace(/\/\/.*@/, "//*****@"));

const redis = new Redis(REDIS_URL, {
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
});

// Handle connection events
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

export default redis;
