import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/sequelize";

// School attributes interface
export interface SchoolAttributes {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  principalName?: string;
  establishedYear?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// School creation attributes interface
export interface SchoolCreationAttributes
  extends Optional<SchoolAttributes, "id" | "createdAt" | "updatedAt"> {}

// School model
class School
  extends Model<SchoolAttributes, SchoolCreationAttributes>
  implements SchoolAttributes
{
  public id!: string;
  public name!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public phone!: string;
  public email!: string;
  public website?: string;
  public principalName?: string;
  public establishedYear?: number;
  public isActive!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

School.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    principalName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    establishedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "schools",
    modelName: "School",
  }
);

export default School;
