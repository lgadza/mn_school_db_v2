import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import {
  ProjectFeedbackInterface,
  FeedbackType,
} from "./interfaces/interfaces";

// Define optional fields for creation
interface ProjectFeedbackCreationInterface
  extends Optional<
    ProjectFeedbackInterface,
    "id" | "parentId" | "status" | "isPrivate"
  > {}

// ProjectFeedback model definition
class ProjectFeedback
  extends Model<ProjectFeedbackInterface, ProjectFeedbackCreationInterface>
  implements ProjectFeedbackInterface
{
  public id!: string;
  public projectId!: string;
  public content!: string;
  public type!: FeedbackType;
  public authorId!: string;
  public parentId!: string | null;
  public status!: "active" | "archived" | "deleted";
  public isPrivate!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual fields from associations
  public project?: any;
  public author?: any;
  public parent?: any;
  public replies?: any[];
}

ProjectFeedback.init(
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
    content: {
      type: new DataTypes.TEXT(),
      allowNull: false,
    },
    type: {
      type: new DataTypes.ENUM(
        "comment",
        "suggestion",
        "correction",
        "praise",
        "question"
      ),
      allowNull: false,
      defaultValue: "comment",
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "project_feedback",
        key: "id",
      },
    },
    status: {
      type: new DataTypes.ENUM("active", "archived", "deleted"),
      allowNull: false,
      defaultValue: "active",
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "project_feedback",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "project_feedback_project_idx",
        fields: ["projectId"],
      },
      {
        name: "project_feedback_author_idx",
        fields: ["authorId"],
      },
      {
        name: "project_feedback_parent_idx",
        fields: ["parentId"],
      },
      {
        name: "project_feedback_status_idx",
        fields: ["status"],
      },
    ],
  }
);

export default ProjectFeedback;
