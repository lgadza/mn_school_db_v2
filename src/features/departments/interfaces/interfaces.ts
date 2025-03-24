/**
 * Department interface
 * Defines the core structure of a department
 */
export interface DepartmentInterface {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  headOfDepartmentId: string | null;
  contactEmail: string | null;
  phoneNumber: string | null;
  facultyCount: number | null;
  studentCount: number | null;
  location: string | null;
  budget: number | null;
  schoolId: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
}

/**
 * Department statistics interface
 */
export interface DepartmentStatistics {
  totalDepartments: number;
  departmentsPerSchool: { [schoolId: string]: number };
  averageFacultyCount: number;
  averageStudentCount: number;
  totalBudget: number;
}
