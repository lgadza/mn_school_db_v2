import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../../config/sequelize";

// Role attributes interface
export interface RoleAttributes {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Role creation attributes interface
export interface RoleCreationAttributes
  extends Optional<RoleAttributes, "id" | "createdAt" | "updatedAt"> {}

// Role model
class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: string;
  public name!: string;
  public description?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
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
    tableName: "roles",
    modelName: "Role",
    timestamps: true,
  }
);

export default Role;
