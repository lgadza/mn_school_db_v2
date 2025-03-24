/**
 * Subject interface
 * Defines the core structure of a subject
 */
export interface SubjectInterface {
  id: string;
  name: string;
  sortOrder: number | null;
  code: string | null;
  description: string | null;
  level: string;
  isDefault: boolean;
  schoolId: string;
  categoryId: string | null;
  prerequisite: string | null;
  departmentId: string | null;
  credits: number | null;
  compulsory: boolean;
  syllabus: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
  category?: any;
  department?: any;
  prerequisiteSubject?: any;
}

/**
 * Subject statistics interface
 */
export interface SubjectStatistics {
  totalSubjects: number;
  subjectsPerSchool: { [schoolId: string]: number };
  subjectsPerCategory: { [categoryId: string]: number };
  subjectsPerDepartment: { [departmentId: string]: number };
  subjectsByLevel: { [level: string]: number };
  compulsorySubjectsCount: number;
  averageCredits: number;
}
