import { Model, DataTypes } from "sequelize";
import sequelize from "@/config/sequelize";

/**
 * SchoolAddress model for linking schools with multiple addresses
 * This enables schools to have multiple addresses (e.g., campus locations)
 */
class SchoolAddress extends Model {
  public id!: string;
  public schoolId!: string;
  public addressId!: string;
  public addressType!: string; // e.g., 'main', 'campus', 'administrative', etc.
  public isPrimary!: boolean;
  public description!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SchoolAddress.init(
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
      onDelete: "CASCADE",
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "addresses",
        key: "id",
      },
    },
    addressType: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "main",
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    description: {
      type: new DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    tableName: "school_addresses",
    sequelize,
    indexes: [
      {
        // Index for quick lookup of addresses by school
        fields: ["schoolId"],
      },
      {
        // Index for address type lookups
        fields: ["addressType"],
      },
      {
        // Index for finding primary addresses
        fields: ["isPrimary"],
      },
      {
        // Composite index for unique school-address type combinations
        fields: ["schoolId", "addressType", "isPrimary"],
      },
    ],
  }
);

// Note: Associations will be defined in a separate file to avoid circular dependencies

export default SchoolAddress;
