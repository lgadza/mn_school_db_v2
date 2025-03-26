import { IProjectService, IProjectRepository } from "./interfaces/services";
import {
  ProjectDetailDTO,
  CreateProjectDTO,
  UpdateProjectDTO,
  PaginatedProjectListDTO,
  ProjectListQueryParams,
  ProjectDTOMapper,
  BulkCreateProjectDTO,
  BulkDeleteProjectDTO,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { ProjectDeletionResult } from "./interfaces/interfaces";
import db from "@/config/database";

export class ProjectService implements IProjectService {
  private repository: IProjectRepository;
  private readonly CACHE_PREFIX = "project:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IProjectRepository) {
    this.repository = repository;
  }

  /**
   * Get project by ID
   */
  public async getProjectById(id: string): Promise<ProjectDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedProject = await cache.get(cacheKey);

      if (cachedProject) {
        return JSON.parse(cachedProject);
      }

      // Get from database if not in cache
      const project = await this.repository.findProjectById(id);
      if (!project) {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }

      // Map to DTO
      const projectDTO = ProjectDTOMapper.toDetailDTO(project);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(projectDTO), this.CACHE_TTL);

      return projectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProjectById service:", error);
      throw new AppError("Failed to get project");
    }
  }

  /**
   * Get projects by class ID
   */
  public async getProjectsByClassId(
    classId: string
  ): Promise<ProjectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}class:${classId}`;
      const cachedProjects = await cache.get(cacheKey);

      if (cachedProjects) {
        return JSON.parse(cachedProjects);
      }

      // Get from database if not in cache
      const projects = await this.repository.findProjectsByClassId(classId);

      // Map to DTOs
      const projectDTOs = projects.map((project) =>
        ProjectDTOMapper.toDetailDTO(project)
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(projectDTOs), this.CACHE_TTL);

      return projectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProjectsByClassId service:", error);
      throw new AppError("Failed to get projects by class");
    }
  }

  /**
   * Get projects by subject ID
   */
  public async getProjectsBySubjectId(
    subjectId: string
  ): Promise<ProjectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}subject:${subjectId}`;
      const cachedProjects = await cache.get(cacheKey);

      if (cachedProjects) {
        return JSON.parse(cachedProjects);
      }

      // Get from database if not in cache
      const projects = await this.repository.findProjectsBySubjectId(subjectId);

      // Map to DTOs
      const projectDTOs = projects.map((project) =>
        ProjectDTOMapper.toDetailDTO(project)
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(projectDTOs), this.CACHE_TTL);

      return projectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProjectsBySubjectId service:", error);
      throw new AppError("Failed to get projects by subject");
    }
  }

  /**
   * Get projects by teacher ID
   */
  public async getProjectsByTeacherId(
    teacherId: string
  ): Promise<ProjectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}teacher:${teacherId}`;
      const cachedProjects = await cache.get(cacheKey);

      if (cachedProjects) {
        return JSON.parse(cachedProjects);
      }

      // Get from database if not in cache
      const projects = await this.repository.findProjectsByTeacherId(teacherId);

      // Map to DTOs
      const projectDTOs = projects.map((project) =>
        ProjectDTOMapper.toDetailDTO(project)
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(projectDTOs), this.CACHE_TTL);

      return projectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProjectsByTeacherId service:", error);
      throw new AppError("Failed to get projects by teacher");
    }
  }

  /**
   * Create a new project
   */
  public async createProject(
    projectData: CreateProjectDTO
  ): Promise<ProjectDetailDTO> {
    try {
      // Validate data
      await this.validateProjectData(projectData);

      // Create the project
      const newProject = await this.repository.createProject(projectData);

      // Get the complete project with relationships
      const project = await this.repository.findProjectById(newProject.id);
      if (!project) {
        throw new AppError("Failed to retrieve created project");
      }

      // Map to DTO
      const projectDTO = ProjectDTOMapper.toDetailDTO(project);

      // Clear related cache entries
      await this.clearRelatedCache(
        projectData.classId ?? undefined,
        projectData.subjectId ?? undefined,
        projectData.teacherId ?? undefined
      );

      return projectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createProject service:", error);
      throw new AppError("Failed to create project");
    }
  }

  /**
   * Bulk create projects
   */
  public async bulkCreateProjects(
    projectsData: BulkCreateProjectDTO[]
  ): Promise<ProjectDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all projects data
      for (const projectData of projectsData) {
        await this.validateProjectData(projectData);
      }

      // Create the projects
      const newProjects = await this.repository.bulkCreateProjects(
        projectsData,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      // Get all the created projects with relationships
      const projectIds = newProjects.map((project) => project.id);
      const projectDTOs: ProjectDetailDTO[] = [];

      for (const id of projectIds) {
        const project = await this.repository.findProjectById(id);
        if (project) {
          projectDTOs.push(ProjectDTOMapper.toDetailDTO(project));
        }
      }

      // Clear related cache entries
      const classIds = new Set(
        projectsData.map((p) => p.classId).filter(Boolean)
      );
      const subjectIds = new Set(projectsData.map((p) => p.subjectId));
      const teacherIds = new Set(projectsData.map((p) => p.teacherId));

      for (const classId of classIds) {
        await cache.del(`${this.CACHE_PREFIX}class:${classId}`);
      }
      for (const subjectId of subjectIds) {
        await cache.del(`${this.CACHE_PREFIX}subject:${subjectId}`);
      }
      for (const teacherId of teacherIds) {
        await cache.del(`${this.CACHE_PREFIX}teacher:${teacherId}`);
      }

      return projectDTOs;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in bulkCreateProjects service:", error);
      throw new AppError("Failed to bulk create projects");
    }
  }

  /**
   * Update a project
   */
  public async updateProject(
    id: string,
    projectData: UpdateProjectDTO
  ): Promise<ProjectDetailDTO> {
    try {
      // Check if project exists
      const existingProject = await this.repository.findProjectById(id);
      if (!existingProject) {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }

      // Validate data
      await this.validateProjectData(projectData, id);

      // Update project
      await this.repository.updateProject(id, projectData);

      // Clear project cache
      await this.clearProjectCache(id);

      // Clear related cache entries if these fields are changing
      if (
        projectData.classId !== undefined ||
        projectData.subjectId !== undefined ||
        projectData.teacherId !== undefined
      ) {
        // Clear old relations
        await this.clearRelatedCache(
          existingProject.classId ?? undefined,
          existingProject.subjectId ?? undefined,
          existingProject.teacherId ?? undefined
        );

        // Clear new relations
        await this.clearRelatedCache(
          projectData.classId ?? undefined,
          projectData.subjectId ?? undefined,
          projectData.teacherId ?? undefined
        );
      }

      // Get the updated project
      return this.getProjectById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateProject service:", error);
      throw new AppError("Failed to update project");
    }
  }

  /**
   * Delete a project
   */
  public async deleteProject(id: string): Promise<boolean> {
    try {
      // Check if project exists
      const existingProject = await this.repository.findProjectById(id);
      if (!existingProject) {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }

      // Delete the project
      const result = await this.repository.deleteProject(id);

      // Clear project cache
      await this.clearProjectCache(id);

      // Clear related cache entries
      await this.clearRelatedCache(
        existingProject.classId ?? undefined,
        existingProject.subjectId ?? undefined,
        existingProject.teacherId ?? undefined
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteProject service:", error);
      throw new AppError("Failed to delete project");
    }
  }

  /**
   * Bulk delete projects
   */
  public async bulkDeleteProjects(
    criteria: BulkDeleteProjectDTO
  ): Promise<ProjectDeletionResult> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate criteria
      if (
        (!criteria.ids || criteria.ids.length === 0) &&
        !criteria.classId &&
        !criteria.subjectId &&
        !criteria.teacherId &&
        !criteria.schoolId
      ) {
        throw new BadRequestError(
          "At least one deletion criteria must be provided"
        );
      }

      // Delete the projects
      const result = await this.repository.bulkDeleteProjects(
        criteria,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      // Clear related cache
      if (criteria.classId) {
        await cache.del(`${this.CACHE_PREFIX}class:${criteria.classId}`);
      }
      if (criteria.subjectId) {
        await cache.del(`${this.CACHE_PREFIX}subject:${criteria.subjectId}`);
      }
      if (criteria.teacherId) {
        await cache.del(`${this.CACHE_PREFIX}teacher:${criteria.teacherId}`);
      }
      if (criteria.ids && criteria.ids.length > 0) {
        for (const id of criteria.ids) {
          await cache.del(`${this.CACHE_PREFIX}${id}`);
        }
      }

      return result;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in bulkDeleteProjects service:", error);
      throw new AppError("Failed to bulk delete projects");
    }
  }

  /**
   * Get paginated project list
   */
  public async getProjectList(
    params: ProjectListQueryParams
  ): Promise<PaginatedProjectListDTO> {
    try {
      const { projects, total } = await this.repository.getProjectList(params);

      // Map to DTOs with associations
      const projectDTOs = projects.map((project) =>
        ProjectDTOMapper.toDetailDTO(project)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        projects: projectDTOs,
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
      logger.error("Error in getProjectList service:", error);
      throw new AppError("Failed to get project list");
    }
  }

  /**
   * Validate project data
   */
  public async validateProjectData(
    projectData: CreateProjectDTO | UpdateProjectDTO,
    projectId?: string
  ): Promise<boolean> {
    // Check if title is provided and teacher/class are specified
    if (projectData.title && projectData.teacherId) {
      // Check if the project title is taken for the same teacher and class
      const isNameTaken = await this.repository.isProjectTitleTaken(
        projectData.title,
        projectData.teacherId,
        projectData.classId ?? undefined,
        projectId
      );

      if (isNameTaken) {
        throw new ConflictError(
          `Project with title "${
            projectData.title
          }" already exists for this teacher${
            projectData.classId ? " and class" : ""
          }`
        );
      }
    }

    // Add additional validation logic as needed
    return true;
  }

  /**
   * Clear project cache
   */
  private async clearProjectCache(projectId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${projectId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear related cache entries
   */
  private async clearRelatedCache(
    classId?: string,
    subjectId?: string,
    teacherId?: string
  ): Promise<void> {
    if (classId) {
      await cache.del(`${this.CACHE_PREFIX}class:${classId}`);
    }
    if (subjectId) {
      await cache.del(`${this.CACHE_PREFIX}subject:${subjectId}`);
    }
    if (teacherId) {
      await cache.del(`${this.CACHE_PREFIX}teacher:${teacherId}`);
    }
  }
}

// Create and export service instance
export default new ProjectService(repository);
