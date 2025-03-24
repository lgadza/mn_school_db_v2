import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { StudentInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface StudentCreationInterface
  extends Optional<
    StudentInterface,
    | "id"
    | "classId"
    | "guardianInfo"
    | "healthInfo"
    | "previousSchool"
    | "enrollmentNotes"
    | "academicRecords"
    | "attendanceRecords"
    | "disciplinaryRecords"
    | "specialNeeds"
    | "extracurricularActivities"
    | "documents"
    | "updatedAt"
    | "createdAt"
  > {}

// Student model definition
class Student
  extends Model<StudentInterface, StudentCreationInterface>
  implements StudentInterface
{
  public id!: string;
  public userId!: string;
  public schoolId!: string;
  public gradeId!: string;
  public classId!: string | null;
  public enrollmentDate!: Date;
  public studentNumber!: string;
  public guardianInfo!: string | null;
  public healthInfo!: string | null;
  public previousSchool!: string | null;
  public enrollmentNotes!: string | null;
  public academicRecords!: string | null;
  public attendanceRecords!: string | null;
  public disciplinaryRecords!: string | null;
  public specialNeeds!: string | null;
  public extracurricularActivities!: string | null;
  public documents!: string | null;
  public activeStatus!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  static async findByUserId(userId: string): Promise<Student | null> {
    return await Student.findOne({ where: { userId } });
  }

  static async findByStudentNumber(
    studentNumber: string
  ): Promise<Student | null> {
    return await Student.findOne({ where: { studentNumber } });
  }
}

Student.init(
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
    gradeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "grades",
        key: "id",
      },
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "classes",
        key: "id",
      },
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    studentNumber: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    guardianInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of guardian information",
    },
    healthInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON object of health information",
    },
    previousSchool: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON object of previous school information",
    },
    enrollmentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    academicRecords: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of academic records",
    },
    attendanceRecords: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of attendance records",
    },
    disciplinaryRecords: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of disciplinary records",
    },
    specialNeeds: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON object of special needs information",
    },
    extracurricularActivities: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of extracurricular activities",
    },
    documents: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of document links/references",
    },
    activeStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "students",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "student_userId_idx",
        fields: ["userId"],
      },
      {
        name: "student_schoolId_idx",
        fields: ["schoolId"],
      },
      {
        name: "student_gradeId_idx",
        fields: ["gradeId"],
      },
      {
        name: "student_classId_idx",
        fields: ["classId"],
      },
      {
        name: "student_studentNumber_idx",
        unique: true,
        fields: ["studentNumber"],
      },
      {
        name: "student_status_idx",
        fields: ["activeStatus"],
      },
      {
        name: "student_enrollmentDate_idx",
        fields: ["enrollmentDate"],
      },
    ],
  }
);

export default Student;
