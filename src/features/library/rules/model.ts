import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";

// Define the interface for the rental rules
export interface RentalRuleInterface {
  id: string;
  name: string;
  rentalPeriodDays: number;
  maxBooksPerStudent: number;
  renewalAllowed: boolean;
  lateFeePerDay?: number | null;
  schoolId: string;
  description?: string | null;
  renewalLimit?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define optional fields for creation
interface RentalRuleCreationInterface
  extends Optional<
    RentalRuleInterface,
    "id" | "renewalLimit" | "lateFeePerDay" | "description"
  > {}

// RentalRule model definition
class RentalRule
  extends Model<RentalRuleInterface, RentalRuleCreationInterface>
  implements RentalRuleInterface
{
  public id!: string;
  public name!: string;
  public rentalPeriodDays!: number;
  public maxBooksPerStudent!: number;
  public renewalAllowed!: boolean;
  public lateFeePerDay!: number | null;
  public schoolId!: string;
  public description!: string | null;
  public renewalLimit!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RentalRule.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    rentalPeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    maxBooksPerStudent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    renewalAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lateFeePerDay: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    renewalLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "rental_rules",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "rental_rule_school_id_idx",
        fields: ["schoolId"],
      },
    ],
  }
);

export default RentalRule;
