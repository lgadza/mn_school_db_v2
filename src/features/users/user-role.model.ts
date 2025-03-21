import { Model, DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";
import { UserRoleInterface } from "./interfaces";
import User from "./model";
import Role from "../rbac/models/roles.model";

class UserRole extends Model<UserRoleInterface> implements UserRoleInterface {
  public userId!: string;
  public roleId!: string;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    roleId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: "roles",
        key: "id",
      },
    },
  },
  {
    tableName: "user_roles",
    sequelize,
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "role_id"],
      },
    ],
  }
);

export default UserRole;
