import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { SectionInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface SectionCreationInterface
  extends Optional<
    SectionInterface,
    "id" | "capacity" | "details" | "color" | "startDate" | "endDate"
  > {}

// Section model definition
class Section
  extends Model<SectionInterface, SectionCreationInterface>
  implements SectionInterface
{
  public id!: string;
  public name!: string;
  public schoolId!: string;
  public capacity!: number | null;
  public details!: string | null;
  public color!: string | null;
  public startDate!: Date | null;
  public endDate!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isActive(): boolean {
    const now = new Date();
    if (!this.startDate || !this.endDate) return true;
    return this.startDate <= now && this.endDate >= now;
  }
}

Section.init(
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
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    details: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    color: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "sections",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "section_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for section name searches
        name: "section_name_idx",
        fields: ["name"],
      },
      {
        // Index for date range searches
        name: "section_dates_idx",
        fields: ["startDate", "endDate"],
      },
    ],
  }
);

export default Section;
