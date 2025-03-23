import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/sequelize";
import User from "./model";
import Role from "../rbac/models/roles.model";

class UserRole extends Model {
  public userId!: string;
  public roleId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
  {
    // Define primary key as a composite of both foreign keys
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },
    roleId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Role,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "user_roles",
    modelName: "UserRole",
    timestamps: true,
  }
);

export default UserRole;
