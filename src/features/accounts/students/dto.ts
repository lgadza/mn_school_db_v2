import { StudentInterface } from "./interfaces/interfaces";
import { UserDetailDTO } from "../../users/dto";
import { SchoolDetailDTO } from "../../schools/dto";
import { GradeDetailDTO } from "../../school_config/grades/dto";
import { ClassDetailDTO } from "../../school_config/classes/dto";

/**
 * Base DTO for student information
 */
export interface StudentBaseDTO {
  id: string;
  userId: string;
  schoolId: string;
  gradeId: string;
  classId: string | null;
  enrollmentDate: string;
  studentNumber: string;
  guardianInfo: any[] | null;
  healthInfo: any | null;
  previousSchool: any | null;
  enrollmentNotes: string | null;
  academicRecords: any[] | null;
  attendanceRecords: any[] | null;
  disciplinaryRecords: any[] | null;
  specialNeeds: any | null;
  extracurricularActivities: any[] | null;
  documents: any[] | null;
  activeStatus: boolean;
}

/**
 * Detailed student DTO with timestamps and related entities
 */
export interface StudentDetailDTO extends StudentBaseDTO {
  createdAt: string;
  updatedAt: string;
  user?: UserDetailDTO;
  school?: SchoolDetailDTO;
  grade?: GradeDetailDTO;
  class?: ClassDetailDTO;
}

/**
 * Simple student DTO without timestamps and sensitive data
 */
export interface StudentSimpleDTO extends StudentBaseDTO {}

/**
 * DTO for creating a new student
 */
export interface CreateStudentDTO {
  userId: string;
  schoolId: string;
  gradeId: string;
  classId?: string | null;
  enrollmentDate: string | Date;
  studentNumber?: string;
  guardianInfo?: any[] | string | null;
  healthInfo?: any | string | null;
  previousSchool?: any | string | null;
  enrollmentNotes?: string | null;
  academicRecords?: any[] | string | null;
  attendanceRecords?: any[] | string | null;
  disciplinaryRecords?: any[] | string | null;
  specialNeeds?: any | string | null;
  extracurricularActivities?: any[] | string | null;
  documents?: any[] | string | null;
  activeStatus?: boolean;
}

/**
 * DTO for updating a student
 */
export interface UpdateStudentDTO {
  schoolId?: string;
  gradeId?: string;
  classId?: string | null;
  enrollmentDate?: string | Date;
  studentNumber?: string;
  guardianInfo?: any[] | string | null;
  healthInfo?: any | string | null;
  previousSchool?: any | string | null;
  enrollmentNotes?: string | null;
  academicRecords?: any[] | string | null;
  attendanceRecords?: any[] | string | null;
  disciplinaryRecords?: any[] | string | null;
  specialNeeds?: any | string | null;
  extracurricularActivities?: any[] | string | null;
  documents?: any[] | string | null;
  activeStatus?: boolean;
}

/**
 * Query parameters for student list
 */
export interface StudentListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  gradeId?: string;
  classId?: string;
  activeStatus?: boolean;
  enrollmentDateFrom?: string;
  enrollmentDateTo?: string;
}

/**
 * Paginated student list response
 */
