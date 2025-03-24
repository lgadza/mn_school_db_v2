import User from "./model";
import Role from "../rbac/models/roles.model";
import UserRole from "./user-role.model";
import { registerAlias } from "../association-loader";

// Register aliases to prevent conflicts
registerAlias("User", "roles");
registerAlias("Role", "users");
registerAlias("UserRole", "user");
registerAlias("UserRole", "role");
registerAlias("User", "userRoles");

// User-Role associations
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
  constraints: false,
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "roleId",
  otherKey: "userId",
  as: "users",
  constraints: false,
});

// Direct associations between UserRole and Role
UserRole.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

// Direct associations between UserRole and User
UserRole.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(UserRole, {
  foreignKey: "userId",
  as: "userRoles",
});
