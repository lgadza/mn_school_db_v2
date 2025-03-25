/**
 * SchoolYear interface
 * Defines the core structure of a school year
 */
export interface SchoolYearInterface {
  id: string;
  year: string; // e.g. "2025-2026"
  startDate: Date;
  endDate: Date;
  status: string | null; // e.g., "Active", "Upcoming", "Completed"
  schoolId: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
}

/**
 * School year status enums
 */
export enum SchoolYearStatus {
  ACTIVE = "active",
  UPCOMING = "upcoming",
  COMPLETED = "completed",
  ARCHIVED = "archived",
  DRAFT = "draft",
}

/**
 * School year statistics interface
 */
export interface SchoolYearStatistics {
  totalSchoolYears: number;
  schoolYearsPerSchool: { [schoolId: string]: number };
  activeSchoolYears: number;
  upcomingSchoolYears: number;
  completedSchoolYears: number;
  statusDistribution: { [status: string]: number };
  averageDuration: number; // in days
}
