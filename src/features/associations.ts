import logger from "@/common/utils/logging/logger";

/**
 * Set up all model associations
 * This file should be imported after all models are defined
 */
export function setupAssociations(): void {
  // Import models here to avoid circular dependencies
  const User = require("./users/model").default;
  const Role = require("./rbac/models/roles.model").default;
  const UserRole = require("./users/user-role.model").default;

  try {
    // User to Role (many-to-many)
    User.belongsToMany(Role, {
      through: UserRole,
      foreignKey: "userId",
      otherKey: "roleId",
      as: "roles",
    });

    // Role to User (many-to-many)
    Role.belongsToMany(User, {
      through: UserRole,
      foreignKey: "roleId",
      otherKey: "userId",
      as: "users",
    });

    logger.info("Model associations have been set up successfully");
  } catch (error) {
    logger.error("Error setting up model associations:", error);
  }
}

export default setupAssociations;
