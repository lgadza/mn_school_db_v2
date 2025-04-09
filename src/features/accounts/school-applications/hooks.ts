import { Model } from "sequelize";
import SchoolApplication from "./model";
import Prospect from "../prospects/model";
import logger from "@/common/utils/logging/logger";
import db from "@/config/database";

/**
 * Register hooks for SchoolApplication model to manage prospect application status
 */
export const registerSchoolApplicationHooks = (): void => {
  /**
   * After create hook - Updates prospect's hasApplied status when an application is created
   */
  SchoolApplication.afterCreate(
    async (instance: any, options: any): Promise<void> => {
      const transaction =
        options.transaction || (await db.sequelize.transaction());
      try {
        const isNewTransaction = !options.transaction;
        const prospectId = instance.prospectId;

        // Get the prospect
        const prospect = await Prospect.findByPk(prospectId);
        if (!prospect) {
          logger.error(
            `Prospect with ID ${prospectId} not found for application ${instance.id}`
          );
          if (isNewTransaction) await transaction.rollback();
          return;
        }

        // If the prospect doesn't have hasApplied set to true, update it
        if (!prospect.hasApplied) {
          await Prospect.update(
            { hasApplied: true },
            {
              where: { id: prospectId },
              transaction,
            }
          );
          logger.info(
            `Updated hasApplied status for prospect ${prospectId} to true`
          );
        }

        if (isNewTransaction) await transaction.commit();
      } catch (error) {
        logger.error("Error in SchoolApplication afterCreate hook:", error);
        if (!options.transaction) await transaction.rollback();
      }
    }
  );

  /**
   * After destroy hook - Checks if prospect has any remaining applications
   * If not, updates hasApplied to false
   */
  SchoolApplication.afterDestroy(
    async (instance: any, options: any): Promise<void> => {
      const transaction =
        options.transaction || (await db.sequelize.transaction());
      try {
        const isNewTransaction = !options.transaction;
        const prospectId = instance.prospectId;

        // Count remaining applications for this prospect
        const applicationCount = await SchoolApplication.count({
          where: { prospectId },
          transaction,
        });

        // If no applications remain, update hasApplied to false
        if (applicationCount === 0) {
          await Prospect.update(
            { hasApplied: false },
            {
              where: { id: prospectId },
              transaction,
            }
          );
          logger.info(
            `Updated hasApplied status for prospect ${prospectId} to false (no applications)`
          );
        }

        if (isNewTransaction) await transaction.commit();
      } catch (error) {
        logger.error("Error in SchoolApplication afterDestroy hook:", error);
        if (!options.transaction) await transaction.rollback();
      }
    }
  );
};

export default registerSchoolApplicationHooks;
