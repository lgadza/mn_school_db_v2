import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { SubjectInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface SubjectCreationInterface
  extends Optional<
    SubjectInterface,
    | "id"
    | "sortOrder"
    | "code"
    | "description"
    | "isDefault"
    | "categoryId"
    | "prerequisite"
    | "departmentId"
    | "credits"
    | "compulsory"
    | "syllabus"
  > {}

// Subject model definition
class Subject
  extends Model<SubjectInterface, SubjectCreationInterface>
  implements SubjectInterface
{
  public id!: string;
  public name!: string;
  public sortOrder!: number | null;
  public code!: string | null;
  public description!: string | null;
  public level!: string;
  public isDefault!: boolean;
  public schoolId!: string;
  public categoryId!: string | null;
  public prerequisite!: string | null;
  public departmentId!: string | null;
  public credits!: number | null;
  public compulsory!: boolean;
  public syllabus!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public getFullName(): string {
    return `${this.name}${this.code ? ` (${this.code})` : ""}`;
  }
}

Subject.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(150),
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    code: {
      type: new DataTypes.STRING(30),
      allowNull: true,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    level: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
    },
    prerequisite: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "subjects", // Self-reference
        key: "id",
      },
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    credits: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    compulsory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    syllabus: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
  },
  {
    tableName: "subjects",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "subject_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for category searches
        name: "subject_category_idx",
        fields: ["categoryId"],
      },
      {
        // Index for department searches
        name: "subject_department_idx",
        fields: ["departmentId"],
      },
      {
        // Index for subject level searches
        name: "subject_level_idx",
        fields: ["level"],
      },
      {
        // Index for subject name searches
        name: "subject_name_idx",
        fields: ["name"],
      },
      {
        // Index for subject code searches (unique per school)
        name: "subject_code_school_idx",
        fields: ["code", "schoolId"],
        unique: true,
        where: {
          code: {
            [Op.ne]: null,
          },
        },
      },
      {
        // Index for compulsory subjects
        name: "subject_compulsory_idx",
        fields: ["compulsory"],
      },
      {
        // Index for default subject searches
        name: "default_subject_idx",
        fields: ["schoolId", "isDefault"],
      },
    ],
  }
);

export default Subject;
