import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { ModuleInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface ModuleCreationInterface
  extends Optional<
    ModuleInterface,
    | "id"
    | "description"
    | "assistantTeacherId"
    | "createdById"
    | "modifiedById"
    | "classType"
    | "classroomId"
    | "materials"
    | "studentGroupId"
    | "termId"
    | "totalStudents"
  > {}

// Module model definition
class Module
  extends Model<ModuleInterface, ModuleCreationInterface>
  implements ModuleInterface
{
  public id!: string;
  public name!: string;
  public description!: string | null;
  public subjectId!: string;
  public classId!: string;
  public teacherId!: string;
  public assistantTeacherId!: string | null;
  public schoolId!: string;
  public createdById!: string | null;
  public modifiedById!: string | null;
  public classType!: string | null;
  public classroomId!: string | null;
  public materials!: string | null;
  public studentGroupId!: string | null;
  public termId!: string | null;
  public totalStudents!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual fields from associations
  public subject?: any;
  public class?: any;
  public teacher?: any;
  public assistantTeacher?: any;
  public school?: any;
  public classroom?: any;

  // Helper methods
  public getFullName(): string {
    return `${this.name} (${this.subject?.name || "Unknown Subject"})`;
  }
}

Module.init(
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
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "classes",
        key: "id",
      },
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "teachers",
        key: "id",
      },
    },
    assistantTeacherId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "teachers",
        key: "id",
      },
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    modifiedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    classType: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    classroomId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "classrooms",
        key: "id",
      },
    },
    materials: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    studentGroupId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    termId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "modules",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "module_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for class searches
        name: "module_class_idx",
        fields: ["classId"],
      },
      {
        // Index for subject searches
        name: "module_subject_idx",
        fields: ["subjectId"],
      },
      {
        // Index for teacher searches
        name: "module_teacher_idx",
        fields: ["teacherId"],
      },
      {
        // Index for assistant teacher searches
        name: "module_assistant_teacher_idx",
        fields: ["assistantTeacherId"],
      },
      {
        // Index for classroom searches
        name: "module_classroom_idx",
        fields: ["classroomId"],
      },
      {
        // Index for term searches
        name: "module_term_idx",
        fields: ["termId"],
      },
      {
        // Index for module name searches
        name: "module_name_idx",
        fields: ["name"],
      },
      {
        // Composite index for unique module name within a class
        name: "module_class_name_idx",
        fields: ["classId", "name"],
        unique: true,
      },
    ],
  }
);

export default Module;
