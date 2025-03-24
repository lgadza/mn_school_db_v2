import {
  TeacherInterface,
  TeacherSensitiveData,
} from "./interfaces/interfaces";
import { UserDetailDTO } from "../users/dto";
import { SchoolDetailDTO } from "../schools/dto";
import { DepartmentDetailDTO } from "../departments/dto";
import EncryptionUtil, {
  EncryptedData,
} from "@/common/utils/security/encryptionUtil";

/**
 * Base DTO for teacher information
 */
export interface TeacherBaseDTO {
  id: string;
  userId: string;
  schoolId: string;
  departmentId: string | null;
  hireDate: string | null;
  qualificationId: string | null;
  title: string | null;
  employeeId: string | null;
  contractType: string | null;
  specialization: string | null;
  yearsOfExperience: number | null;
  teachingLoad: number | null;
  officeLocation: string | null;
  officeHours: string | null;
  bio: string | null;
  lastPromotionDate: string | null;
  notes: string | null;
  previousInstitutions: any[] | null;
  certifications: any[] | null;
  achievements: any[] | null;
  publications: any[] | null;
  currentStatus: string | null;
  primarySubjects: string[] | null;
  activeStatus: boolean;
}

/**
 * Detailed teacher DTO with timestamps and related entities
 */
export interface TeacherDetailDTO extends TeacherBaseDTO {
  createdAt: string;
  updatedAt: string;
  salary?: number | null;
  emergencyContact?: string | null;
  user?: UserDetailDTO;
  school?: SchoolDetailDTO;
  department?: DepartmentDetailDTO;
}

/**
 * Simple teacher DTO without timestamps and sensitive data
 */
export interface TeacherSimpleDTO extends TeacherBaseDTO {}

/**
 * DTO for creating a new teacher
 */
export interface CreateTeacherDTO {
  userId: string;
  schoolId: string;
  departmentId?: string | null;
  hireDate?: string | Date | null;
  qualificationId?: string | null;
  title?: string | null;
  employeeId?: string | null;
  contractType?: string | null;
  specialization?: string | null;
  yearsOfExperience?: number | null;
  teachingLoad?: number | null;
  officeLocation?: string | null;
  officeHours?: string | null;
  bio?: string | null;
  salary?: number | null;
  emergencyContact?: string | null;
  lastPromotionDate?: string | Date | null;
  notes?: string | null;
  previousInstitutions?: any[] | string | null;
  certifications?: any[] | string | null;
  achievements?: any[] | string | null;
  publications?: any[] | string | null;
  currentStatus?: string | null;
  primarySubjects?: string[] | string | null;
  activeStatus?: boolean;
}

/**
 * DTO for updating a teacher
 */
export interface UpdateTeacherDTO {
  schoolId?: string;
  departmentId?: string | null;
  hireDate?: string | Date | null;
  qualificationId?: string | null;
  title?: string | null;
  employeeId?: string | null;
  contractType?: string | null;
  specialization?: string | null;
  yearsOfExperience?: number | null;
  teachingLoad?: number | null;
  officeLocation?: string | null;
  officeHours?: string | null;
  bio?: string | null;
  salary?: number | null;
  emergencyContact?: string | null;
  lastPromotionDate?: string | Date | null;
  notes?: string | null;
  previousInstitutions?: any[] | string | null;
  certifications?: any[] | string | null;
  achievements?: any[] | string | null;
  publications?: any[] | string | null;
  currentStatus?: string | null;
  primarySubjects?: string[] | string | null;
  activeStatus?: boolean;
}

/**
 * Query parameters for teacher list
 */
export interface TeacherListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  departmentId?: string;
  activeStatus?: boolean;
  currentStatus?: string;
  contractType?: string;
  minYearsOfExperience?: number;
  maxYearsOfExperience?: number;
  minTeachingLoad?: number;
  maxTeachingLoad?: number;
  hireDateFrom?: string;
  hireDateTo?: string;
  title?: string;
  specialization?: string;
}

/**
 * Paginated teacher list response
 */
