import User from "./model";
import Role from "../rbac/models/roles.model";
import UserRole from "./user-role.model";
import Teacher from "../teachers/model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the User model
const MODULE_NAME = "users";

// User belongs to many Roles (through UserRole)
associationRegistry.registerBelongsToMany(
  User,
  Role,
  {
    through: UserRole,
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles",
    constraints: false,
  },
  MODULE_NAME
);

// User has one Teacher
associationRegistry.registerHasOne(
  User,
  Teacher,
  {
    foreignKey: "userId",
    as: "teacher",
  },
  MODULE_NAME
);

// User has many UserRoles
associationRegistry.registerHasMany(
  User,
  UserRole,
  {
    foreignKey: "userId",
    as: "userRoles",
  },
  MODULE_NAME
);

// Note: The inverse relationships are defined in their respective model-associations files
