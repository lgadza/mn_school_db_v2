/**
 * Module interface - represents a teaching module within a class
 */
export interface ModuleInterface {
  id: string;
  name: string;
  description: string | null;
  subjectId: string;
  classId: string;
  teacherId: string;
  assistantTeacherId: string | null;
  schoolId: string;
  createdById: string | null;
  modifiedById: string | null;
  classType: string | null;
  classroomId: string | null;
  materials: string | null;
  studentGroupId: string | null;
  termId: string | null;
  totalStudents: number | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields for associations (Sequelize will populate these)
  subject?: any;
  class?: any;
  teacher?: any;
  assistantTeacher?: any;
  school?: any;
  classroom?: any;
}

/**
 * Module deletion result interface
 */
export interface ModuleDeletionResult {
  success: boolean;
  count: number;
  message: string;
}
