/**
 * Classroom interface
 * Defines the core structure of a classroom
 */
export interface ClassroomInterface {
  id: string;
  name: string; // e.g., "Room 101", "Science Lab 3"
  roomType: string; // standard, laboratory, computer_lab, library, auditorium, etc.
  maxStudents: number;
  blockId: string;
  schoolId: string;
  details: string | null;
  floor: number | null;
  features: string[] | null; // e.g., ["projector", "smart_board", "air_conditioning"]
  status: string | null; // active, inactive, maintenance, renovation, closed
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  block?: any;
  school?: any;
}

/**
 * Classroom statistics interface
 */
export interface ClassroomStatistics {
  totalClassrooms: number;
  classroomsPerSchool: { [schoolId: string]: number };
  classroomsPerBlock: { [blockId: string]: number };
  totalCapacity: number;
  averageCapacity: number;
  classroomsByType: { [roomType: string]: number };
  classroomsByStatus: { [status: string]: number };
  featuresDistribution: { [feature: string]: number };
}
