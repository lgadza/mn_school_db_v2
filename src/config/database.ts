import { Sequelize } from "sequelize";
import { appConfig } from "@/config";
import logger from "@/common/utils/logging/logger";

// Define the interface for our database client that tests will use
interface DatabaseClient {
  sequelize: Sequelize;
  authenticate(): Promise<void>;
  disconnect(): Promise<void>;
  close(): Promise<void>; // Alias for disconnect for test compatibility
  healthCheck(): Promise<boolean>;
}

// Create and configure Sequelize instance
const sequelize = new Sequelize({
  dialect: "postgres",
  host: appConfig.database.host,
  port: appConfig.database.port,
  database: appConfig.database.name,
  username: appConfig.database.username,
  password: appConfig.database.password,
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Create database client with required methods
const databaseClient: DatabaseClient = {
  sequelize,

  // Authenticate database connection
  async authenticate(): Promise<void> {
    try {
      await sequelize.authenticate();
      logger.info("Database connection has been established successfully.");
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
      throw error;
    }
  },

  // Disconnect from database
  async disconnect(): Promise<void> {
    try {
      await sequelize.close();
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
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  },
};

export default databaseClient;
