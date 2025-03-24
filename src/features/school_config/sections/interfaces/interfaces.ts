/**
 * Section interface
 * Defines the core structure of a section
 */
export interface SectionInterface {
  id: string;
  name: string; // eg. A, B, C, N1, N2, N3
  schoolId: string;
  capacity: number | null;
  details: string | null;
  color: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
}

/**
 * Section statistics interface
 */
export interface SectionStatistics {
  totalSections: number;
  sectionsPerSchool: { [schoolId: string]: number };
  averageCapacity: number;
  activeSections: number; // Sections with current date between startDate and endDate
  sectionsByColor: { [color: string]: number };
}
