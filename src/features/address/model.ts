import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { AddressInterface } from "./interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface AddressCreationInterface extends Optional<AddressInterface, "id"> {}

// Address model definition
class Address
  extends Model<AddressInterface, AddressCreationInterface>
  implements AddressInterface
{
  public id!: string;
  public buildingNumber!: string;
  public street!: string;
  public city!: string;
  public province!: string;
  public addressLine2!: string | null;
  public postalCode!: string | null;
  public country!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Format full address as a string
  public getFormattedAddress(): string {
    let formattedAddress = `${this.buildingNumber} ${this.street}`;

    if (this.addressLine2) {
      formattedAddress += `, ${this.addressLine2}`;
    }

    formattedAddress += `, ${this.city}, ${this.province}`;

    if (this.postalCode) {
      formattedAddress += ` ${this.postalCode}`;
    }

    formattedAddress += `, ${this.country}`;

    return formattedAddress;
  }
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    buildingNumber: {
      type: new DataTypes.STRING(20),
      allowNull: false,
    },
    street: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    addressLine2: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "addresses",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for city searches
        fields: ["city"],
      },
      {
        // Index for province searches
        fields: ["province"],
      },
      {
        // Index for country searches
        fields: ["country"],
      },
      {
        // Composite index for address searches
        fields: ["buildingNumber", "street", "city", "country"],
      },
    ],
  }
);

export default Address;
