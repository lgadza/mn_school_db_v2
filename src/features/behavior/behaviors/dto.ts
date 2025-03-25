import { BehaviorInterface, BehaviorStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";
import { BehaviorTypeDetailDTO } from "../behavior_types/dto";

/**
 * Base DTO for behavior information
 */
export interface BehaviorBaseDTO {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  behaviorTypeId: string;
  classId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  dateOfIncident: string;
  description?: string | null;
  actionTaken?: string | null;
  staffId: string;
  resolutionStatus?:
    | "Pending"
    | "Resolved"
    | "Dismissed"
    | "Under Investigation";
  priority?: "High" | "Medium" | "Low";
  attachments?: string | null;
}

/**
 * Detailed behavior DTO with timestamps
 */
export interface BehaviorDetailDTO extends BehaviorBaseDTO {
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  modifiedById?: string | null;
  school?: SchoolDetailDTO;
  behaviorType?: BehaviorTypeDetailDTO;
  class?: any;
  staff?: any;
}

/**
 * Simple behavior DTO without timestamps
 */
export interface BehaviorSimpleDTO extends BehaviorBaseDTO {}

/**
 * DTO for creating a new behavior
 */
export interface CreateBehaviorDTO {
  studentId: string;
  studentName: string;
  schoolId: string;
  behaviorTypeId: string;
  classId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  dateOfIncident: Date | string;
  description?: string | null;
  actionTaken?: string | null;
  staffId: string;
  resolutionStatus?:
    | "Pending"
    | "Resolved"
    | "Dismissed"
    | "Under Investigation";
  priority?: "High" | "Medium" | "Low";
  attachments?: string | null;
  createdById?: string | null;
}

/**
 * DTO for updating a behavior
 */
export interface UpdateBehaviorDTO {
  studentId?: string;
  studentName?: string;
  schoolId?: string;
  behaviorTypeId?: string;
  classId?: string;
  moduleId?: string | null;
  lessonId?: string | null;
  dateOfIncident?: Date | string;
  description?: string | null;
  actionTaken?: string | null;
  staffId?: string;
  resolutionStatus?:
    | "Pending"
    | "Resolved"
    | "Dismissed"
    | "Under Investigation";
  priority?: "High" | "Medium" | "Low";
  attachments?: string | null;
  modifiedById?: string | null;
}

/**
 * Query parameters for behavior list
 */
export interface BehaviorListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  classId?: string;
  studentId?: string;
  behaviorTypeId?: string;
  staffId?: string;
  startDate?: string;
  endDate?: string;
  resolutionStatus?:
    | "Pending"
    | "Resolved"
    | "Dismissed"
    | "Under Investigation";
  priority?: "High" | "Medium" | "Low";
  category?: "POSITIVE" | "NEGATIVE";
}

/**
 * Paginated behavior list response
 */
export interface PaginatedBehaviorListDTO {
  behaviors: BehaviorDetailDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Behavior statistics DTO
 */
export interface BehaviorStatisticsDTO extends BehaviorStatistics {}

/**
 * Mapper class for converting between Behavior entities and DTOs
 */
export class BehaviorDTOMapper {
  /**
   * Map Behavior entity to BaseDTO
   */
  public static toBaseDTO(behavior: BehaviorInterface): BehaviorBaseDTO {
    return {
      id: behavior.id,
      studentId: behavior.studentId,
      studentName: behavior.studentName,
      schoolId: behavior.schoolId,
      behaviorTypeId: behavior.behaviorTypeId,
      classId: behavior.classId,
      moduleId: behavior.moduleId,
      lessonId: behavior.lessonId,
      dateOfIncident: behavior.dateOfIncident.toISOString(),
      description: behavior.description,
      actionTaken: behavior.actionTaken,
      staffId: behavior.staffId,
      resolutionStatus: behavior.resolutionStatus,
      priority: behavior.priority,
      attachments: behavior.attachments,
    };
  }

  /**
   * Map Behavior entity to DetailDTO
   */
  public static toDetailDTO(behavior: any): BehaviorDetailDTO {
    const baseDTO = this.toBaseDTO(behavior);

    return {
      ...baseDTO,
      createdAt: behavior.createdAt
        ? behavior.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: behavior.updatedAt
        ? behavior.updatedAt.toISOString()
        : new Date().toISOString(),
      createdById: behavior.createdById,
      modifiedById: behavior.modifiedById,
      school: behavior.school ? behavior.school : undefined,
      behaviorType: behavior.behaviorType ? behavior.behaviorType : undefined,
      class: behavior.class ? behavior.class : undefined,
      staff: behavior.staff ? behavior.staff : undefined,
    };
  }

  /**
   * Map Behavior entity to SimpleDTO
   */
  public static toSimpleDTO(behavior: BehaviorInterface): BehaviorSimpleDTO {
    return this.toBaseDTO(behavior);
  }
}
