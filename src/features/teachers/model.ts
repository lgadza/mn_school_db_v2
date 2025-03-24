import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { TeacherInterface } from "./interfaces/interfaces";
import User from "../users/model";
import School from "../schools/model";
import Department from "../school_config/departments/model";

// Define optional fields for creation
interface TeacherCreationInterface
  extends Optional<
    TeacherInterface,
    | "id"
    | "hireDate"
    | "qualificationId"
    | "title"
    | "employeeId"
    | "contractType"
    | "specialization"
    | "yearsOfExperience"
    | "teachingLoad"
    | "officeLocation"
    | "officeHours"
    | "bio"
    | "encryptedSalary"
    | "encryptedEmergencyContact"
    | "lastPromotionDate"
    | "notes"
    | "previousInstitutions"
    | "certifications"
    | "achievements"
    | "publications"
    | "currentStatus"
    | "primarySubjects"
    | "departmentId"
  > {}

// Teacher model definition
class Teacher
  extends Model<TeacherInterface, TeacherCreationInterface>
  implements TeacherInterface
{
  public id!: string;
  public userId!: string;
  public schoolId!: string;
  public departmentId!: string | null;
  public hireDate!: Date | null;
  public qualificationId!: string | null;
  public title!: string | null;
  public employeeId!: string | null;
  public contractType!: string | null;
  public specialization!: string | null;
  public yearsOfExperience!: number | null;
  public teachingLoad!: number | null;
  public officeLocation!: string | null;
  public officeHours!: string | null;
  public bio!: string | null;
  public encryptedSalary!: string | null;
  public encryptedEmergencyContact!: string | null;
  public lastPromotionDate!: Date | null;
  public notes!: string | null;
  public previousInstitutions!: string | null;
  public certifications!: string | null;
  public achievements!: string | null;
  public publications!: string | null;
  public currentStatus!: string | null;
  public primarySubjects!: string | null;
  public activeStatus!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public readonly user?: User;
  public readonly school?: School;
  public readonly department?: Department;

  // Helper methods
  public getFullName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : "";
  }

  // Static methods
  static async findByUserId(userId: string): Promise<Teacher | null> {
    return await Teacher.findOne({ where: { userId } });
  }
}

Teacher.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
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
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    qualificationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    employeeId: {
      type: new DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    contractType: {
      type: new DataTypes.STRING(50),
      allowNull: true,
    },
    specialization: {
      type: new DataTypes.STRING(150),
      allowNull: true,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    teachingLoad: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    officeLocation: {
      type: new DataTypes.STRING(100),
      allowNull: true,
    },
    officeHours: {
      type: new DataTypes.STRING(200),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    encryptedSalary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    encryptedEmergencyContact: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastPromotionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previousInstitutions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of previous institutions",
    },
    certifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of certifications",
    },
    achievements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of achievements",
    },
    publications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of publications",
    },
    currentStatus: {
      type: new DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Active",
    },
    primarySubjects: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of primary subjects",
    },
    activeStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "teachers",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "teacher_userId_idx",
        fields: ["userId"],
      },
      {
        name: "teacher_schoolId_idx",
        fields: ["schoolId"],
      },
      {
        name: "teacher_departmentId_idx",
        fields: ["departmentId"],
      },
      {
        name: "teacher_employeeId_idx",
        unique: true,
        fields: ["employeeId"],
        where: {
          employeeId: {
            [Op.ne]: null,
          },
        },
      },
      {
        name: "teacher_status_idx",
        fields: ["activeStatus", "currentStatus"],
      },
      {
        name: "teacher_contractType_idx",
        fields: ["contractType"],
      },
      {
        name: "teacher_hireDate_idx",
        fields: ["hireDate"],
      },
    ],
  }
);

export default Teacher;
