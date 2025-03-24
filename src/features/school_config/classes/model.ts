import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { ClassInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface ClassCreationInterface
  extends Optional<
    ClassInterface,
    "id" | "status" | "studentCount" | "combination"
  > {}

// Class model definition
class Class
  extends Model<ClassInterface, ClassCreationInterface>
  implements ClassInterface
{
  public id!: string;
  public name!: string;
  public teacherId!: string | null;
  public gradeId!: string;
  public sectionId!: string | null;
  public departmentId!: string | null;
  public capacity!: number | null;
  public schoolId!: string;
  public details!: string | null;
  public color!: string | null;
  public studentCount!: number | null;
  public scheduleId!: string | null;
  public classroomId!: string | null;
  public schoolYearId!: string;
  public classType!: string | null;
  public combination!: string;
  public status!: "active" | "archived";

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public getCapacityStatus(): string {
    if (!this.capacity || !this.studentCount) return "Unknown";

    const utilization = (this.studentCount / this.capacity) * 100;

    if (utilization < 50) return "Low";
    if (utilization < 80) return "Medium";
    if (utilization < 100) return "High";
    return "Full";
  }

  // Generate combination string
  public static generateCombination(data: {
    gradeId: string;
    sectionId?: string | null;
    schoolYearId: string;
  }): string {
    const parts = [data.gradeId];

    if (data.sectionId) {
      parts.push(data.sectionId);
    }

    parts.push(data.schoolYearId);

    return parts.join(":");
  }
}

Class.init(
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
    teacherId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "teachers",
        key: "id",
      },
    },
    gradeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "grades",
        key: "id",
      },
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "sections",
        key: "id",
      },
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    color: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    studentCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    classroomId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "classrooms",
        key: "id",
      },
    },
    schoolYearId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    classType: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    combination: {
      type: new DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "classes",
    sequelize,
    timestamps: true,
    hooks: {
      beforeCreate: (instance: Class) => {
        // Generate combination string if not provided
        if (!instance.combination) {
          instance.combination = Class.generateCombination({
            gradeId: instance.gradeId,
            sectionId: instance.sectionId,
            schoolYearId: instance.schoolYearId,
          });
        }
      },
      beforeUpdate: (instance: Class) => {
        // Regenerate combination if related fields changed
        if (
          instance.changed("gradeId") ||
          instance.changed("sectionId") ||
          instance.changed("schoolYearId")
        ) {
          instance.combination = Class.generateCombination({
            gradeId: instance.gradeId,
            sectionId: instance.sectionId,
            schoolYearId: instance.schoolYearId,
          });
        }
      },
    },
    indexes: [
      {
        // Index for school searches
        name: "class_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for teacher searches
        name: "class_teacher_idx",
        fields: ["teacherId"],
      },
      {
        // Index for grade searches
        name: "class_grade_idx",
        fields: ["gradeId"],
      },
      {
        // Index for section searches
        name: "class_section_idx",
        fields: ["sectionId"],
      },
      {
        // Index for department searches
        name: "class_department_idx",
        fields: ["departmentId"],
      },
      {
        // Index for classroom searches
        name: "class_classroom_idx",
        fields: ["classroomId"],
      },
      {
        // Index for school year searches
        name: "class_school_year_idx",
        fields: ["schoolYearId"],
      },
      {
        // Index for status searches
        name: "class_status_idx",
        fields: ["status"],
      },
      {
        // Index for combination (uniqueness)
        name: "class_combination_idx",
        fields: ["combination"],
        unique: true,
      },
      {
        // Index for class name searches
        name: "class_name_idx",
        fields: ["name"],
      },
    ],
  }
);

export default Class;
