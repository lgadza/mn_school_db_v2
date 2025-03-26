import {
  IProjectGradeService,
  IProjectGradeRepository,
} from "./interfaces/services";
import {
  ProjectGradeInterface,
  ProjectGradeDeletionResult,
} from "./interfaces/interfaces";
import {
  CreateGradeDTO,
  UpdateGradeDTO,
  GradeListQueryParams,
  GradeDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import projectService from "../project/service";
import studentService from "../../accounts/students/service";
import userService from "../../users/service";
import db from "@/config/database";

export class ProjectGradeService implements IProjectGradeService {
  private repository: IProjectGradeRepository;
  private readonly CACHE_PREFIX = "project-grade:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IProjectGradeRepository) {
    this.repository = repository;
  }

  /**
   * Get grade by ID
   */
  public async getGradeById(id: string): Promise<ProjectGradeInterface> {
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

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(grade), this.CACHE_TTL);

      return grade;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradeById service:", error);
      throw new AppError("Failed to get grade");
    }
  }

  /**
   * Get grades by project ID
   */
  public async getGradesByProjectId(
    projectId: string
  ): Promise<ProjectGradeInterface[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}project:${projectId}`;
      const cachedGrades = await cache.get(cacheKey);

      if (cachedGrades) {
        return JSON.parse(cachedGrades);
      }

      // Verify project exists
      try {
        await projectService.getProjectById(projectId);
      } catch (error) {
        throw new NotFoundError(`Project with ID ${projectId} not found`);
      }

      // Get from database if not in cache
      const grades = await this.repository.findGradesByProjectId(projectId);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(grades), this.CACHE_TTL);

      return grades;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradesByProjectId service:", error);
      throw new AppError("Failed to get project grades");
    }
  }

  /**
   * Get grades by student ID
   */
  public async getGradesByStudentId(
    studentId: string
  ): Promise<ProjectGradeInterface[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}student:${studentId}`;
      const cachedGrades = await cache.get(cacheKey);

      if (cachedGrades) {
        return JSON.parse(cachedGrades);
      }

      // Verify student exists
      try {
        await studentService.getStudentById(studentId);
      } catch (error) {
        throw new NotFoundError(`Student with ID ${studentId} not found`);
      }

      // Get from database if not in cache
      const grades = await this.repository.findGradesByStudentId(studentId);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(grades), this.CACHE_TTL);

      return grades;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradesByStudentId service:", error);
      throw new AppError("Failed to get student grades");
    }
  }

  /**
   * Get grade by project and student
   */
  public async getGradeByProjectAndStudent(
    projectId: string,
    studentId: string
  ): Promise<ProjectGradeInterface | null> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}project:${projectId}:student:${studentId}`;
      const cachedGrade = await cache.get(cacheKey);

      if (cachedGrade) {
        return JSON.parse(cachedGrade);
      }

      // Verify project and student exist
      try {
        await projectService.getProjectById(projectId);
      } catch (error) {
        throw new NotFoundError(`Project with ID ${projectId} not found`);
      }

      try {
        await studentService.getStudentById(studentId);
      } catch (error) {
        throw new NotFoundError(`Student with ID ${studentId} not found`);
      }

      // Get from database if not in cache
      const grade = await this.repository.findGradeByProjectAndStudent(
        projectId,
        studentId
      );

      if (grade) {
        // Store in cache
        await cache.set(cacheKey, JSON.stringify(grade), this.CACHE_TTL);
      }

      return grade;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getGradeByProjectAndStudent service:", error);
      throw new AppError("Failed to get grade for project and student");
    }
  }

  /**
   * Create a new grade
   */
  public async createGrade(
    gradeData: CreateGradeDTO
  ): Promise<ProjectGradeInterface> {
    try {
      // Validate data
      if (gradeData.score < 0 || gradeData.maxScore < 0) {
        throw new BadRequestError("Scores cannot be negative");
      }

      if (gradeData.score > gradeData.maxScore) {
        throw new BadRequestError("Score cannot exceed maximum score");
      }

      // Verify project exists
      try {
        await projectService.getProjectById(gradeData.projectId);
      } catch (error) {
        throw new NotFoundError(`Project with ID ${gradeData.projectId} not found`);
      }

      // Verify student exists
      try {
        await studentService.getStudentById(gradeData.studentId);
      } catch (error) {
        throw new NotFoundError(`Student with ID ${gradeData.studentId} not found`);
      }

      // Verify grader (teacher/admin) exists
      try {
        await userService.getUserById(gradeData.graderId);
      } catch (error) {
        throw new NotFoundError(`User with ID ${gradeData.graderId} not found`);
      }

      // Check if grade already exists for this project-student combination
      const existingGrade = await this.repository.findGradeByProjectAndStudent(
        gradeData.projectId,
        gradeData.studentId
      );

      if (existingGrade) {
        throw new ConflictError(
          `A grade already exists for this project and student`
        );
      }

      // Parse dates if strings are provided
      if (gradeData.submissionDate && typeof gradeData.submissionDate === 'string') {
        gradeData.submissionDate = new Date(gradeData.submissionDate);
      }
      
      if (gradeData.gradedDate && typeof gradeData.gradedDate === 'string') {
        gradeData.gradedDate = new Date(gradeData.gradedDate);
      }

      // Create the grade
      const newGrade = await this.repository.createGrade(gradeData);

      // Clear related caches
      await this.clearProjectGradesCache(gradeData.projectId);
      await this.clearStudentGradesCache(gradeData.studentId);

      return newGrade;
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
  ): Promise<ProjectGradeInterface> {
    try {
      // Check if grade exists
      const existingGrade = await this.repository.findGradeById(id);
      if (!existingGrade) {
        throw new NotFoundError(`Grade with ID ${id} not found`);
      }

      // Validate score data if provided
      if (gradeData.score !== undefined && gradeData.maxScore !== undefined) {
        if (gradeData.score < 0 || gradeData.maxScore < 0) {
          throw new BadRequestError("Scores cannot be negative");
        }

        if (gradeData.score > gradeData.maxScore) {
          throw new BadRequestError("Score cannot exceed maximum score");
        }
      } else if (gradeData.score !== undefined) {
        if (gradeData.score < 0) {
          throw new BadRequestError("Score cannot be negative");
        }

        if (gradeData.score > existingGrade.maxScore) {
          throw new BadRequestError("Score cannot exceed maximum score");
        }
      } else if (gradeData.maxScore !== undefined) {
        if (gradeData.maxScore < 0) {
          throw new BadRequestError("Maximum score cannot be negative");
        }

        if (existingGrade.score > gradeData.maxScore) {
          throw new BadRequestError("Current score exceeds the new maximum score");
        }
      }

      // Parse dates if strings are provided
      if (gradeData.submissionDate && typeof gradeData.submissionDate === 'string') {
        gradeData.submissionDate = new Date(gradeData.submissionDate);
      }
      
      if (gradeData.gradedDate && typeof gradeData.gradedDate === 'string') {
        gradeData.gradedDate = new Date(gradeData.gradedDate);
      }

      // Update the grade
      await this.repository.updateGrade(id, gradeData);

      // Clear caches
      await this.clearGradeCache(id);
      await this.clearProjectGradesCache(existingGrade.projectId);
      await this.clearStudentGradesCache(existingGrade.studentId);
      await this.clearProjectStudentGradeCache(
        existingGrade.projectId,
        existingGrade.studentId
      );

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
    const transaction = await db.sequelize.transaction();

    try {
      // Check if grade exists
      const existingGrade = await this.repository.findGradeById(id);
      if (!existingGrade) {
        throw new NotFoundError(`Grade with ID ${id} not found`);
      }

      // Delete the grade
      const result = await this.repository.deleteGrade(id, transaction);

      // Commit transaction
      await transaction.commit();

      // Clear caches
      await this.clearGradeCache(id);
      await this.clearProjectGradesCache(existingGrade.projectId);
      await this.clearStudentGradesCache(existingGrade.studentId);
      await this.clearProjectStudentGradeCache(
        existingGrade.projectId,
        existingGrade.studentId
      );

      return result;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteGrade service:", error);
      throw new AppError("Failed to delete grade");
    }
  }

  /**
   * Bulk delete grades for a project
   */
  public async bulkDeleteGrades(
    projectId: string
  ): Promise<ProjectGradeDeletionResult> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify project exists
      try {
        await projectService.getProjectById(projectId);
      } catch (error) {
        throw new NotFoundError(`Project with ID ${projectId} not found`);
      }

      // Get all grades for this project to clear student caches later
      const grades = await this.repository.findGradesByProjectId(projectId);
      const studentIds = grades.map(grade => grade.studentId);

      // Delete all grades for the project
      const result = await this.repository.bulkDeleteGrades(
        projectId,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      // Clear project grades cache
      await this.clearProjectGradesCache(projectId);

      // Clear all affected student grades caches
      for (const studentId of studentIds) {
        await this.clearStudentGradesCache(studentId);
        await this.clearProjectStudentGradeCache(projectId, studentId);
      }

      return result;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in bulkDeleteGrades service:", error);
      throw new AppError("Failed to bulk delete grades");
    }
  }

  /**
   * Get paginated grade list
   */
  public async getGradeList(params: GradeListQueryParams): Promise<{
    grades: ProjectGradeInterface[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    try {
      // Verify entities exist if IDs are provided
      if (params.projectId) {
        try {
          await projectService.getProjectById(params.projectId);
        } catch (error) {
          throw new NotFoundError(`Project with ID ${params.projectId} not found`);
        }
      }

      if (params.studentId) {
        try {
          await studentService.getStudentById(params.studentId);
        } catch (error) {
          throw new NotFoundError(`Student with ID ${params.studentId} not found`);
        }
      }

      if (params.graderId) {
        try {
          await userService.getUserById(params.graderId);
        } catch (error) {
          throw new NotFoundError(`User with ID ${params.graderId} not found`);
        }
      }

      // Validate score filters if provided
      if (params.minScore !== undefined && params.maxScore !== undefined) {
        if (params.minScore > params.maxScore) {
          throw new BadRequestError("Minimum score cannot be greater than maximum score");
        }
      }

      const { grades, total } = await this.repository.getGradeList(params);
      const { page = 1, limit = 20 } = params;

      return {
        grades,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
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
   * Clear grade cache
   */
  private async clearGradeCache(gradeId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${gradeId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear project grades cache
   */
  private async clearProjectGradesCache(projectId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}project:${projectId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear student grades cache
   */
  private async clearStudentGradesCache(studentId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}student:${studentId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear project-student grade cache
   */
  private async clearProjectStudentGradeCache(
    projectId: string,
    studentId: string
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}project:${projectId}:student:${studentId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new ProjectGradeService(repository);
