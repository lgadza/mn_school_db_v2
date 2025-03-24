/**
 * Class interface
 * Defines the core structure of a class
 */
export interface ClassInterface {
  id: string;
  name: string;
  teacherId: string | null;
  gradeId: string;
  sectionId: string | null;
  departmentId: string | null;
  capacity: number | null;
  schoolId: string;
  details: string | null;
  color: string | null;
  studentCount: number | null;
  scheduleId: string | null;
  classroomId: string | null;
  schoolYearId: string;
  classType: string | null;
  combination: string;
  status: "active" | "archived";
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
  teacher?: any;
  grade?: any;
  section?: any;
  department?: any;
  classroom?: any;
  schedule?: any;
  schoolYear?: any;
}

/**
 * Class statistics interface
 */
export interface ClassStatistics {
  totalClasses: number;
  classesPerSchool: { [schoolId: string]: number };
  classesPerGrade: { [gradeId: string]: number };
  classesPerTeacher: { [teacherId: string]: number };
  activeClassesCount: number;
  archivedClassesCount: number;
  averageCapacity: number;
  averageStudentCount: number;
  classesByType: { [type: string]: number };
  capacityUtilization: number; // Percentage of total capacity being utilized
}
