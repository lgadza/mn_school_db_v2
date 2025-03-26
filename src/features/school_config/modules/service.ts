import { IModuleService, IModuleRepository } from "./interfaces/services";
import {
  ModuleDetailDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  PaginatedModuleListDTO,
  ModuleListQueryParams,
  ModuleDTOMapper,
  BulkCreateModuleDTO,
  BulkDeleteModuleDTO,
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
import { ModuleDeletionResult } from "./interfaces/interfaces";
import db from "@/config/database";

export class ModuleService implements IModuleService {
  private repository: IModuleRepository;
  private readonly CACHE_PREFIX = "module:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IModuleRepository) {
    this.repository = repository;
  }

  /**
   * Get module by ID
   */
  public async getModuleById(id: string): Promise<ModuleDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedModule = await cache.get(cacheKey);

      if (cachedModule) {
        return JSON.parse(cachedModule);
      }

      // Get from database if not in cache
      const module = await this.repository.findModuleById(id);
      if (!module) {
        throw new NotFoundError(`Module with ID ${id} not found`);
      }

      // Map to DTO
      const moduleDTO = ModuleDTOMapper.toDetailDTO(module);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(moduleDTO), this.CACHE_TTL);

      return moduleDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getModuleById service:", error);
      throw new AppError("Failed to get module");
    }
  }

  /**
   * Get modules by class ID
   */
  public async getModulesByClassId(
    classId: string
  ): Promise<ModuleDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}class:${classId}`;
      const cachedModules = await cache.get(cacheKey);

      if (cachedModules) {
        return JSON.parse(cachedModules);
      }

      // Get from database if not in cache
      const modules = await this.repository.findModulesByClassId(classId);

      // Map to DTOs
      const moduleDTOs = modules.map((module) =>
        ModuleDTOMapper.toDetailDTO(module)
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(moduleDTOs), this.CACHE_TTL);

      return moduleDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getModulesByClassId service:", error);
      throw new AppError("Failed to get modules by class");
    }
  }

  /**
   * Get modules by subject ID
   */
  public async getModulesBySubjectId(
    subjectId: string
  ): Promise<ModuleDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}subject:${subjectId}`;
      const cachedModules = await cache.get(cacheKey);

      if (cachedModules) {
        return JSON.parse(cachedModules);
      }

      // Get from database if not in cache
      const modules = await this.repository.findModulesBySubjectId(subjectId);

      // Map to DTOs
      const moduleDTOs = modules.map((module) =>
        ModuleDTOMapper.toDetailDTO(module)
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(moduleDTOs), this.CACHE_TTL);

      return moduleDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getModulesBySubjectId service:", error);
      throw new AppError("Failed to get modules by subject");
    }
  }

  /**
   * Get modules by teacher ID
   */
  public async getModulesByTeacherId(
    teacherId: string
  ): Promise<ModuleDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}teacher:${teacherId}`;
      const cachedModules = await cache.get(cacheKey);

      if (cachedModules) {
        return JSON.parse(cachedModules);
      }

      // Get from database if not in cache
      const modules = await this.repository.findModulesByTeacherId(teacherId);

      // Map to DTOs
      const moduleDTOs = modules.map((module) =>
        ModuleDTOMapper.toDetailDTO(module)
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(moduleDTOs), this.CACHE_TTL);

      return moduleDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getModulesByTeacherId service:", error);
      throw new AppError("Failed to get modules by teacher");
    }
  }

  /**
   * Create a new module
   */
  public async createModule(
    moduleData: CreateModuleDTO
  ): Promise<ModuleDetailDTO> {
    try {
      // Validate data
      await this.validateModuleData(moduleData);

      // Create the module
      const newModule = await this.repository.createModule(moduleData);

      // Get the complete module with relationships
      const module = await this.repository.findModuleById(newModule.id);
      if (!module) {
        throw new AppError("Failed to retrieve created module");
      }

      // Map to DTO
      const moduleDTO = ModuleDTOMapper.toDetailDTO(module);

      // Clear related cache entries
      await this.clearRelatedCache(
        moduleData.classId,
        moduleData.subjectId,
        moduleData.teacherId
      );

      return moduleDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createModule service:", error);
      throw new AppError("Failed to create module");
    }
  }

  /**
   * Bulk create modules
   */
  public async bulkCreateModules(
    modulesData: BulkCreateModuleDTO[]
  ): Promise<ModuleDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all modules data
      for (const moduleData of modulesData) {
        await this.validateModuleData(moduleData);
      }

      // Create the modules
      const newModules = await this.repository.bulkCreateModules(
        modulesData,
        transaction
      );

      // Commit transaction
      await transaction.commit();

      // Get all the created modules with relationships
      const moduleIds = newModules.map((module) => module.id);
      const moduleDTOs: ModuleDetailDTO[] = [];

      for (const id of moduleIds) {
        const module = await this.repository.findModuleById(id);
        if (module) {
          moduleDTOs.push(ModuleDTOMapper.toDetailDTO(module));
        }
      }

      // Clear related cache entries
      const classIds = new Set(modulesData.map((m) => m.classId));
      const subjectIds = new Set(modulesData.map((m) => m.subjectId));
      const teacherIds = new Set(modulesData.map((m) => m.teacherId));

      for (const classId of classIds) {
        await cache.del(`${this.CACHE_PREFIX}class:${classId}`);
      }
      for (const subjectId of subjectIds) {
        await cache.del(`${this.CACHE_PREFIX}subject:${subjectId}`);
      }
      for (const teacherId of teacherIds) {
        await cache.del(`${this.CACHE_PREFIX}teacher:${teacherId}`);
      }

      return moduleDTOs;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in bulkCreateModules service:", error);
      throw new AppError("Failed to bulk create modules");
    }
  }

  /**
   * Update a module
   */
  public async updateModule(
    id: string,
    moduleData: UpdateModuleDTO
  ): Promise<ModuleDetailDTO> {
    try {
      // Check if module exists
      const existingModule = await this.repository.findModuleById(id);
      if (!existingModule) {
        throw new NotFoundError(`Module with ID ${id} not found`);
      }

      // Validate data
      await this.validateModuleData(moduleData, id);

      // Update module
      await this.repository.updateModule(id, moduleData);

      // Clear module cache
      await this.clearModuleCache(id);

      // Clear related cache entries if these fields are changing
      if (
        moduleData.classId ||
        moduleData.subjectId ||
        moduleData.teacherId ||
        moduleData.assistantTeacherId ||
        undefined
      ) {
        // Clear old relations
        await this.clearRelatedCache(
          existingModule.classId,
          existingModule.subjectId,
          existingModule.teacherId,
          existingModule.assistantTeacherId || undefined
        );

        await this.clearRelatedCache(
          moduleData.classId,
          moduleData.subjectId,
          moduleData.teacherId,
          moduleData.assistantTeacherId || undefined
        );
      }

      // Get the updated module
      return this.getModuleById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateModule service:", error);
      throw new AppError("Failed to update module");
    }
  }

  /**
   * Delete a module
   */
  public async deleteModule(id: string): Promise<boolean> {
    try {
      // Check if module exists
      const existingModule = await this.repository.findModuleById(id);
      if (!existingModule) {
        throw new NotFoundError(`Module with ID ${id} not found`);
      }

      // Delete the module
      const result = await this.repository.deleteModule(id);

      // Clear module cache
      await this.clearModuleCache(id);

      // Clear related cache entries
      await this.clearRelatedCache(
        existingModule.classId,
        existingModule.subjectId,
        existingModule.teacherId,
        existingModule.assistantTeacherId || undefined
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteModule service:", error);
      throw new AppError("Failed to delete module");
    }
  }

  /**
   * Bulk delete modules
   */
  public async bulkDeleteModules(
    criteria: BulkDeleteModuleDTO
  ): Promise<ModuleDeletionResult> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate criteria
      if (
        (!criteria.ids || criteria.ids.length === 0) &&
        !criteria.classId &&
        !criteria.subjectId &&
        !criteria.teacherId &&
        !criteria.schoolId &&
        !criteria.termId
      ) {
        throw new BadRequestError(
          "At least one deletion criteria must be provided"
        );
      }

      // Delete the modules
      const result = await this.repository.bulkDeleteModules(
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
      logger.error("Error in bulkDeleteModules service:", error);
      throw new AppError("Failed to bulk delete modules");
    }
  }

  /**
   * Get paginated module list
   */
  public async getModuleList(
    params: ModuleListQueryParams
  ): Promise<PaginatedModuleListDTO> {
    try {
      const { modules, total } = await this.repository.getModuleList(params);

      // Map to DTOs with associations
      const moduleDTOs = modules.map((module) =>
        ModuleDTOMapper.toDetailDTO(module)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        modules: moduleDTOs,
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
      logger.error("Error in getModuleList service:", error);
      throw new AppError("Failed to get module list");
    }
  }

  /**
   * Validate module data
   */
  public async validateModuleData(
    moduleData: CreateModuleDTO | UpdateModuleDTO,
    moduleId?: string
  ): Promise<boolean> {
    // Check if the module name is taken in this class
    if (moduleData.name && moduleData.classId) {
      const isNameTaken = await this.repository.isModuleNameTakenInClass(
        moduleData.name,
        moduleData.classId,
        moduleId
      );
      if (isNameTaken) {
        throw new ConflictError(
          `Module with name "${moduleData.name}" already exists in this class`
        );
      }
    }

    // Add additional validation logic as needed
    // For example, validate if the related entities (subject, class, teacher, etc.) exist

    return true;
  }

  /**
   * Clear module cache
   */
  private async clearModuleCache(moduleId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${moduleId}`;
    await cache.del(cacheKey);
  }

  /**
   * Clear related cache entries
   */
  private async clearRelatedCache(
    classId?: string,
    subjectId?: string,
    teacherId?: string,
    assistantTeacherId?: string
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
    if (assistantTeacherId) {
      await cache.del(`${this.CACHE_PREFIX}teacher:${assistantTeacherId}`);
    }
  }
}

// Create and export service instance
export default new ModuleService(repository);
