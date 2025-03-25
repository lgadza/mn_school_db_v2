import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { BehaviorInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface BehaviorCreationInterface
  extends Optional<
    BehaviorInterface,
    | "id"
    | "moduleId"
    | "lessonId"
    | "description"
    | "actionTaken"
    | "resolutionStatus"
    | "priority"
    | "attachments"
    | "createdById"
    | "modifiedById"
  > {}

// Behavior model definition
class Behavior
  extends Model<BehaviorInterface, BehaviorCreationInterface>
  implements BehaviorInterface
{
  public id!: string;
  public studentId!: string;
  public studentName!: string;
  public schoolId!: string;
  public behaviorTypeId!: string;
  public classId!: string;
  public moduleId!: string | null;
  public lessonId!: string | null;
  public dateOfIncident!: Date;
  public description!: string | null;
  public actionTaken!: string | null;
  public staffId!: string;
  public resolutionStatus!:
    | "Pending"
    | "Resolved"
    | "Dismissed"
    | "Under Investigation";
  public priority!: "High" | "Medium" | "Low";
  public attachments!: string | null;
  public createdById!: string | null;
  public modifiedById!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isResolved(): boolean {
    return this.resolutionStatus === "Resolved";
  }

  public isHighPriority(): boolean {
    return this.priority === "High";
  }
}

Behavior.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    studentName: {
      type: new DataTypes.STRING(255),
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
    behaviorTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "behavior_types",
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
    moduleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dateOfIncident: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    actionTaken: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    resolutionStatus: {
      type: DataTypes.ENUM(
        "Pending",
        "Resolved",
        "Dismissed",
        "Under Investigation"
      ),
      defaultValue: "Pending",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("High", "Medium", "Low"),
      defaultValue: "Medium",
      allowNull: false,
    },
    attachments: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    modifiedById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "behaviors",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "behavior_school_idx",
        fields: ["schoolId"],
      },
      {
        name: "behavior_student_idx",
        fields: ["studentId"],
      },
      {
        name: "behavior_class_idx",
        fields: ["classId"],
      },
      {
        name: "behavior_type_idx",
        fields: ["behaviorTypeId"],
      },
      {
        name: "behavior_date_idx",
        fields: ["dateOfIncident"],
      },
      {
        name: "behavior_status_idx",
        fields: ["resolutionStatus"],
      },
      {
        name: "behavior_priority_idx",
        fields: ["priority"],
      },
    ],
  }
);

export default Behavior;
