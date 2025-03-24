import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { GradeInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface GradeCreationInterface
  extends Optional<GradeInterface, "id" | "applicationOpen"> {}

// Grade model definition
class Grade
  extends Model<GradeInterface, GradeCreationInterface>
  implements GradeInterface
{
  public id!: string;
  public name!: string;
  public details!: string | null;
  public schoolId!: string;
  public applicationOpen!: boolean;
  public minAge!: number | null;
  public teacherId!: string | null;
  public maxAge!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public getAgeRange(): string {
    if (this.minAge && this.maxAge) {
      return `${this.minAge} - ${this.maxAge} years`;
    } else if (this.minAge) {
      return `${this.minAge}+ years`;
    } else if (this.maxAge) {
      return `Up to ${this.maxAge} years`;
    }
    return "No age restriction";
  }
}

Grade.init(
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
    details: {
      type: new DataTypes.TEXT(),
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
    applicationOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "teachers",
        key: "id",
      },
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "grades",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "grade_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for teacher searches
        name: "grade_teacher_idx",
        fields: ["teacherId"],
      },
      {
        // Index for application status searches
        name: "grade_application_idx",
        fields: ["applicationOpen"],
      },
      {
        // Index for grade name searches
        name: "grade_name_idx",
        fields: ["name"],
      },
    ],
  }
);

export default Grade;