export interface PaginatedStudentListDTO {
  students: StudentDetailDTO[];
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
 * Student statistics DTO
 */
export interface StudentStatisticsDTO {
  totalStudents: number;
  studentsPerSchool: { [schoolId: string]: number };
  studentsPerGrade: { [gradeId: string]: number };
  studentsPerClass: { [classId: string]: number };
  activeStudents: number;
  inactiveStudents: number;
  enrollmentsByYear: { [year: string]: number };
  enrollmentsByMonth: { [month: string]: number };
}

/**
 * Mapper class for converting between Student entities and DTOs
 */
export class StudentDTOMapper {
  /**
   * Map Student entity to BaseDTO
   */
  public static toBaseDTO(student: StudentInterface): StudentBaseDTO {
    return {
      id: student.id,
      userId: student.userId,
      schoolId: student.schoolId,
      gradeId: student.gradeId,
      classId: student.classId || null,
      enrollmentDate: student.enrollmentDate
        ? student.enrollmentDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      studentNumber: student.studentNumber,
      guardianInfo: student.guardianInfo
        ? JSON.parse(student.guardianInfo)
        : null,
      healthInfo: student.healthInfo ? JSON.parse(student.healthInfo) : null,
      previousSchool: student.previousSchool
        ? JSON.parse(student.previousSchool)
        : null,
      enrollmentNotes: student.enrollmentNotes || null,
      academicRecords: student.academicRecords
        ? JSON.parse(student.academicRecords)
        : null,
      attendanceRecords: student.attendanceRecords
        ? JSON.parse(student.attendanceRecords)
        : null,
      disciplinaryRecords: student.disciplinaryRecords
        ? JSON.parse(student.disciplinaryRecords)
        : null,
      specialNeeds: student.specialNeeds
        ? JSON.parse(student.specialNeeds)
        : null,
      extracurricularActivities: student.extracurricularActivities
        ? JSON.parse(student.extracurricularActivities)
        : null,
      documents: student.documents ? JSON.parse(student.documents) : null,
      activeStatus: student.activeStatus,
    };
  }

  /**
   * Map Student entity to DetailDTO
   */
  public static toDetailDTO(student: StudentInterface): StudentDetailDTO {
    const baseDTO = this.toBaseDTO(student);
    const detailDTO: StudentDetailDTO = {
      ...baseDTO,
      createdAt: student.createdAt
        ? student.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: student.updatedAt
        ? student.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add related entities if available
    if (student.user) {
      detailDTO.user = student.user as any;
    }

    if (student.school) {
      detailDTO.school = student.school as any;
    }

    if (student.grade) {
      detailDTO.grade = student.grade as any;
    }

    if (student.class) {
      detailDTO.class = student.class as any;
    }

    return detailDTO;
  }

  /**
   * Map Student entity to SimpleDTO
   */
  public static toSimpleDTO(student: StudentInterface): StudentSimpleDTO {
    return this.toBaseDTO(student);
  }

  /**
   * Prepare data for storage
   */
  public static prepareForStorage(
    studentData: CreateStudentDTO | UpdateStudentDTO
  ): any {
    const dataToSave = { ...studentData };

    // Convert arrays and objects to JSON strings
    if (dataToSave.guardianInfo) {
      if (typeof dataToSave.guardianInfo !== "string") {
        dataToSave.guardianInfo = JSON.stringify(dataToSave.guardianInfo);
      }
    }

    if (dataToSave.healthInfo) {
      if (typeof dataToSave.healthInfo !== "string") {
        dataToSave.healthInfo = JSON.stringify(dataToSave.healthInfo);
      }
    }

    if (dataToSave.previousSchool) {
      if (typeof dataToSave.previousSchool !== "string") {
        dataToSave.previousSchool = JSON.stringify(dataToSave.previousSchool);
      }
    }

    if (dataToSave.academicRecords) {
      if (typeof dataToSave.academicRecords !== "string") {
        dataToSave.academicRecords = JSON.stringify(dataToSave.academicRecords);
      }
    }

    if (dataToSave.attendanceRecords) {
      if (typeof dataToSave.attendanceRecords !== "string") {
        dataToSave.attendanceRecords = JSON.stringify(
          dataToSave.attendanceRecords
        );
      }
    }

    if (dataToSave.disciplinaryRecords) {
      if (typeof dataToSave.disciplinaryRecords !== "string") {
        dataToSave.disciplinaryRecords = JSON.stringify(
          dataToSave.disciplinaryRecords
        );
      }
    }

    if (dataToSave.specialNeeds) {
      if (typeof dataToSave.specialNeeds !== "string") {
        dataToSave.specialNeeds = JSON.stringify(dataToSave.specialNeeds);
      }
    }

    if (dataToSave.extracurricularActivities) {
      if (typeof dataToSave.extracurricularActivities !== "string") {
        dataToSave.extracurricularActivities = JSON.stringify(
          dataToSave.extracurricularActivities
        );
      }
    }

    if (dataToSave.documents) {
      if (typeof dataToSave.documents !== "string") {
        dataToSave.documents = JSON.stringify(dataToSave.documents);
      }
    }

    return dataToSave;
  }
}
