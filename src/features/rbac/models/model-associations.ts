import Role from "./roles.model";
import Permission from "./permissions.model";
import RolePermission from "./role-permission.model";
import User from "../../users/model";
import UserRole from "../../users/user-role.model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the RBAC models
const MODULE_NAME = "rbac";

// Role belongs to many Permissions (through RolePermission)
associationRegistry.registerBelongsToMany(
  Role,
  Permission,
  {
    through: RolePermission,
    foreignKey: "roleId",
    otherKey: "permissionId",
    as: "permissions",
    constraints: false,
  },
  MODULE_NAME
);

// Permission belongs to many Roles (through RolePermission)
associationRegistry.registerBelongsToMany(
  Permission,
  Role,
  {
    through: RolePermission,
    foreignKey: "permissionId",
    otherKey: "roleId",
    as: "roles",
    constraints: false,
  },
  MODULE_NAME
);

// Role belongs to many Users (through UserRole)
associationRegistry.registerBelongsToMany(
  Role,
  User,
  {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users",
    constraints: false,
  },
  MODULE_NAME
);

// RolePermission belongs to Role
associationRegistry.registerBelongsTo(
  RolePermission,
  Role,
  {
    foreignKey: "roleId",
    as: "role",
  },
  MODULE_NAME
);

// RolePermission belongs to Permission
associationRegistry.registerBelongsTo(
  RolePermission,
  Permission,
  {
    foreignKey: "permissionId",
    as: "permission",
  },
  MODULE_NAME
);

// UserRole belongs to Role
associationRegistry.registerBelongsTo(
  UserRole,
  Role,
  {
    foreignKey: "roleId",
    as: "role",
  },
  MODULE_NAME
);

// UserRole belongs to User
associationRegistry.registerBelongsTo(
  UserRole,
  User,
  {
    foreignKey: "userId",
    as: "user",
  },
  MODULE_NAME
);
