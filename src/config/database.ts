import { Pool, PoolConfig, PoolClient } from "pg";
import { parse } from "pg-connection-string";
import logger from "@/common/utils/logging/logger";
import env from "./env";

/**
 * PostgreSQL connection configuration
 */
class PostgresqlClient {
  private pool: Pool;
  private isConnected = false;
  private static instance: PostgresqlClient;

  private constructor() {
    const connectionConfig: PoolConfig = this.buildConnectionConfig();

    this.pool = new Pool(connectionConfig);

    // Set up event handlers
    this.pool.on("connect", () => {
      this.isConnected = true;
      logger.info("Connected to PostgreSQL database");
    });

    this.pool.on("error", (err) => {
      this.isConnected = false;
      logger.error("PostgreSQL connection error:", err);
    });

    this.pool.on("remove", () => {
      logger.info("PostgreSQL client removed from pool");
    });
  }

  /**
   * Build connection configuration based on environment
   */
  private buildConnectionConfig(): PoolConfig {
    // Use connection string if available
    const connectionString =
      env.NODE_ENV === "production"
        ? env.PRODUCTION_DATABASE_URL
        : env.DATABASE_URL;

    if (connectionString) {
      const parsedConfig = parse(connectionString);
      return {
        host: parsedConfig.host || env.PG_HOST,
        port: parsedConfig.port ? parseInt(parsedConfig.port, 10) : env.PG_PORT,
        user: parsedConfig.user || env.PG_USER,
        password: parsedConfig.password || env.PG_PASSWORD,
        database: parsedConfig.database || env.PG_DB,
        ssl:
          env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
        connectionTimeoutMillis: 5000, // How long to wait for a connection to be established
      };
    }

    // Fall back to individual environment variables
    return {
      host: env.PG_HOST,
      port: env.PG_PORT,
      user: env.PG_USER,
      password: env.PG_PASSWORD,
      database: env.PG_DB,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }

  /**
   * Get PostgreSQL client singleton instance
   */
  public static getInstance(): PostgresqlClient {
    if (!PostgresqlClient.instance) {
      PostgresqlClient.instance = new PostgresqlClient();
    }
    return PostgresqlClient.instance;
  }

  /**
   * Get a client from the pool
   */
  public async getClient(): Promise<PoolClient> {
    try {
      return await this.pool.connect();
    } catch (error) {
      logger.error("Error getting PostgreSQL client:", error);
      throw new Error("Failed to get PostgreSQL client");
    }
  }

  /**
   * Execute a query
   */
  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query in a transaction
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }

  /**
   * Close pool and disconnect
   */
  public async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info("Disconnected from PostgreSQL database");
    } catch (error) {
      logger.error("Error disconnecting from PostgreSQL:", error);
      throw error;
    }
  }
}

// Create and export the singleton instance
const db = PostgresqlClient.getInstance();

export default db;
