import User from "../../../users/model";
import School from "../../../schools/model";
import Grade from "../../../school_config/grades/model";
import Class from "../../../school_config/classes/model";

/**
 * Student interface
 * Defines the core structure of a student
 */
export interface StudentInterface {
  id: string;
  userId: string;
  schoolId: string;
  gradeId: string;
  classId?: string | null;
  enrollmentDate: Date;
  studentNumber: string;
  guardianInfo?: string | null;
  healthInfo?: string | null;
  previousSchool?: string | null;
  enrollmentNotes?: string | null;
  academicRecords?: string | null;
  attendanceRecords?: string | null;
  disciplinaryRecords?: string | null;
  specialNeeds?: string | null;
  extracurricularActivities?: string | null;
  documents?: string | null;
  activeStatus: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  user?: User;
  school?: School;
  grade?: Grade;
  class?: Class;
}

/**
 * Guardian information structure
 */
export interface GuardianInfo {
  relationship: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  occupation?: string;
  isEmergencyContact: boolean;
  canPickupStudent: boolean;
}

/**
 * Health information structure
 */
export interface HealthInfo {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  doctorName?: string;
  doctorContact?: string;
  insuranceInfo?: string;
  lastCheckup?: string;
  vaccinationStatus?: string;
}

/**
 * Previous school information structure
 */
export interface PreviousSchoolInfo {
  name?: string;
  address?: string;
  contactInfo?: string;
  attendedFrom?: string;
  attendedTo?: string;
  gradeCompleted?: string;
  reasonForLeaving?: string;
  transcriptReceived?: boolean;
}

/**
 * Academic record entry structure
 */
export interface AcademicRecord {
  term: string;
  year: string;
  grades: {
    subject: string;
    score: number;
    grade: string;
    comments?: string;
  }[];
  gpa?: number;
  rank?: number;
  teacherComments?: string;
}

/**
 * Student statistics interface
 */
export interface StudentStatistics {
  totalStudents: number;
  studentsPerSchool: { [schoolId: string]: number };
  studentsPerGrade: { [gradeId: string]: number };
  studentsPerClass: { [classId: string]: number };
  activeStudents: number;
  inactiveStudents: number;
  enrollmentsByYear: { [year: string]: number };
  enrollmentsByMonth: { [month: string]: number };
}
