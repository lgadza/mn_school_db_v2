/**
 * Grade interface
 * Defines the core structure of a grade
 */
export interface GradeInterface {
  id: string;
  name: string;
  details: string | null;
  schoolId: string;
  applicationOpen: boolean;
  minAge: number | null;
  teacherId: string | null;
  maxAge: number | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
  teacher?: any;
}

/**
 * Grade statistics interface
 */
export interface GradeStatistics {
  totalGrades: number;
  gradesPerSchool: { [schoolId: string]: number };
  openApplicationsCount: number;
  averageMinAge: number;
  averageMaxAge: number;
  gradesWithTeachers: number;
}
