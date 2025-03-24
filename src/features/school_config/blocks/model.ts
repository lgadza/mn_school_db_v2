import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { BlockInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface BlockCreationInterface
  extends Optional<
    BlockInterface,
    "id" | "details" | "location" | "yearBuilt" | "status"
  > {}

// Block model definition
class Block
  extends Model<BlockInterface, BlockCreationInterface>
  implements BlockInterface
{
  public id!: string;
  public schoolId!: string;
  public name!: string;
  public numberOfClassrooms!: number;
  public details!: string | null;
  public location!: string | null;
  public yearBuilt!: number | null;
  public status!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isActive(): boolean {
    return this.status === "active";
  }
}

Block.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    name: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    numberOfClassrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    details: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    location: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    yearBuilt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1800,
        max: new Date().getFullYear() + 10, // Allow up to 10 years in the future for planned blocks
      },
    },
    status: {
      type: new DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "maintenance", "planned", "demolished"]],
      },
    },
  },
  {
    tableName: "blocks",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "block_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for block name searches
        name: "block_name_idx",
        fields: ["name"],
      },
      {
        // Index for status searches
        name: "block_status_idx",
        fields: ["status"],
      },
    ],
  }
);

export default Block;
