import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { ProjectGradeInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface ProjectGradeCreationInterface
  extends Optional<
    ProjectGradeInterface,
    "id" | "comments" | "submissionDate" | "status"
  > {}

// ProjectGrade model definition
class ProjectGrade
  extends Model<ProjectGradeInterface, ProjectGradeCreationInterface>
  implements ProjectGradeInterface
{
  public id!: string;
  public projectId!: string;
  public studentId!: string;
  public graderId!: string;
  public score!: number;
  public maxScore!: number;
  public comments!: string | null;
  public submissionDate!: Date | null;
  public gradedDate!: Date;
  public status!: "pending" | "graded" | "revised" | "final";

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual fields from associations
  public project?: any;
  public student?: any;
  public grader?: any;
}

ProjectGrade.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
    },
    graderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    comments: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gradedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: new DataTypes.ENUM("pending", "graded", "revised", "final"),
      allowNull: false,
      defaultValue: "graded",
    },
  },
  {
    tableName: "project_grades",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "project_grade_project_idx",
        fields: ["projectId"],
      },
      {
        name: "project_grade_student_idx",
        fields: ["studentId"],
      },
      {
        name: "project_grade_grader_idx",
        fields: ["graderId"],
      },
      {
        name: "project_grade_status_idx",
        fields: ["status"],
      },
      {
        name: "project_grade_project_student_idx",
        fields: ["projectId", "studentId"],
        unique: true,
      },
    ],
  }
);

export default ProjectGrade;
