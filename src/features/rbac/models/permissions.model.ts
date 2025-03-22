import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";
import { PermissionAction } from "../interfaces/roles.interface";

// Permission attributes interface
export interface PermissionAttributes {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: PermissionAction;
  createdAt: Date;
  updatedAt: Date;
}

// Permission creation attributes interface
export interface PermissionCreationAttributes
  extends Optional<PermissionAttributes, "id" | "createdAt" | "updatedAt"> {}

// Permission model
class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: string;
  public name!: string;
  public description?: string;
  public resource!: string;
  public action!: PermissionAction;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(...Object.values(PermissionAction)),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at", // Explicitly set the column name
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at", // Explicitly set the column name
    },
  },
  {
    sequelize,
    tableName: "permissions", // Make sure this is lowercase
    modelName: "Permission",
    timestamps: true,
    underscored: true, // Use snake_case for all fields
  }
);

export default Permission;
