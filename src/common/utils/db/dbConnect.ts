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
}

/**
 * Database Connection Utility
 * Provides standardized methods for database operations with instrumentation and monitoring
 */
export class DBConnectUtil {
  private static readonly SLOW_QUERY_THRESHOLD_MS = 500;

  /**
   * Execute a query with metrics and error handling
   *
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  public static async executeQuery<T extends QueryResultRow = any>(
    sql: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const queryId = uuidv4();
    const startTime = performance.now();
    let client: PoolClient | null = null;

    try {
      // Log query execution (sanitized in production)
      if (process.env.NODE_ENV !== "production") {
        logger.debug(`[DB:${queryId}] Executing query:`, {
          sql,
          params,
        });
      } else {
        logger.debug(`[DB:${queryId}] Executing query`);
      }

      client = await db.getClient();
      const result = await client.query<T>(sql, params);

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

      logger.error(`[DB:${queryId}] Query execution error:`, {
        sql: process.env.NODE_ENV === "production" ? "[REDACTED]" : sql,
        params: process.env.NODE_ENV === "production" ? undefined : params,
        executionTimeMs,
        error,
      });

      throw error;
    } finally {
      if (client) {
        client.release();
        logger.debug(`[DB:${queryId}] Client released back to pool`);
      }
    }
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
