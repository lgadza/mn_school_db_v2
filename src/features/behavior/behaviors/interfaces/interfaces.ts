/**
 * Behavior interface
 * Defines the core structure of a behavior record
 */
export interface BehaviorInterface {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  behaviorTypeId: string;
  classId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  dateOfIncident: Date;
  description?: string | null;
  actionTaken?: string | null;
  staffId: string; // The ID of the reporting staff
  resolutionStatus?:
    | "Pending"
    | "Resolved"
    | "Dismissed"
    | "Under Investigation";
  priority?: "High" | "Medium" | "Low";
  attachments?: string | null; // File URLs or paths
  createdById?: string | null;
  modifiedById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
  behaviorType?: any;
  student?: any;
  class?: any;
  staff?: any;
}

/**
 * Behavior statistics interface
 */
export interface BehaviorStatistics {
  totalBehaviors: number;
  behaviorsPerSchool: { [schoolId: string]: number };
  behaviorsPerCategory: { POSITIVE: number; NEGATIVE: number };
  behaviorsPerStudent: { [studentId: string]: number };
  behaviorsPerClass: { [classId: string]: number };
  behaviorsPerMonth: { [month: string]: number };
  behaviorsPerPriority: { High: number; Medium: number; Low: number };
  behaviorsPerResolutionStatus: {
    Pending: number;
    Resolved: number;
    Dismissed: number;
    "Under Investigation": number;
  };
}
