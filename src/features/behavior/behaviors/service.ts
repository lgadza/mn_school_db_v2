import { IBehaviorService, IBehaviorRepository } from "./interfaces/services";
import {
  BehaviorDetailDTO,
  CreateBehaviorDTO,
  UpdateBehaviorDTO,
  PaginatedBehaviorListDTO,
  BehaviorListQueryParams,
  BehaviorDTOMapper,
} from "./dto";
import { BehaviorStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import { BehaviorTypeDTOMapper } from "../behavior_types/dto";
import schoolService from "../../schools/service";
import behaviorTypeService from "../behavior_types/service";
import classService from "../../school_config/classes/service";
import userService from "../../users/service";
import db from "@/config/database";

export class BehaviorService implements IBehaviorService {
  private repository: IBehaviorRepository;
  private readonly CACHE_PREFIX = "behavior:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IBehaviorRepository) {
    this.repository = repository;
  }

  /**
   * Get behavior by ID
   */
  public async getBehaviorById(id: string): Promise<BehaviorDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedBehavior = await cache.get(cacheKey);

      if (cachedBehavior) {
        return JSON.parse(cachedBehavior);
      }

      // Get from database if not in cache
      const behavior = await this.repository.findBehaviorById(id);
      if (!behavior) {
        throw new NotFoundError(`Behavior with ID ${id} not found`);
      }

      // Map to DTO with related entities
      const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

      // Map related entities if they exist
      if (behavior.school) {
        behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
      }

      if (behavior.behaviorType) {
        behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
          behavior.behaviorType
        );
      }

      if (behavior.class) {
        behaviorDTO.class = behavior.class;
      }

      if (behavior.staff) {
        behaviorDTO.staff = behavior.staff;
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(behaviorDTO), this.CACHE_TTL);

      return behaviorDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorById service:", error);
      throw new AppError("Failed to get behavior");
    }
  }

  /**
   * Create a new behavior
   */
  public async createBehavior(
    behaviorData: CreateBehaviorDTO
  ): Promise<BehaviorDetailDTO> {
    try {
      // Validate data
      await this.validateBehaviorData(behaviorData);

      // Check if required entities exist
      await schoolService.getSchoolById(behaviorData.schoolId);
      await behaviorTypeService.getBehaviorTypeById(
        behaviorData.behaviorTypeId
      );
      await classService.getClassById(behaviorData.classId);
      await userService.getUserById(behaviorData.staffId);

      // Create the behavior
      const newBehavior = await this.repository.createBehavior(behaviorData);

      // Get the complete behavior with related entities
      const behavior = await this.repository.findBehaviorById(newBehavior.id);
      if (!behavior) {
        throw new AppError("Failed to retrieve created behavior");
      }

      // Map to DTO with related entities
      const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

      if (behavior.school) {
        behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
      }

      if (behavior.behaviorType) {
        behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
          behavior.behaviorType
        );
      }

      if (behavior.class) {
        behaviorDTO.class = behavior.class;
      }

      if (behavior.staff) {
        behaviorDTO.staff = behavior.staff;
      }

      return behaviorDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBehavior service:", error);
      throw new AppError("Failed to create behavior");
    }
  }

  /**
   * Update a behavior
   */
  public async updateBehavior(
    id: string,
    behaviorData: UpdateBehaviorDTO
  ): Promise<BehaviorDetailDTO> {
    try {
      // Check if behavior exists
      const existingBehavior = await this.repository.findBehaviorById(id);
      if (!existingBehavior) {
        throw new NotFoundError(`Behavior with ID ${id} not found`);
      }

      // Validate data
      await this.validateBehaviorData(behaviorData);

      // Check if related entities exist if provided
      if (behaviorData.schoolId) {
        await schoolService.getSchoolById(behaviorData.schoolId);
      }

      if (behaviorData.behaviorTypeId) {
        await behaviorTypeService.getBehaviorTypeById(
          behaviorData.behaviorTypeId
        );
      }

      if (behaviorData.classId) {
        await classService.getClassById(behaviorData.classId);
      }

      if (behaviorData.staffId) {
        await userService.getUserById(behaviorData.staffId);
      }

      // Update behavior
      await this.repository.updateBehavior(id, behaviorData);

      // Clear cache
      await this.clearBehaviorCache(id);

      // Get the updated behavior
      return this.getBehaviorById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateBehavior service:", error);
      throw new AppError("Failed to update behavior");
    }
  }

  /**
   * Delete a behavior
   */
  public async deleteBehavior(id: string): Promise<boolean> {
    try {
      // Check if behavior exists
      const existingBehavior = await this.repository.findBehaviorById(id);
      if (!existingBehavior) {
        throw new NotFoundError(`Behavior with ID ${id} not found`);
      }

      // Delete the behavior
      const result = await this.repository.deleteBehavior(id);

      // Clear cache
      await this.clearBehaviorCache(id);

      // Clear related caches
      await cache.del(
        `${this.CACHE_PREFIX}school:${existingBehavior.schoolId}`
      );
      await cache.del(
        `${this.CACHE_PREFIX}student:${existingBehavior.studentId}`
      );
      await cache.del(`${this.CACHE_PREFIX}class:${existingBehavior.classId}`);
      await cache.del(
        `${this.CACHE_PREFIX}behaviorType:${existingBehavior.behaviorTypeId}`
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteBehavior service:", error);
      throw new AppError("Failed to delete behavior");
    }
  }

  /**
   * Get paginated behavior list
   */
  public async getBehaviorList(
    params: BehaviorListQueryParams
  ): Promise<PaginatedBehaviorListDTO> {
    try {
      const { behaviors, total } = await this.repository.getBehaviorList(
        params
      );

      // Map to DTOs with related entities
      const behaviorDTOs = behaviors.map((behavior) => {
        const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

        if (behavior.school) {
          behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
        }

        if (behavior.behaviorType) {
          behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
            behavior.behaviorType
          );
        }

        if (behavior.class) {
          behaviorDTO.class = behavior.class;
        }

        if (behavior.staff) {
          behaviorDTO.staff = behavior.staff;
        }

        return behaviorDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        behaviors: behaviorDTOs,
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
      logger.error("Error in getBehaviorList service:", error);
      throw new AppError("Failed to get behavior list");
    }
  }

  /**
   * Get behaviors by school
   */
  public async getBehaviorsBySchool(
    schoolId: string
  ): Promise<BehaviorDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedBehaviors = await cache.get(cacheKey);

      if (cachedBehaviors) {
        return JSON.parse(cachedBehaviors);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const behaviors = await this.repository.findBehaviorsBySchool(schoolId);

      // Map to DTOs with related entities
      const behaviorDTOs = behaviors.map((behavior) => {
        const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

        if (behavior.school) {
          behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
        }

        if (behavior.behaviorType) {
          behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
            behavior.behaviorType
          );
        }

        if (behavior.class) {
          behaviorDTO.class = behavior.class;
        }

        if (behavior.staff) {
          behaviorDTO.staff = behavior.staff;
        }

        return behaviorDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(behaviorDTOs), this.CACHE_TTL);

      return behaviorDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorsBySchool service:", error);
      throw new AppError("Failed to get behaviors by school");
    }
  }

  /**
   * Get behaviors by student
   */
  public async getBehaviorsByStudent(
    studentId: string
  ): Promise<BehaviorDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}student:${studentId}`;
      const cachedBehaviors = await cache.get(cacheKey);

      if (cachedBehaviors) {
        return JSON.parse(cachedBehaviors);
      }

      const behaviors = await this.repository.findBehaviorsByStudent(studentId);

      // Map to DTOs with related entities
      const behaviorDTOs = behaviors.map((behavior) => {
        const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

        if (behavior.school) {
          behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
        }

        if (behavior.behaviorType) {
          behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
            behavior.behaviorType
          );
        }

        if (behavior.class) {
          behaviorDTO.class = behavior.class;
        }

        if (behavior.staff) {
          behaviorDTO.staff = behavior.staff;
        }

        return behaviorDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(behaviorDTOs), this.CACHE_TTL);

      return behaviorDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorsByStudent service:", error);
      throw new AppError("Failed to get behaviors by student");
    }
  }

  /**
   * Get behaviors by class
   */
  public async getBehaviorsByClass(
    classId: string
  ): Promise<BehaviorDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}class:${classId}`;
      const cachedBehaviors = await cache.get(cacheKey);

      if (cachedBehaviors) {
        return JSON.parse(cachedBehaviors);
      }

      // Check if class exists
      await classService.getClassById(classId);

      const behaviors = await this.repository.findBehaviorsByClass(classId);

      // Map to DTOs with related entities
      const behaviorDTOs = behaviors.map((behavior) => {
        const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

        if (behavior.school) {
          behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
        }

        if (behavior.behaviorType) {
          behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
            behavior.behaviorType
          );
        }

        if (behavior.class) {
          behaviorDTO.class = behavior.class;
        }

        if (behavior.staff) {
          behaviorDTO.staff = behavior.staff;
        }

        return behaviorDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(behaviorDTOs), this.CACHE_TTL);

      return behaviorDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorsByClass service:", error);
      throw new AppError("Failed to get behaviors by class");
    }
  }

  /**
   * Get behaviors by behavior type
   */
  public async getBehaviorsByBehaviorType(
    behaviorTypeId: string
  ): Promise<BehaviorDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}behaviorType:${behaviorTypeId}`;
      const cachedBehaviors = await cache.get(cacheKey);

      if (cachedBehaviors) {
        return JSON.parse(cachedBehaviors);
      }

      // Check if behavior type exists
      await behaviorTypeService.getBehaviorTypeById(behaviorTypeId);

      const behaviors = await this.repository.findBehaviorsByBehaviorType(
        behaviorTypeId
      );

      // Map to DTOs with related entities
      const behaviorDTOs = behaviors.map((behavior) => {
        const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

        if (behavior.school) {
          behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
        }

        if (behavior.behaviorType) {
          behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
            behavior.behaviorType
          );
        }

        if (behavior.class) {
          behaviorDTO.class = behavior.class;
        }

        if (behavior.staff) {
          behaviorDTO.staff = behavior.staff;
        }

        return behaviorDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(behaviorDTOs), this.CACHE_TTL);

      return behaviorDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorsByBehaviorType service:", error);
      throw new AppError("Failed to get behaviors by behavior type");
    }
  }

  /**
   * Validate behavior data
   */
  public async validateBehaviorData(
    behaviorData: CreateBehaviorDTO | UpdateBehaviorDTO
  ): Promise<boolean> {
    // Validate date of incident is not in the future
    if ("dateOfIncident" in behaviorData && behaviorData.dateOfIncident) {
      const incidentDate = new Date(behaviorData.dateOfIncident);
      const now = new Date();
      if (incidentDate > now) {
        throw new BadRequestError("Date of incident cannot be in the future");
      }
    }

    // Ensure student name is provided if studentId is provided
    if (
      "studentId" in behaviorData &&
      behaviorData.studentId &&
      !("studentName" in behaviorData && behaviorData.studentName)
    ) {
      throw new BadRequestError(
        "Student name must be provided when student ID is provided"
      );
    }

    return true;
  }

  /**
   * Get behavior statistics
   */
  public async getBehaviorStatistics(): Promise<BehaviorStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getBehaviorStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorStatistics service:", error);
      throw new AppError("Failed to get behavior statistics");
    }
  }

  /**
   * Create multiple behaviors at once
   */
  public async createBehaviorsBulk(
    behaviorsData: CreateBehaviorDTO[]
  ): Promise<BehaviorDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all behavior data
      for (const behaviorData of behaviorsData) {
        await this.validateBehaviorData(behaviorData);

        // Check if required entities exist
        await schoolService.getSchoolById(behaviorData.schoolId);
        await behaviorTypeService.getBehaviorTypeById(
          behaviorData.behaviorTypeId
        );
        await classService.getClassById(behaviorData.classId);
        await userService.getUserById(behaviorData.staffId);
      }

      // Create behaviors in bulk
      const newBehaviors = await this.repository.createBehaviorsBulk(
        behaviorsData,
        transaction
      );

      await transaction.commit();

      // Get the complete behaviors with related entities
      const behaviorIds = newBehaviors.map((behavior) => behavior.id);
      const detailedBehaviors: BehaviorDetailDTO[] = [];

      for (const id of behaviorIds) {
        const behavior = await this.repository.findBehaviorById(id);
        if (behavior) {
          const behaviorDTO = BehaviorDTOMapper.toDetailDTO(behavior);

          if (behavior.school) {
            behaviorDTO.school = SchoolDTOMapper.toDetailDTO(behavior.school);
          }

          if (behavior.behaviorType) {
            behaviorDTO.behaviorType = BehaviorTypeDTOMapper.toDetailDTO(
              behavior.behaviorType
            );
          }

          if (behavior.class) {
            behaviorDTO.class = behavior.class;
          }

          if (behavior.staff) {
            behaviorDTO.staff = behavior.staff;
          }

          detailedBehaviors.push(behaviorDTO);
        }
      }

      return detailedBehaviors;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBehaviorsBulk service:", error);
      throw new AppError("Failed to create behaviors in bulk");
    }
  }

  /**
   * Delete multiple behaviors at once
   */
  public async deleteBehaviorsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify behaviors exist
      const behaviors = await Promise.all(
        ids.map((id) => this.repository.findBehaviorById(id))
      );

      // Filter out any null results (behaviors not found)
      const existingBehaviors = behaviors.filter(
        (behavior) => behavior !== null
      );

      if (existingBehaviors.length === 0) {
        throw new NotFoundError("None of the specified behaviors were found");
      }

      // Delete behaviors
      const deletedCount = await this.repository.deleteBehaviorsBulk(
        existingBehaviors.map((behavior) => behavior!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted behavior
      for (const behavior of existingBehaviors) {
        if (behavior) {
          await this.clearBehaviorCache(behavior.id);

          // Clear related caches
          await cache.del(`${this.CACHE_PREFIX}school:${behavior.schoolId}`);
          await cache.del(`${this.CACHE_PREFIX}student:${behavior.studentId}`);
          await cache.del(`${this.CACHE_PREFIX}class:${behavior.classId}`);
          await cache.del(
            `${this.CACHE_PREFIX}behaviorType:${behavior.behaviorTypeId}`
          );
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
      logger.error("Error in deleteBehaviorsBulk service:", error);
      throw new AppError("Failed to delete behaviors in bulk");
    }
  }

  /**
   * Clear behavior cache
   */
  private async clearBehaviorCache(behaviorId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${behaviorId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new BehaviorService(repository);
