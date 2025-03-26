import { TeacherBaseDTO } from "@/features/teachers";
import { ClassBaseDTO } from "../classes";
import { SubjectBaseDTO } from "../subjects";
import { ModuleInterface } from "./interfaces/interfaces";
import { SchoolBaseDTO } from "@/features/schools";
import { ClassroomBaseDTO } from "../classrooms";

/**
 * Base DTO for module information
 */
export interface ModuleBaseDTO {
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
}

/**
 * Detailed module DTO with timestamps and related entities
 */
export interface ModuleDetailDTO extends ModuleBaseDTO {
  createdAt: string;
  updatedAt: string;
  subject?: SubjectBaseDTO;
  class?: ClassBaseDTO;
  teacher?: TeacherBaseDTO;
  assistantTeacher?: TeacherBaseDTO;
  school?: SchoolBaseDTO;
  classroom?: ClassroomBaseDTO;
}

/**
 * Simple module DTO without timestamps
 */
export interface ModuleSimpleDTO extends ModuleBaseDTO {}

/**
 * DTO for creating a new module
 */
export interface CreateModuleDTO {
  name: string;
  description?: string | null;
  subjectId: string;
  classId: string;
  teacherId: string;
  assistantTeacherId?: string | null;
  schoolId: string;
  createdById?: string | null;
  classType?: string | null;
  classroomId?: string | null;
  materials?: string | null;
  studentGroupId?: string | null;
  termId?: string | null;
  totalStudents?: number | null;
}

/**
 * DTO for bulk creating modules
 */
export interface BulkCreateModuleDTO extends CreateModuleDTO {}

/**
 * DTO for updating a module
 */
export interface UpdateModuleDTO {
  name?: string;
  description?: string | null;
  subjectId?: string;
  classId?: string;
  teacherId?: string;
  assistantTeacherId?: string | null;
  schoolId?: string;
  modifiedById?: string | null;
  classType?: string | null;
  classroomId?: string | null;
  materials?: string | null;
  studentGroupId?: string | null;
  termId?: string | null;
  totalStudents?: number | null;
}

/**
 * DTO for bulk deleting modules
 */
export interface BulkDeleteModuleDTO {
  ids?: string[];
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  schoolId?: string;
  termId?: string;
}

/**
 * Query parameters for module list
 */
export interface ModuleListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  assistantTeacherId?: string;
  schoolId?: string;
  classroomId?: string;
  termId?: string;
  classType?: string;
}

/**
 * Paginated module list response
 */
export interface PaginatedModuleListDTO {
  modules: ModuleDetailDTO[];
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
 * Mapper class for converting between Module entities and DTOs
 */
export class ModuleDTOMapper {
  /**
   * Map Module entity to BaseDTO
   */
  public static toBaseDTO(module: ModuleInterface): ModuleBaseDTO {
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      subjectId: module.subjectId,
      classId: module.classId,
      teacherId: module.teacherId,
      assistantTeacherId: module.assistantTeacherId,
      schoolId: module.schoolId,
      createdById: module.createdById,
      modifiedById: module.modifiedById,
      classType: module.classType,
      classroomId: module.classroomId,
      materials: module.materials,
      studentGroupId: module.studentGroupId,
      termId: module.termId,
      totalStudents: module.totalStudents,
    };
  }

  /**
   * Map Module entity to DetailDTO
   */
  public static toDetailDTO(module: any): ModuleDetailDTO {
    const detailDTO: ModuleDetailDTO = {
      ...this.toBaseDTO(module),
      createdAt: module.createdAt
        ? module.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: module.updatedAt
        ? module.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Add associated entities if available
    if (module.subject) detailDTO.subject = module.subject;
    if (module.class) detailDTO.class = module.class;
    if (module.teacher) detailDTO.teacher = module.teacher;
    if (module.assistantTeacher)
      detailDTO.assistantTeacher = module.assistantTeacher;
    if (module.school) detailDTO.school = module.school;
    if (module.classroom) detailDTO.classroom = module.classroom;

    return detailDTO;
  }

  /**
   * Map Module entity to SimpleDTO
   */
  public static toSimpleDTO(module: ModuleInterface): ModuleSimpleDTO {
    return this.toBaseDTO(module);
  }
}
