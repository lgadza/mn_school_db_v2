import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { ProjectFileInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface ProjectFileCreationInterface
  extends Optional<
    ProjectFileInterface,
    | "id"
    | "description"
    | "fileSize"
    | "fileType"
    | "filePath"
    | "thumbnailUrl"
    | "downloadCount"
  > {}

// ProjectFile model definition
class ProjectFile
  extends Model<ProjectFileInterface, ProjectFileCreationInterface>
  implements ProjectFileInterface
{
  public id!: string;
  public projectId!: string;
  public filename!: string;
  public description!: string | null;
  public fileSize!: number | null;
  public fileType!: string | null;
  public filePath!: string | null;
  public uploadedById!: string;
  public fileUrl!: string;
  public thumbnailUrl!: string | null;
  public downloadCount!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual fields from associations
  public project?: any;
  public uploadedBy?: any;
}

ProjectFile.init(
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
    filename: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fileType: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    filePath: {
      type: new DataTypes.STRING(500),
      allowNull: true,
    },
    uploadedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    fileUrl: {
      type: new DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnailUrl: {
      type: new DataTypes.STRING(500),
      allowNull: true,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "project_files",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "project_file_project_idx",
        fields: ["projectId"],
      },
      {
        name: "project_file_uploader_idx",
        fields: ["uploadedById"],
      },
      {
        name: "project_file_name_idx",
        fields: ["filename"],
      },
    ],
  }
);

export default ProjectFile;
