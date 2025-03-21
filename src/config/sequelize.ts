import { Sequelize } from "sequelize";
import logger from "@/common/utils/logging/logger";
import { appConfig } from "./index";

/**
 * Sequelize ORM configuration for PostgreSQL
 */
let sequelize: Sequelize;

// Create the Sequelize instance based on environment
if (appConfig.env === "production") {
  sequelize = new Sequelize(
    appConfig.database.name,
    appConfig.database.username,
    appConfig.database.password,
    {
      host: appConfig.database.host,
      port: appConfig.database.port,
      dialect: "postgres",
      logging: false, // Disable logging in production
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  sequelize = new Sequelize(
    appConfig.database.name,
    appConfig.database.username,
    appConfig.database.password,
    {
      host: appConfig.database.host,
      port: appConfig.database.port,
      dialect: "postgres",
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
}

// Don't call setupAssociations here to avoid circular dependencies
// It will be called in server.ts instead

export default sequelize;
