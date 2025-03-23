import { Model, DataTypes } from "sequelize";
import sequelize from "../../../config/sequelize";
import Role from "./roles.model";
import Permission from "./permissions.model";

class RolePermission extends Model {
  public roleId!: string;
  public permissionId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    // Define primary key as a composite of both foreign keys
    roleId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Role,
        key: "id",
      },
    },
    permissionId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Permission,
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "role_permissions",
    modelName: "RolePermission",
    timestamps: true,
  }
);

export default RolePermission;