export interface PaginatedTeacherListDTO {
  teachers: TeacherDetailDTO[];
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
 * Teacher statistics DTO
 */
export interface TeacherStatisticsDTO {
  totalTeachers: number;
  teachersPerSchool: { [schoolId: string]: number };
  teachersPerDepartment: { [departmentId: string]: number };
  teachersByStatus: { [status: string]: number };
  teachersByContractType: { [contractType: string]: number };
  averageYearsOfExperience: number;
  averageTeachingLoad: number;
}

/**
 * Mapper class for converting between Teacher entities and DTOs
 */
export class TeacherDTOMapper {
  /**
   * Map Teacher entity to BaseDTO
   */
  public static toBaseDTO(teacher: TeacherInterface): TeacherBaseDTO {
    return {
      id: teacher.id,
      userId: teacher.userId,
      schoolId: teacher.schoolId,
      departmentId: teacher.departmentId || null,
      hireDate: teacher.hireDate
        ? teacher.hireDate.toISOString().split("T")[0]
        : null,
      qualificationId: teacher.qualificationId || null,
      title: teacher.title || null,
      employeeId: teacher.employeeId || null,
      contractType: teacher.contractType || null,
      specialization: teacher.specialization || null,
      yearsOfExperience: teacher.yearsOfExperience || null,
      teachingLoad: teacher.teachingLoad || null,
      officeLocation: teacher.officeLocation || null,
      officeHours: teacher.officeHours || null,
      bio: teacher.bio || null,
      lastPromotionDate: teacher.lastPromotionDate
        ? teacher.lastPromotionDate.toISOString().split("T")[0]
        : null,
      notes: teacher.notes || null,
      previousInstitutions: teacher.previousInstitutions
        ? JSON.parse(teacher.previousInstitutions)
        : null,
      certifications: teacher.certifications
        ? JSON.parse(teacher.certifications)
        : null,
      achievements: teacher.achievements
        ? JSON.parse(teacher.achievements)
        : null,
      publications: teacher.publications
        ? JSON.parse(teacher.publications)
        : null,
      currentStatus: teacher.currentStatus || null,
      primarySubjects: teacher.primarySubjects
        ? JSON.parse(teacher.primarySubjects)
        : null,
      activeStatus: teacher.activeStatus,
    };
  }

  /**
   * Map Teacher entity to DetailDTO
   */
  public static toDetailDTO(teacher: any): TeacherDetailDTO {
    const baseDTO = this.toBaseDTO(teacher);
    const detailDTO: TeacherDetailDTO = {
      ...baseDTO,
      createdAt: teacher.createdAt
        ? teacher.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: teacher.updatedAt
        ? teacher.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Handle sensitive data decryption if present
    if (teacher.encryptedSalary) {
      try {
        const encryptedSalaryData = JSON.parse(
          teacher.encryptedSalary
        ) as EncryptedData;
        const decryptedSalary = EncryptionUtil.decrypt(encryptedSalaryData);
        detailDTO.salary = parseFloat(decryptedSalary);
      } catch (error) {
        console.error("Error decrypting salary:", error);
      }
    }

    if (teacher.encryptedEmergencyContact) {
      try {
        const encryptedContactData = JSON.parse(
          teacher.encryptedEmergencyContact
        ) as EncryptedData;
        detailDTO.emergencyContact =
          EncryptionUtil.decrypt(encryptedContactData);
      } catch (error) {
        console.error("Error decrypting emergency contact:", error);
      }
    }

    // Add related entities if available
    if (teacher.user) {
      detailDTO.user = teacher.user;
    }

    if (teacher.school) {
      detailDTO.school = teacher.school;
    }

    if (teacher.department) {
      detailDTO.department = teacher.department;
    }

    return detailDTO;
  }

  /**
   * Map Teacher entity to SimpleDTO
   */
  public static toSimpleDTO(teacher: TeacherInterface): TeacherSimpleDTO {
    return this.toBaseDTO(teacher);
  }

  /**
   * Prepare sensitive data for encryption
   */
  public static prepareSensitiveData(
    teacherData: CreateTeacherDTO | UpdateTeacherDTO
  ): {
    encryptedSalary?: string | null;
    encryptedEmergencyContact?: string | null;
  } {
    const result: {
      encryptedSalary?: string | null;
      encryptedEmergencyContact?: string | null;
    } = {};

    // Encrypt salary if provided
    if (teacherData.salary !== undefined) {
      if (teacherData.salary === null) {
        result.encryptedSalary = null;
      } else {
        const encryptedSalary = EncryptionUtil.encrypt(
          teacherData.salary.toString()
        );
        result.encryptedSalary = JSON.stringify(encryptedSalary);
      }
    }

    // Encrypt emergency contact if provided
    if (teacherData.emergencyContact !== undefined) {
      if (teacherData.emergencyContact === null) {
        result.encryptedEmergencyContact = null;
      } else {
        const encryptedContact = EncryptionUtil.encrypt(
          teacherData.emergencyContact
        );
        result.encryptedEmergencyContact = JSON.stringify(encryptedContact);
      }
    }

    return result;
  }
}
