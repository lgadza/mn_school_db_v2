import { ClassInterface, ClassStatistics } from "./interfaces/interfaces";
import { SchoolDetailDTO } from "../../schools/dto";
import { TeacherDetailDTO } from "../../teachers/dto";
import { GradeDetailDTO } from "../grades/dto";
import { SectionDetailDTO } from "../sections/dto";
import { DepartmentDetailDTO } from "../departments/dto";
import { ClassroomDetailDTO } from "../classrooms/dto";

/**
 * Base DTO for class information
 */
export interface ClassBaseDTO {
  id: string;
  name: string;
  teacherId: string | null;
  gradeId: string;
  sectionId: string | null;
  departmentId: string | null;
  capacity: number | null;
  schoolId: string;
  details: string | null;
  color: string | null;
  studentCount: number | null;
  scheduleId: string | null;
  classroomId: string | null;
  schoolYearId: string;
  classType: string | null;
  combination: string;
  status: "active" | "archived";
}

/**
 * Detailed class DTO with timestamps and related entities
 */
export interface ClassDetailDTO extends ClassBaseDTO {
  createdAt: string;
  updatedAt: string;
  school?: SchoolDetailDTO;
  teacher?: TeacherDetailDTO;
  grade?: GradeDetailDTO;
  section?: SectionDetailDTO;
  department?: DepartmentDetailDTO;
  classroom?: ClassroomDetailDTO;
  capacityUtilization?: number; // Percentage of capacity being used
}

/**
 * Simple class DTO without timestamps or related entities
 */
export interface ClassSimpleDTO extends ClassBaseDTO {}

/**
 * DTO for creating a new class
 */
export interface CreateClassDTO {
  name: string;
  teacherId?: string | null;
  gradeId: string;
  sectionId?: string | null;
  departmentId?: string | null;
  capacity?: number | null;
  schoolId: string;
  details?: string | null;
  color?: string | null;
  scheduleId?: string | null;
  classroomId?: string | null;
  schoolYearId: string;
  classType?: string | null;
  combination?: string;
  status?: "active" | "archived";
}

/**
 * DTO for updating a class
 */
export interface UpdateClassDTO {
  name?: string;
  teacherId?: string | null;
  gradeId?: string;
  sectionId?: string | null;
  departmentId?: string | null;
  capacity?: number | null;
  schoolId?: string;
  details?: string | null;
  color?: string | null;
  studentCount?: number | null;
  scheduleId?: string | null;
  classroomId?: string | null;
  schoolYearId?: string;
  classType?: string | null;
  combination?: string;
  status?: "active" | "archived";
}

/**
 * Query parameters for class list
 */
export interface ClassListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  teacherId?: string;
  gradeId?: string;
  sectionId?: string;
  departmentId?: string;
  classroomId?: string;
  schoolYearId?: string;
  classType?: string;
  status?: "active" | "archived";
  capacityFrom?: number;
  capacityTo?: number;
  studentCountFrom?: number;
  studentCountTo?: number;
}

/**
 * Paginated class list response
 */
export interface PaginatedClassListDTO {
  classes: ClassDetailDTO[];
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
 * Class statistics DTO
 */
export interface ClassStatisticsDTO extends ClassStatistics {}

/**
 * Mapper class for converting between Class entities and DTOs
 */
export class ClassDTOMapper {
  /**
   * Map Class entity to BaseDTO
   */
  public static toBaseDTO(classEntity: ClassInterface): ClassBaseDTO {
    return {
      id: classEntity.id,
      name: classEntity.name,
      teacherId: classEntity.teacherId,
      gradeId: classEntity.gradeId,
      sectionId: classEntity.sectionId,
      departmentId: classEntity.departmentId,
      capacity: classEntity.capacity,
      schoolId: classEntity.schoolId,
      details: classEntity.details,
      color: classEntity.color,
      studentCount: classEntity.studentCount,
      scheduleId: classEntity.scheduleId,
      classroomId: classEntity.classroomId,
      schoolYearId: classEntity.schoolYearId,
      classType: classEntity.classType,
      combination: classEntity.combination,
      status: classEntity.status,
    };
  }

  /**
   * Map Class entity to DetailDTO with related entities
   */
  public static toDetailDTO(classEntity: any): ClassDetailDTO {
    const baseDTO = this.toBaseDTO(classEntity);

    // Calculate capacity utilization if both capacity and studentCount are available
    let capacityUtilization;
    if (
      classEntity.capacity &&
      classEntity.studentCount &&
      classEntity.capacity > 0
    ) {
      capacityUtilization =
        (classEntity.studentCount / classEntity.capacity) * 100;
    }

    return {
      ...baseDTO,
      createdAt: classEntity.createdAt
        ? classEntity.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: classEntity.updatedAt
        ? classEntity.updatedAt.toISOString()
        : new Date().toISOString(),
      school: classEntity.school ? classEntity.school : undefined,
      teacher: classEntity.teacher ? classEntity.teacher : undefined,
      grade: classEntity.grade ? classEntity.grade : undefined,
      section: classEntity.section ? classEntity.section : undefined,
      department: classEntity.department ? classEntity.department : undefined,
      classroom: classEntity.classroom ? classEntity.classroom : undefined,
      capacityUtilization,
    };
  }

  /**
   * Map Class entity to SimpleDTO
   */
  public static toSimpleDTO(classEntity: ClassInterface): ClassSimpleDTO {
    return this.toBaseDTO(classEntity);
  }
}
