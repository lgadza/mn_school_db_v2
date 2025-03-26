import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import {
  ProjectInterface,
  ProjectStatus,
  ProjectDifficulty,
} from "./interfaces/interfaces";

// Define optional fields for creation
interface ProjectCreationInterface
  extends Optional<
    ProjectInterface,
    | "id"
    | "description"
    | "instructions"
    | "dueDate"
    | "assignedDate"
    | "classId"
    | "difficulty"
    | "maxPoints"
    | "modifiedById"
  > {}

// Project model definition
class Project
  extends Model<ProjectInterface, ProjectCreationInterface>
  implements ProjectInterface
{
  public id!: string;
  public title!: string;
  public description!: string | null;
  public instructions!: string | null;
  public dueDate!: Date | null;
  public assignedDate!: Date | null;
  public status!: ProjectStatus;
  public subjectId!: string;
  public classId!: string | null;
  public teacherId!: string;
  public schoolId!: string;
  public difficulty!: ProjectDifficulty | null;
  public maxPoints!: number | null;
  public isGroupProject!: boolean;
  public createdById!: string;
  public modifiedById!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual fields from associations
  public subject?: any;
  public class?: any;
  public teacher?: any;
  public school?: any;
  public createdBy?: any;
  public modifiedBy?: any;
  public files?: any[];
  public grades?: any[];
  public feedback?: any[];
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: new DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    instructions: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: new DataTypes.ENUM(
        "draft",
        "assigned",
        "in_progress",
        "completed",
        "archived"
      ),
      allowNull: false,
      defaultValue: "draft",
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
      allowNull: true,
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
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    difficulty: {
      type: new DataTypes.ENUM("easy", "medium", "hard", "advanced"),
      allowNull: true,
    },
    maxPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isGroupProject: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
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
  },
  {
    tableName: "projects",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "project_title_idx",
        fields: ["title"],
      },
      {
        name: "project_school_idx",
        fields: ["schoolId"],
      },
      {
        name: "project_subject_idx",
        fields: ["subjectId"],
      },
      {
        name: "project_class_idx",
        fields: ["classId"],
      },
      {
        name: "project_teacher_idx",
        fields: ["teacherId"],
      },
      {
        name: "project_status_idx",
        fields: ["status"],
      },
      {
        name: "project_due_date_idx",
        fields: ["dueDate"],
      },
    ],
  }
);

export default Project;
