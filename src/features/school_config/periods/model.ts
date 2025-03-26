import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { PeriodInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface PeriodCreationInterface
  extends Optional<PeriodInterface, "id" | "duration"> {}

// Period model definition
class Period
  extends Model<PeriodInterface, PeriodCreationInterface>
  implements PeriodInterface
{
  public id!: string;
  public name!: string;
  public startTime!: string;
  public endTime!: string;
  public duration!: number;
  public section!: "morning" | "afternoon" | "evening";
  public schoolId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isOverlapping(otherPeriod: Period): boolean {
    const thisStart = this.convertTimeToMinutes(this.startTime);
    const thisEnd = this.convertTimeToMinutes(this.endTime);
    const otherStart = this.convertTimeToMinutes(otherPeriod.startTime);
    const otherEnd = this.convertTimeToMinutes(otherPeriod.endTime);

    // Check for overlap - if one period starts before the other ends
    return thisStart < otherEnd && thisEnd > otherStart;
  }

  public convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Static method to check if a period name already exists for a school
  public static async nameExistsForSchool(
    name: string,
    schoolId: string,
    excludeId?: string
  ): Promise<boolean> {
    const query: any = { where: { name, schoolId } };

    if (excludeId) {
      query.where.id = { [Op.ne]: excludeId };
    }

    const count = await Period.count(query);
    return Number(count) > 0;
  }
}

Period.init(
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
    startTime: {
      type: new DataTypes.STRING(5), // Format: "HH:MM"
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    endTime: {
      type: new DataTypes.STRING(5), // Format: "HH:MM"
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    section: {
      type: DataTypes.ENUM("morning", "afternoon", "evening"),
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
    tableName: "periods",
    sequelize,
    timestamps: true,
    hooks: {
      beforeValidate: (period: Period) => {
        // Calculate duration if not provided
        if (!period.duration) {
          const startTime = period.convertTimeToMinutes(period.startTime);
          const endTime = period.convertTimeToMinutes(period.endTime);
          period.duration = endTime - startTime;
        }
      },
    },
    indexes: [
      {
        name: "period_school_idx",
        fields: ["schoolId"],
      },
      {
        name: "period_section_idx",
        fields: ["section"],
      },
      {
        name: "period_times_idx",
        fields: ["startTime", "endTime"],
      },
      {
        // Add unique constraint on period name per school
        name: "period_name_school_unique_idx",
        unique: true,
        fields: ["name", "schoolId"],
      },
    ],
  }
);

export default Period;
