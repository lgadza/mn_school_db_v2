/**
 * Period interface
 * Defines the core structure of a period
 */
export interface PeriodInterface {
  id: string;
  name: string; // E.g., "Period 1", "Morning Period", or "Block A"
  startTime: string; // E.g., "08:00"
  endTime: string; // E.g., "09:30"
  duration: number; // Duration in minutes
  section: "morning" | "afternoon" | "evening";
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;

  // Related entities from associations
  school?: any;
}

/**
 * Period statistics interface
 */
export interface PeriodStatistics {
  totalPeriods: number;
  periodsPerSchool: { [schoolId: string]: number };
  averageDuration: number;
  periodsBySection: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  earliestStartTime: string;
  latestEndTime: string;
}
