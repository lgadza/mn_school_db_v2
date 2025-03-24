import logger from "../common/utils/logging/logger";
import { QueryTypes } from "sequelize";
import sequelize from "../config/sequelize";

// Import models
import Role from "./rbac/models/roles.model";
import Permission from "./rbac/models/permissions.model";
import RolePermission from "./rbac/models/role-permission.model";
import User from "./users/model";
import UserRole from "./users/user-role.model";
import School from "./schools/model";
import Address from "./address/model";
import AddressLink from "./address/address-link.model";
import Department from "./school_config/departments/model";
import Grade from "./school_config/grades/model";
import Section from "./school_config/sections/model";
import Subject from "./school_config/subjects/model";
import Category from "./school_config/categories/model";
import Teacher from "./teachers/model";
import Book from "./library/books/model";
import BookLoan from "./library/loans/model";
import RentalRule from "./library/rules/model";

// Import the association loader
import loadAllAssociations from "./association-loader";

// Model initialization order - this is important!
const MODELS = [
  // Base models first (no foreign key dependencies)
  Role,
  Permission,
  School,
  User,
  Address,
  Department,
  Grade,
  Teacher,
  Book,
  BookLoan,
  RentalRule,
  Section,
  Category,
  Subject,

  // Join tables and models with foreign key dependencies
  RolePermission,
  UserRole,
  AddressLink,

  // Add other models in their dependency order
];

// Flag to track if associations have already been set up
let associationsSetup = false;

/**
 * Check if a table exists in the database
 */
const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = :tableName
      );
    `;

    const result = await sequelize.query(query, {
      replacements: { tableName },
      type: QueryTypes.SELECT,
      plain: true,
    });

    return result && (result as any).exists;
  } catch (error) {
    logger.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

/**
 * Check if a column exists in a table
 */
const columnExists = async (
  tableName: string,
  columnName: string
): Promise<boolean> => {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = :tableName
        AND column_name = :columnName
      );
    `;

    const result = await sequelize.query(query, {
      replacements: { tableName, columnName },
      type: QueryTypes.SELECT,
      plain: true,
    });

    return result && (result as any).exists;
  } catch (error) {
    logger.error(
      `Error checking if column ${columnName} in table ${tableName} exists:`,
      error
    );
    return false;
  }
};

/**
 * Setup all model associations
 */
const setupAssociations = () => {
  try {
    // Prevent multiple setup of associations
    if (associationsSetup) {
      logger.warn("Associations already set up. Skipping duplicate setup.");
      return;
    }

    logger.info("Setting up model associations...");
    logger.debug(`Setup associations called from: ${new Error().stack}`);

    // Load all feature-specific associations
    loadAllAssociations();

    // Mark associations as set up
    associationsSetup = true;
    logger.info("Model associations set up successfully");
  } catch (error) {
    logger.error("Error setting up model associations:", error);
    logger.error(
      `Association error details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    logger.error(
      `Error stack: ${
        error instanceof Error ? error.stack : "No stack available"
      }`
    );
    throw error;
  }
};

/**
 * Drop and recreate a table
 */
const recreateTable = async (model: any): Promise<void> => {
  try {
    const tableName = model.getTableName();
    logger.info(`Dropping and recreating table ${tableName}...`);

    await sequelize.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
    await model.sync({ force: true });

    logger.info(`Table ${tableName} recreated successfully`);
  } catch (error) {
    logger.error(`Error recreating table:`, error);
    throw error;
  }
};

/**
 * Sync models in a specific order with better error handling
 */
const syncModelsInOrder = async (options = { force: false, alter: true }) => {
  logger.info(
    `Starting sequential model sync with options: ${JSON.stringify(options)}`
  );

  // First, drop all join tables if we need a clean sync
  if (options.force) {
    try {
      logger.info("Force sync requested. Dropping join tables first...");
      await sequelize.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE;`);
      await sequelize.query(`DROP TABLE IF EXISTS "user_roles" CASCADE;`);
      // Add other join tables here if needed
    } catch (error) {
      logger.warn("Error dropping join tables:", error);
      // Continue anyway
    }
  }

  // Sync each model in order
  for (const model of MODELS) {
    try {
      const tableName = model.getTableName();
      logger.info(`Syncing model: ${model.name}`);

      const tableExisted = await tableExists(
        typeof tableName === "string" ? tableName : tableName.tableName
      );

      // If it's a join table and parent tables exist, consider recreating it
      if (
        (model === RolePermission || model === UserRole) &&
        options.alter &&
        tableExisted
      ) {
        // Check if we have column issues
        const hasIssue =
          model === RolePermission
            ? !(await columnExists("role_permissions", "roleId")) ||
              !(await columnExists("role_permissions", "permissionId"))
            : !(await columnExists("user_roles", "userId")) ||
              !(await columnExists("user_roles", "roleId"));

        if (hasIssue) {
          // Recreate the join table properly
          await recreateTable(model);
          continue;
        }
      }

      // Otherwise do a regular sync
      await model.sync(options);
      logger.info(`Successfully synced model: ${model.name}`);
    } catch (error) {
      logger.error(`Error syncing model ${model.name}:`, error);

      // For join tables, try to recreate if there's an error
      if (model === RolePermission || model === UserRole) {
        try {
          logger.info(`Attempting to recreate ${model.name} after sync error`);
          await recreateTable(model);
          logger.info(`Successfully recreated ${model.name}`);
        } catch (recreateError) {
          logger.error(`Failed to recreate ${model.name}:`, recreateError);
        }
      } else {
        // For base models, propagate the error
        throw error;
      }
    }
  }

  logger.info("All models synced successfully");
};

export { setupAssociations, syncModelsInOrder };
export default setupAssociations;
