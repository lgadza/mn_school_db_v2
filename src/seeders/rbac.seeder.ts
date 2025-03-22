import Role from "../features/rbac/models/roles.model";
import Permission from "../features/rbac/models/permissions.model";
import RolePermission from "../features/rbac/models/role-permission.model";
import logger from "../common/utils/logging/logger";
import { Sequelize } from "sequelize";
import { QueryTypes } from "sequelize";
import db from "../config/database";

// Import the PermissionAction enum
import { PermissionAction } from "../features/rbac/interfaces/roles.interface";

// Default roles to seed
const defaultRoles = [
  { name: "admin", description: "Administrator with full access" },
  { name: "manager", description: "School manager with elevated privileges" },
  { name: "teacher", description: "Regular teacher access" },
  { name: "student", description: "Limited student access" },
  { name: "parent", description: "Limited parent access" },
  { name: "user", description: "User access with minimal permissions" },
  { name: "super_admin", description: "Super administrator with all access" },
  { name: "librarian", description: "Library access" },
  { name: "accountant", description: "Financial access" },
];

// Default permissions to seed
const defaultPermissions = [
  // User management permissions
  {
    name: "user:create",
    description: "Create users",
    resource: "user",
    action: PermissionAction.CREATE, // Use enum instead of string
  },
  {
    name: "user:read",
    description: "Read user data",
    resource: "user",
    action: PermissionAction.READ, // Use enum instead of string
  },
  {
    name: "user:update",
    description: "Update user data",
    resource: "user",
    action: PermissionAction.UPDATE, // Use enum instead of string
  },
  {
    name: "user:delete",
    description: "Delete users",
    resource: "user",
    action: PermissionAction.DELETE, // Use enum instead of string
  },
  // Other permissions can be added here
];

/**
 * Check if a table exists in the database
 */
const tableExists = async (
  sequelize: Sequelize,
  tableName: string
): Promise<boolean> => {
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
 * Seeds roles into the database
 */
const seedRoles = async (): Promise<void> => {
  try {
    logger.info("Checking existing roles...");

    // Check if table exists but don't try to create it here
    const sequelize = db.sequelize;
    const rolesTableExists = await tableExists(sequelize, "roles");

    if (!rolesTableExists) {
      logger.info("Roles table does not exist yet.");
      return; // Exit early - we'll handle this in the main function
    }

    // Now check if we need to seed roles
    const count = await Role.count().catch((error) => {
      logger.error("Error counting roles:", error);
      return 0;
    });

    if (count === 0) {
      logger.info("No roles found. Seeding default roles...");
      await Role.bulkCreate(defaultRoles);
      logger.info("Default roles seeded successfully");
    } else {
      logger.info(`Found ${count} existing roles. Skipping role seeding.`);
    }
  } catch (error) {
    logger.error("Error seeding roles:", error);
    // Don't throw, just log
  }
};

/**
 * Seeds permissions into the database
 */
const seedPermissions = async (): Promise<void> => {
  try {
    // Check if table exists but don't try to create it here
    const sequelize = db.sequelize;
    const permissionsTableExists = await tableExists(sequelize, "permissions");

    if (!permissionsTableExists) {
      logger.info("Permissions table does not exist yet.");
      return; // Exit early
    }

    const count = await Permission.count().catch((error) => {
      logger.error("Error counting permissions:", error);
      return 0;
    });

    if (count === 0) {
      logger.info("No permissions found. Seeding default permissions...");
      await Permission.bulkCreate(defaultPermissions);
      logger.info("Default permissions seeded successfully");
    } else {
      logger.info(
        `Found ${count} existing permissions. Skipping permission seeding.`
      );
    }
  } catch (error) {
    logger.error("Error seeding permissions:", error);
    // Don't throw, just log
  }
};

/**
 * Maps roles to permissions
 */
const seedRolePermissions = async (): Promise<void> => {
  try {
    // Check if table exists but don't try to create it here
    const sequelize = db.sequelize;
    const rolePermissionsTableExists = await tableExists(
      sequelize,
      "role_permissions"
    );

    if (!rolePermissionsTableExists) {
      logger.info("Role-permissions table does not exist yet.");
      return; // Exit early
    }

    const count = await RolePermission.count().catch((error) => {
      logger.error("Error counting role-permissions:", error);
      return 0;
    });

    if (count === 0) {
      logger.info(
        "No role-permission mappings found. Creating default mappings..."
      );

      // Get all roles and permissions
      const roles = await Role.findAll();
      const permissions = await Permission.findAll();

      // Admin gets all permissions
      const adminRole = roles.find((role) => role.name === "admin");
      if (adminRole) {
        const adminPermissions = permissions.map((permission) => ({
          roleId: adminRole.id,
          permissionId: permission.id,
        }));
        await RolePermission.bulkCreate(adminPermissions);
      }

      // Add other role-permission mappings as needed
      // This is just a basic example

      logger.info("Role-permission mappings created successfully");
    } else {
      logger.info(
        `Found ${count} existing role-permission mappings. Skipping.`
      );
    }
  } catch (error) {
    logger.error("Error creating role-permission mappings:", error);
    // Don't throw, just log
  }
};

/**
 * Main RBAC seeding function
 */
export const seedRBAC = async (): Promise<void> => {
  try {
    logger.info("Starting RBAC seeding...");

    // First, check if any tables exist - if not we need to sync first
    const sequelize = db.sequelize;
    const [rolesExist, permissionsExist, rolePermissionsExist] =
      await Promise.all([
        tableExists(sequelize, "roles"),
        tableExists(sequelize, "permissions"),
        tableExists(sequelize, "role_permissions"),
      ]);

    // If tables don't exist, try syncing them explicitly
    if (!rolesExist || !permissionsExist || !rolePermissionsExist) {
      logger.info("Some RBAC tables are missing. Attempting to sync models...");
      try {
        // Sync just the RBAC models
        await Promise.all([
          Role.sync(),
          Permission.sync(),
          RolePermission.sync(),
        ]);
        logger.info("RBAC tables synced successfully.");
      } catch (error) {
        logger.error("Failed to sync RBAC tables:", error);
        if (error instanceof Error) {
          logger.error(`Error details: ${error.message}`);
        }
        return; // Exit if we can't sync tables
      }
    }

    // Now try to seed with models that should exist
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();

    logger.info("RBAC seeding completed successfully");
  } catch (error) {
    logger.error("Error during RBAC seeding:", error);
    // Don't throw, just log
  }
};

export default seedRBAC;
