import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { SchoolFeeInterface } from "./interfaces/interfaces";
import School from "../../schools/model";

// Define optional fields for creation (fields with default values or generated values like ID)
interface SchoolFeeCreationInterface
  extends Optional<SchoolFeeInterface, "id"> {}

// SchoolFee model definition
class SchoolFee
  extends Model<SchoolFeeInterface, SchoolFeeCreationInterface>
  implements SchoolFeeInterface
{
  public id!: string;
  public schoolId!: string;
  public name!: string;
  public description!: string | null;
  public amount!: number;
  public currency!: string;
  public frequency!: string;
  public dueDate!: Date | null;
  public isOptional!: boolean;
  public appliesTo!: string;
  public status!: string;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public category!: string;
  public lateFee!: number | null;
  public discountEligible!: boolean;
  public taxable!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual method to get formatted amount with currency
  public getFormattedAmount(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

SchoolFee.init(
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
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: new DataTypes.STRING(4),
      allowNull: false,
      defaultValue: "USD",
    },
    frequency: {
      type: new DataTypes.ENUM(
        "one-time",
        "term",
        "semester",
        "annual",
        "monthly",
        "quarterly"
      ),
      allowNull: false,
      defaultValue: "term",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    appliesTo: {
      type: new DataTypes.ENUM(
        "all",
        "new-students",
        "returning-students",
        "transfer-students",
        "selected-grades"
      ),
      allowNull: false,
      defaultValue: "all",
    },
    status: {
      type: new DataTypes.ENUM("active", "inactive", "pending", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    category: {
      type: new DataTypes.ENUM(
        "tuition",
        "books",
        "lab",
        "sports",
        "extracurricular",
        "transportation",
        "uniform",
        "examination",
        "development",
        "other"
      ),
      allowNull: false,
      defaultValue: "tuition",
    },
    lateFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discountEligible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    taxable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "school_fees",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "school_fee_school_idx",
        fields: ["schoolId"],
      },
      {
        name: "school_fee_category_idx",
        fields: ["category"],
      },
      {
        name: "school_fee_status_idx",
        fields: ["status"],
      },
      {
        name: "school_fee_frequency_idx",
        fields: ["frequency"],
      },
    ],
  }
);

SchoolFee.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

export default SchoolFee;
