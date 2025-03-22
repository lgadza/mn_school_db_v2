import databaseClient from "./database";
import logger from "@/common/utils/logging/logger";

// Use the sequelize instance from our database client
const sequelize = databaseClient.sequelize;

// Export the instance for use in models
export default sequelize;

// Test the connection (but only log, don't fail)
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info("Sequelize connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database via Sequelize:", error);
  }
}

// Call the test function when this module is imported
testConnection().catch((err) => {
  logger.error("Error in sequelize connection test:", err);
});
