import User from "../../users/model";
import School from "../../schools/model";
import Department from "../../departments/model";

/**
 * Teacher interface
 * Defines the core structure of a teacher
 */
export interface TeacherInterface {
  id: string;
  userId: string;
  schoolId: string;
  departmentId?: string | null;
  hireDate?: Date | null;
  qualificationId?: string | null;
  title?: string | null;
  employeeId?: string | null;
  contractType?: string | null;
  specialization?: string | null;
  yearsOfExperience?: number | null;
  teachingLoad?: number | null;
  officeLocation?: string | null;
  officeHours?: string | null;
  bio?: string | null;
  encryptedSalary?: string | null;
  encryptedEmergencyContact?: string | null;
  lastPromotionDate?: Date | null;
  notes?: string | null;
  previousInstitutions?: string | null;
  certifications?: string | null;
  achievements?: string | null;
  publications?: string | null;
  currentStatus?: string | null;
  primarySubjects?: string | null;
  activeStatus: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  user?: User;
  school?: School;
  department?: Department;
}

/**
 * Sensitive teacher data that requires encryption/decryption
 */
export interface TeacherSensitiveData {
  salary?: number | null;
  emergencyContact?: string | null;
}

/**
 * Teacher statistics interface
 */
export interface TeacherStatistics {
  totalTeachers: number;
  teachersPerSchool: { [schoolId: string]: number };
  teachersPerDepartment: { [departmentId: string]: number };
  teachersByStatus: { [status: string]: number };
  teachersByContractType: { [contractType: string]: number };
  averageYearsOfExperience: number;
  averageTeachingLoad: number;
}
