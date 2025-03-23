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

// Expanded granular permission actions
const granularPermissionActions = [
  { action: PermissionAction.CREATE, description: "Create" },
  { action: PermissionAction.READ, description: "Read" },
  { action: PermissionAction.MANAGE, description: "Manage" },
  { action: PermissionAction.UPDATE, description: "Update" },
  { action: PermissionAction.DELETE, description: "Delete" },
  { action: PermissionAction.APPROVE, description: "Approve" },
  { action: PermissionAction.REJECT, description: "Reject" },
  { action: PermissionAction.VIEW_REPORTS, description: "View reports" },
  { action: PermissionAction.DOWNLOAD_DATA, description: "Download data" },
  { action: PermissionAction.EXPORT, description: "Export" },
  { action: PermissionAction.IMPORT, description: "Import" },
  { action: PermissionAction.ARCHIVE, description: "Archive" },
  { action: PermissionAction.RESTORE, description: "Restore" },
  { action: PermissionAction.PUBLISH, description: "Publish" },
  { action: PermissionAction.UNPUBLISH, description: "Unpublish" },
  { action: PermissionAction.ASSIGN, description: "Assign" },
  { action: PermissionAction.TRANSFER, description: "Transfer" },
];

/**
 * Get all table names from the database
 */
const getAllTables = async (sequelize: Sequelize): Promise<string[]> => {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('migrations', 'sequelizemeta', 'sequelize_meta');
    `;

    const results: any[] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return results.map((result) => result.table_name);
  } catch (error) {
    logger.error("Error retrieving database tables:", error);
    return [];
  }
};

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

    // Get existing permissions to avoid duplicates
    const existingPermissions = await Permission.findAll();
    const existingPermissionNames = new Set(
      existingPermissions.map((p) => p.name)
    );

    // Start with default permissions
    let permissionsToCreate = [];

    // Get all tables to generate dynamic permissions
    const tables = await getAllTables(sequelize);
    logger.info(`Found ${tables.length} tables for permission generation`);

    /**
     * Convert plural table name to singular resource name
     * Handles common English pluralization rules
     */
    const toSingular = (plural: string): string => {
      // Common irregular plurals
      const irregulars: Record<string, string> = {
        children: "child",
        people: "person",
        men: "man",
        women: "woman",
        teeth: "tooth",
        feet: "foot",
        mice: "mouse",
        geese: "goose",
      };

      // Check for irregular forms first
      if (irregulars[plural]) {
        return irregulars[plural];
      }

      // Handle common regular patterns
      if (plural.endsWith("ies")) {
        // categories -> category
        return plural.slice(0, -3) + "y";
      } else if (
        plural.endsWith("ses") ||
        plural.endsWith("xes") ||
        plural.endsWith("ches") ||
        plural.endsWith("shes") ||
        plural.endsWith("oes")
      ) {
        // addresses -> address, boxes -> box
        return plural.slice(0, -2);
      } else if (plural.endsWith("s") && !plural.endsWith("ss")) {
        // books -> book, but not address -> addres
        return plural.slice(0, -1);
      }

      // If no rule matches, return the original (might already be singular)
      return plural;
    };

    // Generate permissions for each table
    for (const table of tables) {
      // Skip system tables or junction tables
      if (
        table.includes("_") &&
        (table.startsWith("role_") || table.endsWith("_permissions"))
      ) {
        continue;
      }

      // Convert table name to a resource name using proper singularization
      const resource = toSingular(table);

      // Generate granular permissions for this resource
      for (const { action, description } of granularPermissionActions) {
        const permissionName = `${resource}:${action}`;

        // Skip if this permission already exists
        if (existingPermissionNames.has(permissionName)) {
          continue;
        }

        permissionsToCreate.push({
          name: permissionName,
          description: `${description} ${resource}`,
          resource,
          action,
        });
      }
    }

    // Filter out permissions that already exist
    const newPermissions = permissionsToCreate.filter(
      (p) => !existingPermissionNames.has(p.name)
    );

    if (newPermissions.length > 0) {
      logger.info(`Creating ${newPermissions.length} new permissions...`);
      await Permission.bulkCreate(newPermissions);
      logger.info("New permissions created successfully");
    } else {
      logger.info("No new permissions to create");
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

      // Prepare bulk create array
      const rolePermissionsToCreate: {
        roleId: string;
        permissionId: string;
      }[] = [];

      // Find admin roles
      const superAdminRole = roles.find((role) => role.name === "super_admin");
      const adminRole = roles.find((role) => role.name === "admin");
      const managerRole = roles.find((role) => role.name === "manager");

      // Set super_admin permissions - ALL permissions system-wide
      if (superAdminRole) {
        logger.info(
          "Setting permissions for super_admin (ALL permissions system-wide)"
        );
        // Assign ALL permissions to super_admin
        permissions.forEach((permission) => {
          rolePermissionsToCreate.push({
            roleId: superAdminRole.id,
            permissionId: permission.id,
          });
        });
      }

      // Set admin permissions - ALL permissions but limited to school context
      if (adminRole) {
        logger.info(
          "Setting permissions for admin (ALL permissions, school-limited)"
        );
        // Assign ALL permissions to admin
        permissions.forEach((permission) => {
          rolePermissionsToCreate.push({
            roleId: adminRole.id,
            permissionId: permission.id,
          });
        });
      }

      // Set manager permissions - ALL except DELETE and limited to school context
      if (managerRole) {
        logger.info(
          "Setting permissions for manager (ALL except DELETE, school-limited)"
        );
        // Assign all permissions EXCEPT DELETE
        permissions.forEach((permission) => {
          // Skip DELETE permissions for managers
          if (permission.action === PermissionAction.DELETE) {
            return;
          }

          rolePermissionsToCreate.push({
            roleId: managerRole.id,
            permissionId: permission.id,
          });
        });
      }

      // Handle other roles with specific permission sets
      // We'll keep the permissionGroups for non-admin roles
      for (const group of permissionGroups) {
        // Skip admin roles since we already handled them
        if (
          group.roles.includes("super_admin") ||
          group.roles.includes("admin") ||
          group.roles.includes("manager")
        ) {
          continue;
        }

        // Find all roles that should receive this group's permissions
        const targetRoles = roles.filter((role) =>
          group.roles.includes(role.name)
        );
        if (targetRoles.length === 0) continue;

        // Determine which resources to apply permissions to
        const resources = group.resources || [];

        // Skip if no resources specified for non-admin roles
        if (resources.length === 0) continue;

        // For each target role, assign the appropriate permissions
        for (const role of targetRoles) {
          logger.info(`Setting permissions for ${role.name}`);

          // Find permissions for specified resources and actions
          const rolePermissions = permissions.filter(
            (permission) =>
              resources.includes(permission.resource) &&
              group.actions.includes(permission.action as string)
          );

          // Add role-permission mappings
          for (const permission of rolePermissions) {
            rolePermissionsToCreate.push({
              roleId: role.id,
              permissionId: permission.id,
            });
          }
        }
      }

      // Deduplicate the mappings to avoid unique constraint violations
      const uniqueMappings = Array.from(
        new Map(
          rolePermissionsToCreate.map((item) => [
            `${item.roleId}-${item.permissionId}`,
            item,
          ])
        ).values()
      );

      if (uniqueMappings.length > 0) {
        await RolePermission.bulkCreate(uniqueMappings);
        logger.info(
          `Created ${uniqueMappings.length} role-permission mappings`
        );
      }

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

// Define permission groups for non-admin roles only
const permissionGroups: {
  roles: string[];
  resources: string[];
  actions: string[];
}[] = [
  // Teacher group - educational resource management
  {
    roles: ["teacher"],
    resources: [
      "student",
      "class",
      "course",
      "assignment",
      "grade",
      "attendance",
    ],
    actions: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.MANAGE,
      PermissionAction.APPROVE,
      PermissionAction.REJECT,
      PermissionAction.VIEW_REPORTS,
    ],
  },
  // Student group - view their own data
  {
    roles: ["student"],
    resources: ["assignment", "grade", "course", "class", "attendance"],
    actions: [PermissionAction.READ, PermissionAction.VIEW_REPORTS],
  },
  // More groups can be added here
];

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
