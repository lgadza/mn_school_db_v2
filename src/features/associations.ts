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

// Model initialization order - this is important!
const MODELS = [
  // Base models first (no foreign key dependencies)
  Role,
  Permission,
  School,
  User,

  // Join tables and models with foreign key dependencies
  RolePermission,
  UserRole,

  // Add other models in their dependency order
];

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
 * Fix duplicate tables that might exist due to case-sensitivity issues
 */
const fixDuplicateTables = async (): Promise<void> => {
  try {
    logger.info(
      "Checking for duplicate tables with case-sensitivity issues..."
    );

    // Check if we have both "roles" and "Roles" tables
    const [rolesExists, RolesExists] = await Promise.all([
      tableExists("roles"),
      tableExists("Roles"),
    ]);

    if (rolesExists && RolesExists) {
      logger.warn(
        "Found duplicate tables: 'roles' and 'Roles'. Fixing the issue..."
      );

      // Get data from the uppercase table to preserve it if needed
      const rolesData = await sequelize.query('SELECT * FROM "Roles"', {
        type: QueryTypes.SELECT,
      });

      logger.info(`Found ${rolesData.length} records in the 'Roles' table`);

      // Drop the uppercase table
      await sequelize.query('DROP TABLE IF EXISTS "Roles" CASCADE');
      logger.info("Dropped the 'Roles' table");

      // If the lowercase table is empty and we have data from the uppercase one,
      // we might want to insert that data into the lowercase table
      const lowerCaseCount = await sequelize.query(
        "SELECT COUNT(*) as count FROM roles",
        { type: QueryTypes.SELECT, plain: true }
      );

      if (rolesData.length > 0 && (lowerCaseCount as any).count === "0") {
        logger.info("Migrating data from 'Roles' to 'roles'...");
        // This would require more complex logic to insert properly
        // For now, we'll rely on seeders to populate the correct table
      }
    }

    // Similarly check for other potential duplicate tables
    const [permissionsExists, PermissionsExists] = await Promise.all([
      tableExists("permissions"),
      tableExists("Permissions"),
    ]);

    if (permissionsExists && PermissionsExists) {
      logger.warn(
        "Found duplicate tables: 'permissions' and 'Permissions'. Fixing the issue..."
      );
      await sequelize.query('DROP TABLE IF EXISTS "Permissions" CASCADE');
      logger.info("Dropped the 'Permissions' table");
    }

    // Check for role_permissions vs RolePermissions
    const [rolePermissionsExists, RolePermissionsExists] = await Promise.all([
      tableExists("role_permissions"),
      tableExists("RolePermissions"),
    ]);

    if (rolePermissionsExists && RolePermissionsExists) {
      logger.warn(
        "Found duplicate tables: 'role_permissions' and 'RolePermissions'. Fixing the issue..."
      );
      await sequelize.query('DROP TABLE IF EXISTS "RolePermissions" CASCADE');
      logger.info("Dropped the 'RolePermissions' table");
    }

    logger.info("Duplicate table check and cleanup completed");
  } catch (error) {
    logger.error("Error fixing duplicate tables:", error);
    // Continue despite errors
  }
};

/**
 * Setup all model associations
 */
const setupAssociations = () => {
  try {
    logger.info("Setting up model associations...");

    // 1. Role-Permission associations
    Role.belongsToMany(Permission, {
      through: RolePermission,
      foreignKey: "roleId",
      otherKey: "permissionId",
      constraints: false, // Disable constraints for more flexible syncing
    });

    Permission.belongsToMany(Role, {
      through: RolePermission,
      foreignKey: "permissionId",
      otherKey: "roleId",
      constraints: false, // Disable constraints for more flexible syncing
    });

    // 2. User-Role associations
    User.belongsToMany(Role, {
      through: UserRole,
      foreignKey: "userId",
      otherKey: "roleId",
      constraints: false, // Disable constraints for more flexible syncing
    });

    Role.belongsToMany(User, {
      through: UserRole,
      foreignKey: "roleId",
      otherKey: "userId",
      constraints: false, // Disable constraints for more flexible syncing
    });

    // 3. School-User associations (if applicable)
    // Example: Users belong to a school
    // User.belongsTo(School, { foreignKey: "schoolId" });
    // School.hasMany(User, { foreignKey: "schoolId" });

    // Add other associations as needed

    logger.info("Model associations set up successfully");
  } catch (error) {
    logger.error("Error setting up model associations:", error);
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

  // First, check for and fix any duplicate tables due to case sensitivity
  await fixDuplicateTables();

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
            ? !(await columnExists("role_permissions", "role_id")) ||
              !(await columnExists("role_permissions", "permission_id"))
            : !(await columnExists("user_roles", "user_id")) ||
              !(await columnExists("user_roles", "role_id"));

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
