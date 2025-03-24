import { Sequelize, Transaction } from "sequelize";
import { Pool, PoolClient } from "pg";
import { appConfig } from "@/config";
import logger from "@/common/utils/logging/logger";

// Define the interface for our database client that tests will use
interface DatabaseClient {
  sequelize: Sequelize;
  pgPool: Pool;
  authenticate(): Promise<void>;
  disconnect(): Promise<void>;
  close(): Promise<void>; // Alias for disconnect for test compatibility
  healthCheck(): Promise<boolean>;
  getConnection(): Promise<PoolClient>;
  transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
  sync(options?: { force?: boolean; alter?: boolean }): Promise<void>;
}

// Log the database configuration for debugging (without sensitive data)
const dbConfigDebug = {
  host: appConfig.database.host,
  port: appConfig.database.port,
  database: appConfig.database.name,
  username: appConfig.database.username,
  hasPassword: appConfig.database.password ? "Yes" : "No",
};
logger.info("Database configuration:", dbConfigDebug);

// Make sure all connection parameters are strings
const dbConfig = {
  dialect: "postgres" as const,
  host: String(appConfig.database.host || "localhost"),
  port: Number(appConfig.database.port || 5432),
  database: String(appConfig.database.name || ""),
  username: String(appConfig.database.username || ""),
  password: String(appConfig.database.password || ""),
  logging: (msg: string) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    // Add statement timeout to avoid hanging queries
    statement_timeout: 30000,
  },
};

// Create and configure Sequelize instance with better error handling
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
  }
);

// Create PG Pool for direct connection
const pgPool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.username,
  password: dbConfig.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Register error handler for PG Pool
pgPool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
});

// Create database client with required methods
const databaseClient: DatabaseClient = {
  sequelize,
  pgPool,

  // Authenticate database connection
  async authenticate(): Promise<void> {
    try {
      await sequelize.authenticate();
      // Also check the pg pool connection
      const client = await this.pgPool.connect();
      client.release();
      logger.info("Database connection has been established successfully.");
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
      // Log more details about the connection parameters (without password)
      logger.error("Connection details:", {
        host: appConfig.database.host,
        port: appConfig.database.port,
        database: appConfig.database.name,
        username: appConfig.database.username,
      });
      throw error;
    }
  },

  // Disconnect from database
  async disconnect(): Promise<void> {
    try {
      await sequelize.close();
      await this.pgPool.end();
      logger.info("Database connection closed successfully.");
    } catch (error) {
      logger.error("Error closing database connection:", error);
      throw error;
    }
  },

  // Alias for disconnect for test compatibility
  async close(): Promise<void> {
    return this.disconnect();
  },

  // Check database health
  async healthCheck(): Promise<boolean> {
    try {
      await sequelize.authenticate();
      // Also test pg pool
      const client = await this.pgPool.connect();
      client.release();
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  },

  // Get a connection from the pool
  async getConnection(): Promise<PoolClient> {
    try {
      return await this.pgPool.connect();
    } catch (error) {
      logger.error("Failed to get database connection:", error);
      throw error;
    }
  },

  // Execute a callback within a transaction
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getConnection();

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
  },

  // Sync database tables
  async sync(options = { force: false, alter: true }): Promise<void> {
    try {
      logger.info(`Syncing database with options: ${JSON.stringify(options)}`);

      // Use the sequelize sync but capture foreign key violations
      await sequelize.sync(options);
      logger.info("Database sync completed successfully");
    } catch (error: any) {
      logger.error("Database sync failed:", error);

      // Log more detailed error information
      if (error.parent) {
        logger.error("Original database error:", {
          code: error.parent.code,
          message: error.parent.message,
          detail: error.parent.detail,
        });

        // Check for specific Postgres error codes
        if (error.parent.code === "42P01") {
          // Relation does not exist
          const match = error.parent.message.match(
            /relation "(.*?)" does not exist/
          );
          if (match && match[1]) {
            const missingTable = match[1];
            logger.error(
              `Missing table: "${missingTable}". This table might need to be created before other tables that depend on it.`
            );
          }
        } else if (error.parent.code === "23503") {
          // Foreign key violation
          logger.error(
            "Foreign key constraint violation. Check that referenced tables are created first."
          );
        } else if (error.parent.code === "42501") {
          // Permission issue
          logger.error(
            "This appears to be a permissions issue. Make sure your database user has CREATE TABLE privileges."
          );
        }
      }

      throw error;
    }
  },
};

// Database utility methods
const db = {
  sequelize,
  pgPool, // Expose pgPool to allow direct access

  /**
   * Execute a function within a Sequelize transaction
   * @param callback Function to execute within transaction
   * @returns Result of the callback function
   */
  transaction: async <T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> => {
    const transaction = await sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Execute a function within a PostgreSQL transaction using a raw connection
   * @param callback Function to execute within transaction
   * @returns Result of the callback function
   */
  pgTransaction: async <T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> => {
    const client = await pgPool.connect();
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
  },

  /**
   * Get a PostgreSQL connection from the pool
   * @returns PostgreSQL client
   */
  getConnection: async (): Promise<PoolClient> => {
    return await pgPool.connect();
  },

  /**
   * Disconnect from the database
   * Closes all connections
   */
  disconnect: async (): Promise<void> => {
    try {
      await sequelize.close();
      await pgPool.end();
      logger.info("Database connection closed successfully.");
    } catch (error) {
      logger.error("Error closing database connection:", error);
      throw error;
    }
  },

  /**
   * Check database health
   * @returns true if database is healthy, false otherwise
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      await sequelize.authenticate();
      const client = await pgPool.connect();
      client.release();
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  },
};

export default db;
