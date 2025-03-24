import { IClassService, IClassRepository } from "./interfaces/services";
import {
  ClassDetailDTO,
  CreateClassDTO,
  UpdateClassDTO,
  PaginatedClassListDTO,
  ClassListQueryParams,
  ClassDTOMapper,
} from "./dto";
import { ClassInterface, ClassStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import { TeacherDTOMapper } from "../../teachers/dto";
import { GradeDTOMapper } from "../grades/dto";
import { SectionDTOMapper } from "../sections/dto";
import { DepartmentDTOMapper } from "../departments/dto";
import { ClassroomDTOMapper } from "../classrooms/dto";
import schoolService from "../../schools/service";
import teacherService from "../../teachers/service";
import gradeService from "../grades/service";
import sectionService from "../sections/service";
import departmentService from "../departments/service";
import classroomService from "../classrooms/service";
import db from "@/config/database";

export class ClassService implements IClassService {
  private repository: IClassRepository;
  private readonly CACHE_PREFIX = "class:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IClassRepository) {
    this.repository = repository;
  }

  /**
   * Get class by ID
   */
  public async getClassById(id: string): Promise<ClassDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedClass = await cache.get(cacheKey);

      if (cachedClass) {
        return JSON.parse(cachedClass);
      }

      // Get from database if not in cache
      const classEntity = await this.repository.findClassById(id);
      if (!classEntity) {
        throw new NotFoundError(`Class with ID ${id} not found`);
      }

      // Map to DTO with related entities
      const classDTO = ClassDTOMapper.toDetailDTO(classEntity);

      // Map each related entity if present
      if (classEntity.school) {
        classDTO.school = SchoolDTOMapper.toDetailDTO(classEntity.school);
      }
      if (classEntity.teacher) {
        classDTO.teacher = TeacherDTOMapper.toDetailDTO(classEntity.teacher);
      }
      if (classEntity.grade) {
        classDTO.grade = GradeDTOMapper.toDetailDTO(classEntity.grade);
      }
      if (classEntity.section) {
        classDTO.section = SectionDTOMapper.toDetailDTO(classEntity.section);
      }
      if (classEntity.department) {
        classDTO.department = DepartmentDTOMapper.toDetailDTO(
          classEntity.department
        );
      }
      if (classEntity.classroom) {
        classDTO.classroom = ClassroomDTOMapper.toDetailDTO(
          classEntity.classroom
        );
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTO), this.CACHE_TTL);

      return classDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassById service:", error);
      throw new AppError("Failed to get class");
    }
  }

  /**
   * Create a new class
   */
  public async createClass(classData: CreateClassDTO): Promise<ClassDetailDTO> {
    try {
      // Validate data
      await this.validateClassData(classData);

      // Check if required entities exist
      await this.validateRelatedEntities(classData);

      // Create the class
      const newClass = await this.repository.createClass(classData);

      // Get the complete class with related entities
      return this.getClassById(newClass.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createClass service:", error);
      throw new AppError("Failed to create class");
    }
  }

  /**
   * Update a class
   */
  public async updateClass(
    id: string,
    classData: UpdateClassDTO
  ): Promise<ClassDetailDTO> {
    try {
      // Check if class exists
      const existingClass = await this.repository.findClassById(id);
      if (!existingClass) {
        throw new NotFoundError(`Class with ID ${id} not found`);
      }

      // Validate data
      await this.validateClassData(classData);

      // Check if related entities exist
      await this.validateRelatedEntities(classData);

      // Update class
      await this.repository.updateClass(id, classData);

      // Clear cache
      await this.clearClassCache(id);

      // Get the updated class
      return this.getClassById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateClass service:", error);
      throw new AppError("Failed to update class");
    }
  }

  /**
   * Delete a class
   */
  public async deleteClass(id: string): Promise<boolean> {
    try {
      // Check if class exists
      const existingClass = await this.repository.findClassById(id);
      if (!existingClass) {
        throw new NotFoundError(`Class with ID ${id} not found`);
      }

      // Delete the class
      const result = await this.repository.deleteClass(id);

      // Clear cache
      await this.clearClassCache(id);

      // Clear related entity caches
      await this.clearRelatedCaches(existingClass);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteClass service:", error);
      throw new AppError("Failed to delete class");
    }
  }

  /**
   * Get paginated class list
   */
  public async getClassList(
    params: ClassListQueryParams
  ): Promise<PaginatedClassListDTO> {
    try {
      const { classes, total } = await this.repository.getClassList(params);

      // Map to DTOs with related entities
      const classDTOs = classes.map((classEntity) => {
        const classDTO = ClassDTOMapper.toDetailDTO(classEntity);

        // Map each related entity if present
        if (classEntity.school) {
          classDTO.school = SchoolDTOMapper.toDetailDTO(classEntity.school);
        }
        if (classEntity.teacher) {
          classDTO.teacher = TeacherDTOMapper.toDetailDTO(classEntity.teacher);
        }
        if (classEntity.grade) {
          classDTO.grade = GradeDTOMapper.toDetailDTO(classEntity.grade);
        }
        if (classEntity.section) {
          classDTO.section = SectionDTOMapper.toDetailDTO(classEntity.section);
        }
        if (classEntity.department) {
          classDTO.department = DepartmentDTOMapper.toDetailDTO(
            classEntity.department
          );
        }
        if (classEntity.classroom) {
          classDTO.classroom = ClassroomDTOMapper.toDetailDTO(
            classEntity.classroom
          );
        }

        return classDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        classes: classDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassList service:", error);
      throw new AppError("Failed to get class list");
    }
  }

  /**
   * Get classes by school
   */
  public async getClassesBySchool(schoolId: string): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const classes = await this.repository.findClassesBySchool(schoolId);

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesBySchool service:", error);
      throw new AppError("Failed to get classes by school");
    }
  }

  /**
   * Get classes by teacher
   */
  public async getClassesByTeacher(
    teacherId: string
  ): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}teacher:${teacherId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if teacher exists
      await teacherService.getTeacherById(teacherId);

      const classes = await this.repository.findClassesByTeacher(teacherId);

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesByTeacher service:", error);
      throw new AppError("Failed to get classes by teacher");
    }
  }

  /**
   * Get classes by grade
   */
  public async getClassesByGrade(gradeId: string): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}grade:${gradeId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if grade exists
      await gradeService.getGradeById(gradeId);

      const classes = await this.repository.findClassesByGrade(gradeId);

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesByGrade service:", error);
      throw new AppError("Failed to get classes by grade");
    }
  }

  /**
   * Get classes by section
   */
  public async getClassesBySection(
    sectionId: string
  ): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}section:${sectionId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if section exists
      await sectionService.getSectionById(sectionId);

      const classes = await this.repository.findClassesBySection(sectionId);

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesBySection service:", error);
      throw new AppError("Failed to get classes by section");
    }
  }

  /**
   * Get classes by department
   */
  public async getClassesByDepartment(
    departmentId: string
  ): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}department:${departmentId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if department exists
      await departmentService.getDepartmentById(departmentId);

      const classes = await this.repository.findClassesByDepartment(
        departmentId
      );

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesByDepartment service:", error);
      throw new AppError("Failed to get classes by department");
    }
  }

  /**
   * Get classes by classroom
   */
  public async getClassesByClassroom(
    classroomId: string
  ): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}classroom:${classroomId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if classroom exists
      await classroomService.getClassroomById(classroomId);

      const classes = await this.repository.findClassesByClassroom(classroomId);

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesByClassroom service:", error);
      throw new AppError("Failed to get classes by classroom");
    }
  }

  /**
   * Get classes by school year
   */
  public async getClassesBySchoolYear(
    schoolYearId: string
  ): Promise<ClassDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}schoolYear:${schoolYearId}`;
      const cachedClasses = await cache.get(cacheKey);

      if (cachedClasses) {
        return JSON.parse(cachedClasses);
      }

      // Check if school year exists (implementation depends on your school year feature)
      // await schoolYearService.getSchoolYearById(schoolYearId);

      const classes = await this.repository.findClassesBySchoolYear(
        schoolYearId
      );

      // Map to DTOs with related entities
      const classDTOs = this.mapClassEntitiesToDTOs(classes);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classDTOs), this.CACHE_TTL);

      return classDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassesBySchoolYear service:", error);
      throw new AppError("Failed to get classes by school year");
    }
  }

  /**
   * Validate class data
   */
  public async validateClassData(
    classData: CreateClassDTO | UpdateClassDTO
  ): Promise<boolean> {
    // Validate capacity and student count values
    if (
      "capacity" in classData &&
      "studentCount" in classData &&
      classData.capacity !== null &&
      classData.capacity !== undefined &&
      classData.studentCount !== null &&
      classData.studentCount !== undefined
    ) {
      if (classData.studentCount > classData.capacity) {
        throw new BadRequestError("Student count cannot exceed capacity");
      }
    }

    // Validate capacity as a positive integer
    if (
      "capacity" in classData &&
      classData.capacity !== null &&
      classData.capacity !== undefined
    ) {
      if (classData.capacity < 0 || !Number.isInteger(classData.capacity)) {
        throw new BadRequestError("Capacity must be a positive integer");
      }
    }

    // Validate student count as a positive integer
    if (
      "studentCount" in classData &&
      classData.studentCount !== null &&
      classData.studentCount !== undefined
    ) {
      if (
        classData.studentCount < 0 ||
        !Number.isInteger(classData.studentCount)
      ) {
        throw new BadRequestError("Student count must be a positive integer");
      }
    }

    return true;
  }

  /**
   * Validate related entities exist
   */
  private async validateRelatedEntities(
    classData: CreateClassDTO | UpdateClassDTO
  ): Promise<void> {
    // Check if school exists if schoolId is provided
    if (classData.schoolId) {
      await schoolService.getSchoolById(classData.schoolId);
    }

    // Check if teacher exists if teacherId is provided
    if (classData.teacherId) {
      await teacherService.getTeacherById(classData.teacherId);
    }

    // Check if grade exists if gradeId is provided
    if (classData.gradeId) {
      await gradeService.getGradeById(classData.gradeId);
    }

    // Check if section exists if sectionId is provided
    if (classData.sectionId) {
      await sectionService.getSectionById(classData.sectionId);
    }

    // Check if department exists if departmentId is provided
    if (classData.departmentId) {
      await departmentService.getDepartmentById(classData.departmentId);
    }

    // Check if classroom exists if classroomId is provided
    if (classData.classroomId) {
      await classroomService.getClassroomById(classData.classroomId);
    }

    // Check if school year exists if schoolYearId is provided
    // if (classData.schoolYearId) {
    //   await schoolYearService.getSchoolYearById(classData.schoolYearId);
    // }
  }

  /**
   * Get class statistics
   */
  public async getClassStatistics(): Promise<ClassStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getClassStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassStatistics service:", error);
      throw new AppError("Failed to get class statistics");
    }
  }

  /**
   * Create multiple classes at once
   */
  public async createClassesBulk(
    classesData: CreateClassDTO[]
  ): Promise<ClassDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all class data
      for (const classData of classesData) {
        await this.validateClassData(classData);
        await this.validateRelatedEntities(classData);
      }

      // Create classes in bulk
      const newClasses = await this.repository.createClassesBulk(
        classesData,
        transaction
      );

      await transaction.commit();

      // Get the complete classes with related entities
      const classIds = newClasses.map((cls) => cls.id);
      const detailedClasses: ClassDetailDTO[] = [];

      for (const id of classIds) {
        const classEntity = await this.repository.findClassById(id);
        if (classEntity) {
          detailedClasses.push(await this.getClassById(id));
        }
      }

      return detailedClasses;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createClassesBulk service:", error);
      throw new AppError("Failed to create classes in bulk");
    }
  }

  /**
   * Delete multiple classes at once
   */
  public async deleteClassesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify classes exist
      const classes = await Promise.all(
        ids.map((id) => this.repository.findClassById(id))
      );

      // Filter out any null results (classes not found)
      const existingClasses = classes.filter((cls) => cls !== null);

      if (existingClasses.length === 0) {
        throw new NotFoundError("None of the specified classes were found");
      }

      // Delete classes
      const deletedCount = await this.repository.deleteClassesBulk(
        existingClasses.map((cls) => cls!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted class
      for (const cls of existingClasses) {
        if (cls) {
          await this.clearClassCache(cls.id);
          await this.clearRelatedCaches(cls);
        }
      }

      return {
        success: true,
        count: deletedCount,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteClassesBulk service:", error);
      throw new AppError("Failed to delete classes in bulk");
    }
  }

  /**
   * Map class entities to DTOs with related entities
   */
  private mapClassEntitiesToDTOs(classes: ClassInterface[]): ClassDetailDTO[] {
    return classes.map((classEntity) => {
      const classDTO = ClassDTOMapper.toDetailDTO(classEntity);

      // Map each related entity if present
      if (classEntity.school) {
        classDTO.school = SchoolDTOMapper.toDetailDTO(classEntity.school);
      }
      if (classEntity.teacher) {
        classDTO.teacher = TeacherDTOMapper.toDetailDTO(classEntity.teacher);
      }
      if (classEntity.grade) {
        classDTO.grade = GradeDTOMapper.toDetailDTO(classEntity.grade);
      }
      if (classEntity.section) {
        classDTO.section = SectionDTOMapper.toDetailDTO(classEntity.section);
      }
      if (classEntity.department) {
        classDTO.department = DepartmentDTOMapper.toDetailDTO(
          classEntity.department
        );
      }
      if (classEntity.classroom) {
        classDTO.classroom = ClassroomDTOMapper.toDetailDTO(
          classEntity.classroom
        );
      }

      return classDTO;
    });
  }

  /**
   * Clear class cache
   */
  private async clearClassCache(classId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${classId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear related entity caches
   */
  private async clearRelatedCaches(classEntity: ClassInterface): Promise<void> {
    // Clear school classes cache
    await cache.del(`${this.CACHE_PREFIX}school:${classEntity.schoolId}`);

    // Clear teacher classes cache if teacher was assigned
    if (classEntity.teacherId) {
      await cache.del(`${this.CACHE_PREFIX}teacher:${classEntity.teacherId}`);
    }

    // Clear grade classes cache
    await cache.del(`${this.CACHE_PREFIX}grade:${classEntity.gradeId}`);

    // Clear section classes cache if section was assigned
    if (classEntity.sectionId) {
      await cache.del(`${this.CACHE_PREFIX}section:${classEntity.sectionId}`);
    }

    // Clear department classes cache if department was assigned
    if (classEntity.departmentId) {
      await cache.del(
        `${this.CACHE_PREFIX}department:${classEntity.departmentId}`
      );
    }

    // Clear classroom classes cache if classroom was assigned
    if (classEntity.classroomId) {
      await cache.del(
        `${this.CACHE_PREFIX}classroom:${classEntity.classroomId}`
      );
    }

    // Clear school year classes cache
    await cache.del(
      `${this.CACHE_PREFIX}schoolYear:${classEntity.schoolYearId}`
    );

    // Clear statistics cache
    await cache.del(`${this.CACHE_PREFIX}statistics`);
  }
}

// Create and export service instance
export default new ClassService(repository);
