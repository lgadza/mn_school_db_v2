import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { CategoryInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface CategoryCreationInterface
  extends Optional<CategoryInterface, "id" | "code" | "description"> {}

// Category model definition
class Category
  extends Model<CategoryInterface, CategoryCreationInterface>
  implements CategoryInterface
{
  public id!: string;
  public name!: string;
  public code!: string | null;
  public schoolId!: string;
  public description!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public getFullName(): string {
    return `${this.name}${this.code ? ` (${this.code})` : ""}`;
  }
}

Category.init(
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
    code: {
      type: new DataTypes.STRING(50),
      allowNull: true,
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
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
  },
  {
    tableName: "categories",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "category_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for category name searches
        name: "category_name_idx",
        fields: ["name"],
      },
      {
        // Index for category code searches (unique per school)
        name: "category_code_school_idx",
        fields: ["code", "schoolId"],
        unique: true,
        where: {
          code: {
            [Op.ne]: null,
          },
        },
      },
    ],
  }
);

export default Category;
