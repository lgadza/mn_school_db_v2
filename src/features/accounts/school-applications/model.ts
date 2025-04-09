import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { SchoolApplicationInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface SchoolApplicationCreationInterface
  extends Optional<
    SchoolApplicationInterface,
    "id" | "notes" | "updatedAt" | "createdAt"
  > {}

// SchoolApplication model definition
class SchoolApplication
  extends Model<SchoolApplicationInterface, SchoolApplicationCreationInterface>
  implements SchoolApplicationInterface
{
  public id!: string;
  public prospectId!: string;
  public schoolId!: string;
  public applicationDate!: Date;
  public status!: string;
  public applicationDocumentIds!: string[];
  public notes!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  static async findByProspectId(
    prospectId: string
  ): Promise<SchoolApplication[]> {
    return await SchoolApplication.findAll({ where: { prospectId } });
  }

  static async findBySchoolId(schoolId: string): Promise<SchoolApplication[]> {
    return await SchoolApplication.findAll({ where: { schoolId } });
  }
}

SchoolApplication.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    prospectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "prospects",
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
    applicationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(
        "submitted",
        "reviewing",
        "accepted",
        "rejected",
        "waitlisted"
      ),
      allowNull: false,
      defaultValue: "submitted",
    },
    applicationDocumentIds: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "school_applications",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "school_application_prospectId_idx",
        fields: ["prospectId"],
      },
      {
        name: "school_application_schoolId_idx",
        fields: ["schoolId"],
      },
      {
        name: "school_application_status_idx",
        fields: ["status"],
      },
      {
        name: "school_application_applicationDate_idx",
        fields: ["applicationDate"],
      },
    ],
  }
);

export default SchoolApplication;
