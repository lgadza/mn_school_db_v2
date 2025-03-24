import Role from "./models/roles.model";
import Permission from "./models/permissions.model";
import RolePermission from "./models/role-permission.model";
import { registerAlias } from "../association-loader";

// Register aliases to prevent conflicts
registerAlias("Role", "permissions");
registerAlias("Permission", "permissionRoles");
registerAlias("RolePermission", "role");
registerAlias("Role", "userRoles");

// Role-Permission associations
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
  constraints: false,
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "permissionRoles",
  constraints: false,
});

// Direct associations for RolePermission
RolePermission.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(RolePermission, {
  foreignKey: "roleId",
  as: "rolePermissions",
});

RolePermission.belongsTo(Permission, {
  foreignKey: "permissionId",
  as: "permission",
});

// Permission.hasMany(RolePermission, {
//   foreignKey: "permissionId",
//   as: "permissionRoles",
// });
