import { Sequelize } from "sequelize";
import logger from "@/common/utils/logging/logger";
import env from "./env";

/**
 * Sequelize ORM configuration for PostgreSQL
 */
let sequelize: Sequelize;

if (env.NODE_ENV === "production") {
  sequelize = new Sequelize(env.PRODUCTION_DATABASE_URL, {
    dialect: "postgres",
    logging: (msg) => logger.debug(msg),
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
  });
} else {
  sequelize = new Sequelize(env.DATABASE_URL, {
    dialect: "postgres",
    logging:
      env.NODE_ENV === "development" ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info("Sequelize connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database with Sequelize:", error);
  }
}

testConnection();

export default sequelize;
