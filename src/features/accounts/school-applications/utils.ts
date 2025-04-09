import Prospect from "../prospects/model";
import SchoolApplication from "./model";
import logger from "@/common/utils/logging/logger";
import { Transaction } from "sequelize";

/**
 * Utility functions for SchoolApplication module
 */
export class SchoolApplicationUtils {
  /**
   * Updates a prospect's hasApplied status based on whether they have any applications
   * @param prospectId The ID of the prospect to update
   * @param transaction Optional transaction to use
   * @returns True if the update was successful
   */
  public static async updateProspectHasAppliedStatus(
    prospectId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Count applications for this prospect
      const applicationCount = await SchoolApplication.count({
        where: { prospectId },
        transaction,
      });

      // Update the prospect's hasApplied status based on application count
      await Prospect.update(
        { hasApplied: applicationCount > 0 },
        {
          where: { id: prospectId },
          transaction,
        }
      );

      logger.info(
        `Updated hasApplied status for prospect ${prospectId} to ${
          applicationCount > 0
        }`
      );
      return true;
    } catch (error) {
      logger.error("Error updating prospect hasApplied status:", error);
      return false;
    }
  }

  /**
   * Checks if a prospect has multiple applications
   * @param prospectId The ID of the prospect to check
   * @returns True if the prospect has more than one application
   */
  public static async hasMultipleApplications(
    prospectId: string
  ): Promise<boolean> {
    try {
      const applicationCount = await SchoolApplication.count({
        where: { prospectId },
      });

      return applicationCount > 1;
    } catch (error) {
      logger.error("Error checking for multiple applications:", error);
      return false;
    }
  }
}

export default SchoolApplicationUtils;
