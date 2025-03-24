import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import {
  SchoolInterface,
  SchoolLevel,
  SchoolType,
} from "./interfaces/interfaces";
import Address from "../address/model";

// Define optional fields for creation (fields with default values or generated values like ID)
interface SchoolCreationInterface extends Optional<SchoolInterface, "id"> {}

// School model definition
class School
  extends Model<SchoolInterface, SchoolCreationInterface>
  implements SchoolInterface
{
  public id!: string;
  public name!: string;
  public level!: SchoolLevel;
  public isPublic!: boolean;
  public motto!: string | null;
  public principalId!: string;
  public adminId!: string | null;
  public addressId!: string;
  public logoUrl!: string | null;
  public websiteUrl!: string | null;
  public shortName!: string;
  public capacity!: string | null;
  public yearOpened!: number;
  public schoolCode!: string;
  public schoolType!: SchoolType;
  public contactNumber!: string;
  public email!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public getFullName(): string {
    return `${this.name} - ${this.shortName}`;
  }
}

School.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(200),
      allowNull: false,
    },
    level: {
      type: new DataTypes.ENUM(
        "primary",
        "secondary",
        "high",
        "tertiary",
        "quaternary"
      ),
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    motto: {
      type: new DataTypes.STRING(200),
      allowNull: true,
    },
    principalId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "addresses",
        key: "id",
      },
    },
    logoUrl: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    websiteUrl: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    shortName: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    capacity: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    yearOpened: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    schoolCode: {
      type: new DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    schoolType: {
      type: new DataTypes.ENUM("day", "boarding", "both"),
      allowNull: false,
    },
    contactNumber: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "schools",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school code searches
        name: "school_code_idx",
        unique: true,
        fields: ["schoolCode"],
      },
      {
        // Index for principal searches
        name: "principal_id_idx",
        fields: ["principalId"],
      },
      {
        // Index for admin searches
        name: "admin_id_idx",
        fields: ["adminId"],
      },
      {
        // Index for school level searches
        name: "school_level_idx",
        fields: ["level"],
      },
      {
        // Index for school type searches
        name: "school_type_idx",
        fields: ["schoolType"],
      },
      {
        // Index for school name searches
        name: "school_name_idx",
        fields: ["name"],
      },
    ],
  }
);

School.belongsTo(Address, {
  foreignKey: "addressId",
  as: "address",
});

export default School;
