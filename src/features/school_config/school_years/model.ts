import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { SchoolYearInterface, SchoolYearStatus } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface SchoolYearCreationInterface
  extends Optional<SchoolYearInterface, "id" | "status"> {}

// SchoolYear model definition
class SchoolYear
  extends Model<SchoolYearInterface, SchoolYearCreationInterface>
  implements SchoolYearInterface
{
  public id!: string;
  public year!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: string | null;
  public schoolId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isActive(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
  }

  public isCurrent(): boolean {
    return this.status === SchoolYearStatus.ACTIVE;
  }

  public isUpcoming(): boolean {
    return this.status === SchoolYearStatus.UPCOMING;
  }

  public isCompleted(): boolean {
    return this.status === SchoolYearStatus.COMPLETED;
  }
}

SchoolYear.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    year: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: new DataTypes.STRING(20),
      allowNull: true,
      defaultValue: SchoolYearStatus.UPCOMING,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
  },
  {
    tableName: "school_years",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for school searches
        name: "school_year_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for year searches
        name: "school_year_year_idx",
        fields: ["year"],
      },
      {
        // Index for date range searches
        name: "school_year_dates_idx",
        fields: ["startDate", "endDate"],
      },
      {
        // Index for status searches
        name: "school_year_status_idx",
        fields: ["status"],
      },
    ],
  }
);

export default SchoolYear;
