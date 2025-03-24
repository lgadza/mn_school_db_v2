import { IGradeService, IGradeRepository } from "./interfaces/services";
import {
  GradeDetailDTO,
  CreateGradeDTO,
  UpdateGradeDTO,
  PaginatedGradeListDTO,
  GradeListQueryParams,
  GradeDTOMapper,
} from "./dto";
import { GradeStatistics } from "./interfaces/interfaces";
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
import schoolService from "../../schools/service";
import teacherService from "../../teachers/service";
import db from "@/config/database";

export class GradeService implements IGradeService {
  private repository: IGradeRepository;
  private readonly CACHE_PREFIX = "grade:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IGradeRepository) {
    this.repository = repository;
  }

  /**
   * Get grade by ID
   */
  public async getGradeById(id: string): Promise<GradeDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedGrade = await cache.get(cacheKey);

      if (cachedGrade) {
        return JSON.parse(cachedGrade);
      }

      // Get from database if not in cache
      const grade = await this.repository.findGradeById(id);
      if (!grade) {
        throw new NotFoundError(`Grade with ID ${id} not found`);
      }

      // Map to DTO with school and teacher
      const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

      // If the grade has a school, map it to a school DTO
      if (grade.school) {
        gradeDTO.school = SchoolDTOMapper.toDetailDTO(grade.school);
      }

      // If the grade has a teacher, map it to a teacher DTO
      if (grade.teacher) {
        gradeDTO.teacher = TeacherDTOMapper.toDetailDTO(grade.teacher);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(gradeDTO), this.CACHE_TTL);

      return gradeDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradeById service:", error);
      throw new AppError("Failed to get grade");
    }
  }

  /**
   * Create a new grade
   */
  public async createGrade(gradeData: CreateGradeDTO): Promise<GradeDetailDTO> {
    try {
      // Validate data
      await this.validateGradeData(gradeData);

      // Check if school exists
      await schoolService.getSchoolById(gradeData.schoolId);

      // Check if teacher exists if provided
      if (gradeData.teacherId) {
        await teacherService.getTeacherById(gradeData.teacherId);
      }

      // Create the grade
      const newGrade = await this.repository.createGrade(gradeData);

      // Get the complete grade with school and teacher
      const grade = await this.repository.findGradeById(newGrade.id);
      if (!grade) {
        throw new AppError("Failed to retrieve created grade");
      }

      // Map to DTO with school and teacher
      const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

      if (grade.school) {
        gradeDTO.school = SchoolDTOMapper.toDetailDTO(grade.school);
      }

      if (grade.teacher) {
        gradeDTO.teacher = TeacherDTOMapper.toDetailDTO(grade.teacher);
      }

      return gradeDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createGrade service:", error);
      throw new AppError("Failed to create grade");
    }
  }

  /**
   * Update a grade
   */
  public async updateGrade(
    id: string,
    gradeData: UpdateGradeDTO
  ): Promise<GradeDetailDTO> {
    try {
      // Check if grade exists
      const existingGrade = await this.repository.findGradeById(id);
      if (!existingGrade) {
        throw new NotFoundError(`Grade with ID ${id} not found`);
      }

      // Validate data
      await this.validateGradeData(gradeData);

      // Check if school exists if schoolId is provided
      if (gradeData.schoolId) {
        await schoolService.getSchoolById(gradeData.schoolId);
      }

      // Check if teacher exists if teacherId is provided
      if (gradeData.teacherId) {
        await teacherService.getTeacherById(gradeData.teacherId);
      }

      // Update grade
      await this.repository.updateGrade(id, gradeData);

      // Clear cache
      await this.clearGradeCache(id);

      // Get the updated grade
      return this.getGradeById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateGrade service:", error);
      throw new AppError("Failed to update grade");
    }
  }

  /**
   * Delete a grade
   */
  public async deleteGrade(id: string): Promise<boolean> {
    try {
      // Check if grade exists
      const existingGrade = await this.repository.findGradeById(id);
      if (!existingGrade) {
        throw new NotFoundError(`Grade with ID ${id} not found`);
      }

      // Delete the grade
      const result = await this.repository.deleteGrade(id);

      // Clear cache
      await this.clearGradeCache(id);

      // Clear school grades cache
      await cache.del(`${this.CACHE_PREFIX}school:${existingGrade.schoolId}`);

      // Clear teacher grades cache if teacher is assigned
      if (existingGrade.teacherId) {
        await cache.del(
          `${this.CACHE_PREFIX}teacher:${existingGrade.teacherId}`
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteGrade service:", error);
      throw new AppError("Failed to delete grade");
    }
  }

  /**
   * Get paginated grade list
   */
  public async getGradeList(
    params: GradeListQueryParams
  ): Promise<PaginatedGradeListDTO> {
    try {
      const { grades, total } = await this.repository.getGradeList(params);

      // Map to DTOs with schools and teachers
      const gradeDTOs = grades.map((grade) => {
        const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

        if (grade.school) {
          gradeDTO.school = SchoolDTOMapper.toDetailDTO(grade.school);
        }

        if (grade.teacher) {
          gradeDTO.teacher = TeacherDTOMapper.toDetailDTO(grade.teacher);
        }

        return gradeDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        grades: gradeDTOs,
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
      logger.error("Error in getGradeList service:", error);
      throw new AppError("Failed to get grade list");
    }
  }

  /**
   * Get grades by school
   */
  public async getGradesBySchool(schoolId: string): Promise<GradeDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedGrades = await cache.get(cacheKey);

      if (cachedGrades) {
        return JSON.parse(cachedGrades);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const grades = await this.repository.findGradesBySchool(schoolId);

      // Map to DTOs with schools and teachers
      const gradeDTOs = grades.map((grade) => {
        const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

        if (grade.school) {
          gradeDTO.school = SchoolDTOMapper.toDetailDTO(grade.school);
        }

        if (grade.teacher) {
          gradeDTO.teacher = TeacherDTOMapper.toDetailDTO(grade.teacher);
        }

        return gradeDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(gradeDTOs), this.CACHE_TTL);

      return gradeDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradesBySchool service:", error);
      throw new AppError("Failed to get grades by school");
    }
  }

  /**
   * Get grades by teacher
   */
  public async getGradesByTeacher(
    teacherId: string
  ): Promise<GradeDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}teacher:${teacherId}`;
      const cachedGrades = await cache.get(cacheKey);

      if (cachedGrades) {
        return JSON.parse(cachedGrades);
      }

      // Check if teacher exists
      await teacherService.getTeacherById(teacherId);

      const grades = await this.repository.findGradesByTeacher(teacherId);

      // Map to DTOs with schools and teachers
      const gradeDTOs = grades.map((grade) => {
        const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

        if (grade.school) {
          gradeDTO.school = SchoolDTOMapper.toDetailDTO(grade.school);
        }

        if (grade.teacher) {
          gradeDTO.teacher = TeacherDTOMapper.toDetailDTO(grade.teacher);
        }

        return gradeDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(gradeDTOs), this.CACHE_TTL);

      return gradeDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradesByTeacher service:", error);
      throw new AppError("Failed to get grades by teacher");
    }
  }

  /**
   * Validate grade data
   */
  public async validateGradeData(
    gradeData: CreateGradeDTO | UpdateGradeDTO
  ): Promise<boolean> {
    // Validate min and max age values
    if (
      "minAge" in gradeData &&
      "maxAge" in gradeData &&
      gradeData.minAge !== null &&
      gradeData.minAge !== undefined &&
      gradeData.maxAge !== null &&
      gradeData.maxAge !== undefined
    ) {
      if (gradeData.minAge > gradeData.maxAge) {
        throw new BadRequestError(
          "Minimum age cannot be greater than maximum age"
        );
      }
    }

    // Validate age values as positive integers
    if (
      "minAge" in gradeData &&
      gradeData.minAge !== null &&
      gradeData.minAge !== undefined
    ) {
      if (gradeData.minAge < 0 || !Number.isInteger(gradeData.minAge)) {
        throw new BadRequestError("Minimum age must be a positive integer");
      }
    }

    if (
      "maxAge" in gradeData &&
      gradeData.maxAge !== null &&
      gradeData.maxAge !== undefined
    ) {
      if (gradeData.maxAge < 0 || !Number.isInteger(gradeData.maxAge)) {
        throw new BadRequestError("Maximum age must be a positive integer");
      }
    }

    return true;
  }

  /**
   * Get grade statistics
   */
  public async getGradeStatistics(): Promise<GradeStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getGradeStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradeStatistics service:", error);
      throw new AppError("Failed to get grade statistics");
    }
  }

  /**
   * Create multiple grades at once
   */
  public async createGradesBulk(
    gradesData: CreateGradeDTO[]
  ): Promise<GradeDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all grade data
      for (const gradeData of gradesData) {
        await this.validateGradeData(gradeData);

        // Check if school exists
        await schoolService.getSchoolById(gradeData.schoolId);

        // Check if teacher exists if provided
        if (gradeData.teacherId) {
          await teacherService.getTeacherById(gradeData.teacherId);
        }
      }

      // Create grades in bulk
      const newGrades = await this.repository.createGradesBulk(
        gradesData,
        transaction
      );

      await transaction.commit();

      // Get the complete grades with schools and teachers
      const gradeIds = newGrades.map((grade) => grade.id);
      const detailedGrades: GradeDetailDTO[] = [];

      for (const id of gradeIds) {
        const grade = await this.repository.findGradeById(id);
        if (grade) {
          const gradeDTO = GradeDTOMapper.toDetailDTO(grade);

          if (grade.school) {
            gradeDTO.school = SchoolDTOMapper.toDetailDTO(grade.school);
          }

          if (grade.teacher) {
            gradeDTO.teacher = TeacherDTOMapper.toDetailDTO(grade.teacher);
          }

          detailedGrades.push(gradeDTO);
        }
      }

      return detailedGrades;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createGradesBulk service:", error);
      throw new AppError("Failed to create grades in bulk");
    }
  }

  /**
   * Delete multiple grades at once
   */
  public async deleteGradesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify grades exist
      const grades = await Promise.all(
        ids.map((id) => this.repository.findGradeById(id))
      );

      // Filter out any null results (grades not found)
      const existingGrades = grades.filter((grade) => grade !== null);

      if (existingGrades.length === 0) {
        throw new NotFoundError("None of the specified grades were found");
      }

      // Delete grades
      const deletedCount = await this.repository.deleteGradesBulk(
        existingGrades.map((grade) => grade!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted grade
      for (const grade of existingGrades) {
        if (grade) {
          await this.clearGradeCache(grade.id);

          // Clear school grades cache
          await cache.del(`${this.CACHE_PREFIX}school:${grade.schoolId}`);

          // Clear teacher grades cache if teacher was assigned
          if (grade.teacherId) {
            await cache.del(`${this.CACHE_PREFIX}teacher:${grade.teacherId}`);
          }
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
      logger.error("Error in deleteGradesBulk service:", error);
      throw new AppError("Failed to delete grades in bulk");
    }
  }

  /**
   * Clear grade cache
   */
  private async clearGradeCache(gradeId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${gradeId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new GradeService(repository);
