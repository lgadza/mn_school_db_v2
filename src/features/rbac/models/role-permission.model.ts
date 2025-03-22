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
      field: "role_id", // Explicitly set the column name to match Postgres conventions
    },
    permissionId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Permission,
        key: "id",
      },
      field: "permission_id", // Explicitly set the column name to match Postgres conventions
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at", // Explicitly set the column name to match Postgres conventions
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at", // Explicitly set the column name to match Postgres conventions
    },
  },
  {
    sequelize,
    tableName: "role_permissions",
    modelName: "RolePermission",
    timestamps: true,
    underscored: true, // Use snake_case for all fields
  }
);

export default RolePermission;
