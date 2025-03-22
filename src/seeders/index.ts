import logger from "../common/utils/logging/logger";
import seedRBAC from "./rbac.seeder";
// Import other seeders here

/**
 * Run all database seeders
 */
export const runSeeders = async (): Promise<void> => {
  try {
    logger.info("Starting database seeding...");

    // Add a small delay to ensure database connection is fully established
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Run seeders in sequence with proper error handling
    await seedRBAC().catch((error) => {
      logger.error(
        "RBAC seeding failed but continuing with other seeders:",
        error
      );
    });

    // Add other seeders here
    // await otherSeeder().catch(error => logger.error('Other seeder failed:', error));

    logger.info("Database seeding completed");
  } catch (error) {
    logger.error("Error in seeders:", error);
  }
};

export default runSeeders;
