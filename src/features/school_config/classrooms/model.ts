import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { ClassroomInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface ClassroomCreationInterface
  extends Optional<
    ClassroomInterface,
    "id" | "details" | "floor" | "features" | "status"
  > {}

// Classroom model definition
class Classroom
  extends Model<ClassroomInterface, ClassroomCreationInterface>
  implements ClassroomInterface
{
  public id!: string;
  public name!: string;
  public roomType!: string;
  public maxStudents!: number;
  public blockId!: string;
  public schoolId!: string;
  public details!: string | null;
  public floor!: number | null;
  public features!: string[] | null;
  public status!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isActive(): boolean {
    return this.status === "active";
  }
}

Classroom.init(
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
    roomType: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [
          [
            "standard",
            "laboratory",
            "computer_lab",
            "library",
            "auditorium",
            "gymnasium",
            "art_studio",
            "music_room",
            "staff_room",
            "other",
          ],
        ],
      },
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    blockId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "blocks",
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
    details: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    status: {
      type: new DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "maintenance", "renovation", "closed"]],
      },
    },
  },
  {
    tableName: "classrooms",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "classroom_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for block searches
        name: "classroom_block_idx",
        fields: ["blockId"],
      },
      {
        // Index for classroom name searches
        name: "classroom_name_idx",
        fields: ["name"],
      },
      {
        // Index for room type searches
        name: "classroom_roomtype_idx",
        fields: ["roomType"],
      },
      {
        // Index for status searches
        name: "classroom_status_idx",
        fields: ["status"],
      },
    ],
  }
);

export default Classroom;
