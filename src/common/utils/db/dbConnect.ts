import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import logger from "@/common/utils/logging/logger";
import { db } from "@/config";
import { performance } from "perf_hooks";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface for query execution metrics
 */
interface QueryMetrics {
  queryId: string;
  sql: string;
  params?: any[];
  executionTimeMs: number;
  timestamp: string;
  rowCount?: number;
  retryCount?: number;
}

/**
 * Database Connection Utility
 * Provides standardized methods for database operations with instrumentation and monitoring
 */
export class DBConnectUtil {
  private static readonly SLOW_QUERY_THRESHOLD_MS = 500;
  private static readonly DEFAULT_QUERY_TIMEOUT_MS = 30000; // 30 seconds
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY_MS = 1000; // 1 second

  /**
   * Execute a query with metrics, error handling, timeouts, and retry logic
   *
   * @param sql - SQL query string
   * @param params - Query parameters
   * @param options - Query execution options
   * @returns Query result
   */
  public static async executeQuery<T extends QueryResultRow = any>(
    sql: string,
    params?: any[],
    options: {
      timeout?: number;
      retryOnConnectionError?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<QueryResult<T>> {
    const queryId = uuidv4();
    const startTime = performance.now();
    let client: PoolClient | null = null;
    let retryCount = 0;
    const maxRetries = options.maxRetries ?? this.MAX_RETRY_ATTEMPTS;
    const timeout = options.timeout ?? this.DEFAULT_QUERY_TIMEOUT_MS;
    const retryOnConnectionError = options.retryOnConnectionError ?? true;

    // Setup query timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    const attemptQuery = async (): Promise<QueryResult<T>> => {
      try {
        // Log query execution (sanitized in production)
        if (process.env.NODE_ENV !== "production") {
          logger.debug(`[DB:${queryId}] Executing query:`, {
            sql,
            params,
            retryAttempt: retryCount > 0 ? retryCount : undefined,
            timeout,
          });
        } else {
          logger.debug(
            `[DB:${queryId}] Executing query${
              retryCount > 0 ? ` (retry ${retryCount})` : ""
            }`
          );
        }

        client = await db.getConnection();

        // Execute query with timeout signal
        const result = await Promise.race([
          client?.query<T>(sql, params) ??
            Promise.reject(new Error("Database client is null")),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener("abort", () => {
              reject(new Error(`Query timeout after ${timeout}ms`));
            });
          }),
        ]);

        // Calculate and log metrics
        const endTime = performance.now();
        const executionTimeMs = endTime - startTime;

        const metrics: QueryMetrics = {
          queryId,
          sql: process.env.NODE_ENV === "production" ? "[REDACTED]" : sql,
          params: process.env.NODE_ENV === "production" ? undefined : params,
          executionTimeMs,
          timestamp: new Date().toISOString(),
          rowCount: result.rowCount ?? undefined,
          retryCount: retryCount > 0 ? retryCount : undefined,
        };

        // Log slow queries as warnings
        if (executionTimeMs > this.SLOW_QUERY_THRESHOLD_MS) {
          logger.warn(`[DB:${queryId}] Slow query detected:`, metrics);
        } else {
          logger.debug(`[DB:${queryId}] Query executed successfully:`, metrics);
        }

        return result;
      } catch (error) {
        const endTime = performance.now();
        const executionTimeMs = endTime - startTime;
        const isConnectionError =
          (error instanceof Error && (error as any).code === "ECONNREFUSED") ||
          (error instanceof Error && (error as any).code === "57P01") || // admin_shutdown
          (error instanceof Error && (error as any).code === "08006") || // connection_failure
          (error instanceof Error && (error as any).code === "08001"); // connection_does_not_exist

        // Log detailed error information
        logger.error(`[DB:${queryId}] Query execution error:`, {
          sql: process.env.NODE_ENV === "production" ? "[REDACTED]" : sql,
          params: process.env.NODE_ENV === "production" ? undefined : params,
          executionTimeMs,
          retryCount,
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
            code: error instanceof Error ? (error as any).code : undefined,
            stack:
              process.env.NODE_ENV !== "production" && error instanceof Error
                ? error.stack
                : undefined,
          },
        });

        // Retry logic for connection errors
        if (
          retryOnConnectionError &&
          isConnectionError &&
          retryCount < maxRetries
        ) {
          retryCount++;
          logger.warn(
            `[DB:${queryId}] Connection error detected, retrying (${retryCount}/${maxRetries})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS * retryCount)
          );
          return attemptQuery();
        }

        throw error;
      } finally {
        if (client) {
          client.release();
          logger.debug(`[DB:${queryId}] Client released back to pool`);
        }
        clearTimeout(timeoutId);
      }
    };

    return attemptQuery();
  }

  /**
   * Execute a query in a transaction
   *
   * @param callback - Transaction callback
   * @returns Transaction result
   */
  public static async executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const transactionId = uuidv4();
    const startTime = performance.now();

    logger.debug(`[TX:${transactionId}] Starting transaction`);

    try {
      const result = await db.transaction(callback);

      const endTime = performance.now();
      const executionTimeMs = endTime - startTime;

      logger.debug(
        `[TX:${transactionId}] Transaction completed successfully in ${executionTimeMs.toFixed(
          2
        )}ms`
      );

      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTimeMs = endTime - startTime;

      logger.error(
        `[TX:${transactionId}] Transaction failed after ${executionTimeMs.toFixed(
          2
        )}ms:`,
        error
      );

      throw error;
    }
  }

  /**
   * Get a single row from the database
   *
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Single row or null if not found
   */
  public static async getSingleRow<T extends QueryResultRow = any>(
    sql: string,
    params?: any[]
  ): Promise<T | null> {
    const result = await this.executeQuery<T>(sql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Check database health
   *
   * @returns Health status
   */
  public static async checkHealth(): Promise<{
    isHealthy: boolean;
    latencyMs?: number;
  }> {
    const startTime = performance.now();

    try {
      await this.executeQuery("SELECT 1");
      const endTime = performance.now();
      return {
        isHealthy: true,
        latencyMs: endTime - startTime,
      };
    } catch (error) {
      logger.error("Database health check failed:", error);
      return { isHealthy: false };
    }
  }

  /**
   * Count records in a table
   *
   * @param tableName - Table name
   * @param whereClause - Optional WHERE clause
   * @param params - Query parameters
   * @returns Record count
   */
  public static async countRecords(
    tableName: string,
    whereClause: string = "",
    params: any[] = []
  ): Promise<number> {
    const whereStatement = whereClause ? `WHERE ${whereClause}` : "";
    const sql = `SELECT COUNT(*) as count FROM ${tableName} ${whereStatement}`;

    const result = await this.executeQuery<{ count: string }>(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Insert a record and return the inserted data
   *
   * @param tableName - Table name
   * @param data - Data to insert
   * @param returningColumns - Columns to return
   * @returns Inserted record
   */
  public static async insertRecord<T extends QueryResultRow = any>(
    tableName: string,
    data: Record<string, any>,
    returningColumns: string = "*"
  ): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const sql = `
      INSERT INTO ${tableName} (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING ${returningColumns}
    `;

    const result = await this.executeQuery<T>(sql, values);
    return result.rows[0];
  }

  /**
   * Update a record and return the updated data
   *
   * @param tableName - Table name
   * @param data - Data to update
   * @param whereClause - WHERE clause
   * @param whereParams - WHERE parameters
   * @param returningColumns - Columns to return
   * @returns Updated record
   */
  public static async updateRecord<T extends QueryResultRow = any>(
    tableName: string,
    data: Record<string, any>,
    whereClause: string,
    whereParams: any[] = [],
    returningColumns: string = "*"
  ): Promise<T | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);

    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");

    const whereParamOffset = values.length;
    const whereClauseWithParams = whereClause.replace(
      /\$(\d+)/g,
      (_, num) => `$${parseInt(num, 10) + whereParamOffset}`
    );

    const sql = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE ${whereClauseWithParams}
      RETURNING ${returningColumns}
    `;

    const result = await this.executeQuery<T>(sql, [...values, ...whereParams]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default DBConnectUtil;
