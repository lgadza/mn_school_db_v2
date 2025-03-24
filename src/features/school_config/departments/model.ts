import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { DepartmentInterface } from "./interfaces/interfaces";

// Define optional fields for creation (fields with default values or generated values like ID)
interface DepartmentCreationInterface
  extends Optional<DepartmentInterface, "id" | "isDefault" | "code"> {}

// Department model definition
class Department
  extends Model<DepartmentInterface, DepartmentCreationInterface>
  implements DepartmentInterface
{
  public id!: string;
  public name!: string;
  public code!: string | null;
  public description!: string | null;
  public headOfDepartmentId!: string | null;
  public contactEmail!: string | null;
  public phoneNumber!: string | null;
  public facultyCount!: number | null;
  public studentCount!: number | null;
  public location!: string | null;
  public budget!: number | null;
  public schoolId!: string;
  public isDefault!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public getFullName(): string {
    return `${this.name}${this.code ? ` (${this.code})` : ""}`;
  }
}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: new DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    headOfDepartmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    contactEmail: {
      type: new DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    facultyCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    studentCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    location: {
      type: new DataTypes.STRING(150),
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(14, 2),
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
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "departments",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for department code searches
        name: "department_code_idx",
        unique: true,
        fields: ["code"],
        where: {
          code: {
            [Op.ne]: null,
          },
        },
      },
      {
        // Index for school searches
        name: "department_school_idx",
        fields: ["schoolId"],
      },
      {
        // Index for head of department searches
        name: "head_of_department_idx",
        fields: ["headOfDepartmentId"],
      },
      {
        // Index for default department searches
        name: "default_department_idx",
        fields: ["schoolId", "isDefault"],
      },
      {
        // Index for department name searches
        name: "department_name_idx",
        fields: ["name"],
      },
    ],
  }
);

export default Department;
