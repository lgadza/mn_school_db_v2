import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { AddressLinkInterface } from "./interfaces";
import Address from "./model";

// Define optional fields for creation
interface AddressLinkCreationInterface
  extends Optional<AddressLinkInterface, "id"> {}

// AddressLink model definition
class AddressLink
  extends Model<AddressLinkInterface, AddressLinkCreationInterface>
  implements AddressLinkInterface
{
  public id!: string;
  public addressId!: string;
  public entityId!: string;
  public entityType!: string;
  public addressType!: string;
  public isPrimary!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AddressLink.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Address,
        key: "id",
      },
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    addressType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "address_links",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for quick lookup of entity addresses
        fields: ["entityId", "entityType"],
      },
      {
        // Index for address type lookups
        fields: ["addressType"],
      },
      {
        // Unique constraint to ensure only one primary address per entity type
        unique: true,
        fields: ["entityId", "entityType", "addressType"],
        where: {
          isPrimary: true,
        },
      },
    ],
  }
);

export default AddressLink;
