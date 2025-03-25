import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { BehaviorTypeInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface BehaviorTypeCreationInterface
  extends Optional<BehaviorTypeInterface, "id"> {}

// BehaviorType model definition
class BehaviorType
  extends Model<BehaviorTypeInterface, BehaviorTypeCreationInterface>
  implements BehaviorTypeInterface
{
  public id!: string;
  public description!: string;
  public category!: "POSITIVE" | "NEGATIVE";
  public schoolId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isPositive(): boolean {
    return this.category === "POSITIVE";
  }
}

BehaviorType.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    description: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("POSITIVE", "NEGATIVE"),
      allowNull: false,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
  },
  {
    tableName: "behavior_types",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "behavior_type_school_idx",
        fields: ["schoolId"],
      },
      {
        name: "behavior_type_category_idx",
        fields: ["category"],
      },
    ],
  }
);

export default BehaviorType;
