import NodeCache from "node-cache";
import logger from "@/common/utils/logging/logger";

/**
 * Cache Utility
 * Provides a simple caching mechanism for performance optimization
 */
class CacheUtil {
  private cache: NodeCache;

  constructor() {
    // Create a new cache instance with checkperiod of 120 seconds
    // This will check for expired keys every 2 minutes
    this.cache = new NodeCache({ checkperiod: 120 });

    logger.info("Cache utility initialized");
  }

  /**
   * Set a value in the cache
   *
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - Time to live in seconds
   * @returns Success status
   */
  public async set(
    key: string,
    value: string,
    ttl: number = 3600
  ): Promise<boolean> {
    try {
      return this.cache.set(key, value, ttl);
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a value from the cache
   *
   * @param key - Cache key
   * @returns The cached value or undefined if not found
   */
  public async get(key: string): Promise<string | undefined> {
    try {
      return this.cache.get<string>(key);
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Delete a value from the cache
   *
   * @param key - Cache key
   * @returns Number of deleted entries
   */
  public async del(key: string): Promise<number> {
    try {
      return this.cache.del(key);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists in the cache
   *
   * @param key - Cache key
   * @returns Whether the key exists
   */
  public async has(key: string): Promise<boolean> {
    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  public async flush(): Promise<void> {
    try {
      this.cache.flushAll();
      logger.info("Cache flushed");
    } catch (error) {
      logger.error("Error flushing cache:", error);
    }
  }

  /**
   * Get cache stats
   *
   * @returns Cache statistics
   */
  public getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}

// Export a singleton instance
export default new CacheUtil();
