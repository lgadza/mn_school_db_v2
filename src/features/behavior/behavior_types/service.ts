import {
  IBehaviorTypeService,
  IBehaviorTypeRepository,
} from "./interfaces/services";
import {
  BehaviorTypeDetailDTO,
  CreateBehaviorTypeDTO,
  UpdateBehaviorTypeDTO,
  PaginatedBehaviorTypeListDTO,
  BehaviorTypeListQueryParams,
  BehaviorTypeDTOMapper,
} from "./dto";
import { BehaviorTypeStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import schoolService from "../../schools/service";
import db from "@/config/database";

export class BehaviorTypeService implements IBehaviorTypeService {
  private repository: IBehaviorTypeRepository;
  private readonly CACHE_PREFIX = "behaviorType:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IBehaviorTypeRepository) {
    this.repository = repository;
  }

  /**
   * Get behavior type by ID
   */
  public async getBehaviorTypeById(id: string): Promise<BehaviorTypeDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedBehaviorType = await cache.get(cacheKey);

      if (cachedBehaviorType) {
        return JSON.parse(cachedBehaviorType);
      }

      // Get from database if not in cache
      const behaviorType = await this.repository.findBehaviorTypeById(id);
      if (!behaviorType) {
        throw new NotFoundError(`Behavior type with ID ${id} not found`);
      }

      // Map to DTO with school
      const behaviorTypeDTO = BehaviorTypeDTOMapper.toDetailDTO(behaviorType);

      // If the behavior type has a school, map it to a school DTO
      if (behaviorType.school) {
        behaviorTypeDTO.school = SchoolDTOMapper.toDetailDTO(
          behaviorType.school
        );
      }

      // Store in cache
      await cache.set(
        cacheKey,
        JSON.stringify(behaviorTypeDTO),
        this.CACHE_TTL
      );

      return behaviorTypeDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorTypeById service:", error);
      throw new AppError("Failed to get behavior type");
    }
  }

  /**
   * Create a new behavior type
   */
  public async createBehaviorType(
    behaviorTypeData: CreateBehaviorTypeDTO
  ): Promise<BehaviorTypeDetailDTO> {
    try {
      // Validate data
      await this.validateBehaviorTypeData(behaviorTypeData);

      // Check if school exists
      await schoolService.getSchoolById(behaviorTypeData.schoolId);

      // Create the behavior type
      const newBehaviorType = await this.repository.createBehaviorType(
        behaviorTypeData
      );

      // Get the complete behavior type with school
      const behaviorType = await this.repository.findBehaviorTypeById(
        newBehaviorType.id
      );
      if (!behaviorType) {
        throw new AppError("Failed to retrieve created behavior type");
      }

      // Map to DTO with school
      const behaviorTypeDTO = BehaviorTypeDTOMapper.toDetailDTO(behaviorType);

      if (behaviorType.school) {
        behaviorTypeDTO.school = SchoolDTOMapper.toDetailDTO(
          behaviorType.school
        );
      }

      return behaviorTypeDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBehaviorType service:", error);
      throw new AppError("Failed to create behavior type");
    }
  }

  /**
   * Update a behavior type
   */
  public async updateBehaviorType(
    id: string,
    behaviorTypeData: UpdateBehaviorTypeDTO
  ): Promise<BehaviorTypeDetailDTO> {
    try {
      // Check if behavior type exists
      const existingBehaviorType = await this.repository.findBehaviorTypeById(
        id
      );
      if (!existingBehaviorType) {
        throw new NotFoundError(`Behavior type with ID ${id} not found`);
      }

      // Validate data
      await this.validateBehaviorTypeData(behaviorTypeData);

      // Check if school exists if schoolId is provided
      if (behaviorTypeData.schoolId) {
        await schoolService.getSchoolById(behaviorTypeData.schoolId);
      }

      // Update behavior type
      await this.repository.updateBehaviorType(id, behaviorTypeData);

      // Clear cache
      await this.clearBehaviorTypeCache(id);

      // Get the updated behavior type
      return this.getBehaviorTypeById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateBehaviorType service:", error);
      throw new AppError("Failed to update behavior type");
    }
  }

  /**
   * Delete a behavior type
   */
  public async deleteBehaviorType(id: string): Promise<boolean> {
    try {
      // Check if behavior type exists
      const existingBehaviorType = await this.repository.findBehaviorTypeById(
        id
      );
      if (!existingBehaviorType) {
        throw new NotFoundError(`Behavior type with ID ${id} not found`);
      }

      // Delete the behavior type
      const result = await this.repository.deleteBehaviorType(id);

      // Clear cache
      await this.clearBehaviorTypeCache(id);

      // Clear school behavior types cache
      await cache.del(
        `${this.CACHE_PREFIX}school:${existingBehaviorType.schoolId}`
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteBehaviorType service:", error);
      throw new AppError("Failed to delete behavior type");
    }
  }

  /**
   * Get paginated behavior type list
   */
  public async getBehaviorTypeList(
    params: BehaviorTypeListQueryParams
  ): Promise<PaginatedBehaviorTypeListDTO> {
    try {
      const { behaviorTypes, total } =
        await this.repository.getBehaviorTypeList(params);

      // Map to DTOs with schools
      const behaviorTypeDTOs = behaviorTypes.map((behaviorType) => {
        const behaviorTypeDTO = BehaviorTypeDTOMapper.toDetailDTO(behaviorType);

        if (behaviorType.school) {
          behaviorTypeDTO.school = SchoolDTOMapper.toDetailDTO(
            behaviorType.school
          );
        }

        return behaviorTypeDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        behaviorTypes: behaviorTypeDTOs,
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
      logger.error("Error in getBehaviorTypeList service:", error);
      throw new AppError("Failed to get behavior type list");
    }
  }

  /**
   * Get behavior types by school
   */
  public async getBehaviorTypesBySchool(
    schoolId: string
  ): Promise<BehaviorTypeDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedBehaviorTypes = await cache.get(cacheKey);

      if (cachedBehaviorTypes) {
        return JSON.parse(cachedBehaviorTypes);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const behaviorTypes = await this.repository.findBehaviorTypesBySchool(
        schoolId
      );

      // Map to DTOs with schools
      const behaviorTypeDTOs = behaviorTypes.map((behaviorType) => {
        const behaviorTypeDTO = BehaviorTypeDTOMapper.toDetailDTO(behaviorType);

        if (behaviorType.school) {
          behaviorTypeDTO.school = SchoolDTOMapper.toDetailDTO(
            behaviorType.school
          );
        }

        return behaviorTypeDTO;
      });

      // Store in cache
      await cache.set(
        cacheKey,
        JSON.stringify(behaviorTypeDTOs),
        this.CACHE_TTL
      );

      return behaviorTypeDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorTypesBySchool service:", error);
      throw new AppError("Failed to get behavior types by school");
    }
  }

  /**
   * Get behavior types by category
   */
  public async getBehaviorTypesByCategory(
    category: "POSITIVE" | "NEGATIVE"
  ): Promise<BehaviorTypeDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}category:${category}`;
      const cachedBehaviorTypes = await cache.get(cacheKey);

      if (cachedBehaviorTypes) {
        return JSON.parse(cachedBehaviorTypes);
      }

      const behaviorTypes = await this.repository.findBehaviorTypesByCategory(
        category
      );

      // Map to DTOs with schools
      const behaviorTypeDTOs = behaviorTypes.map((behaviorType) => {
        const behaviorTypeDTO = BehaviorTypeDTOMapper.toDetailDTO(behaviorType);

        if (behaviorType.school) {
          behaviorTypeDTO.school = SchoolDTOMapper.toDetailDTO(
            behaviorType.school
          );
        }

        return behaviorTypeDTO;
      });

      // Store in cache
      await cache.set(
        cacheKey,
        JSON.stringify(behaviorTypeDTOs),
        this.CACHE_TTL
      );

      return behaviorTypeDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorTypesByCategory service:", error);
      throw new AppError("Failed to get behavior types by category");
    }
  }

  /**
   * Validate behavior type data
   */
  public async validateBehaviorTypeData(
    behaviorTypeData: CreateBehaviorTypeDTO | UpdateBehaviorTypeDTO
  ): Promise<boolean> {
    // Add any additional validation logic here

    // Validate description is not empty if provided
    if (
      "description" in behaviorTypeData &&
      (!behaviorTypeData.description ||
        behaviorTypeData.description.trim() === "")
    ) {
      throw new BadRequestError("Description cannot be empty");
    }

    return true;
  }

  /**
   * Get behavior type statistics
   */
  public async getBehaviorTypeStatistics(): Promise<BehaviorTypeStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getBehaviorTypeStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBehaviorTypeStatistics service:", error);
      throw new AppError("Failed to get behavior type statistics");
    }
  }

  /**
   * Create multiple behavior types at once
   */
  public async createBehaviorTypesBulk(
    behaviorTypesData: CreateBehaviorTypeDTO[]
  ): Promise<BehaviorTypeDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all behavior type data
      for (const behaviorTypeData of behaviorTypesData) {
        await this.validateBehaviorTypeData(behaviorTypeData);

        // Check if school exists
        await schoolService.getSchoolById(behaviorTypeData.schoolId);
      }

      // Create behavior types in bulk
      const newBehaviorTypes = await this.repository.createBehaviorTypesBulk(
        behaviorTypesData,
        transaction
      );

      await transaction.commit();

      // Get the complete behavior types with schools
      const behaviorTypeIds = newBehaviorTypes.map(
        (behaviorType) => behaviorType.id
      );
      const detailedBehaviorTypes: BehaviorTypeDetailDTO[] = [];

      for (const id of behaviorTypeIds) {
        const behaviorType = await this.repository.findBehaviorTypeById(id);
        if (behaviorType) {
          const behaviorTypeDTO =
            BehaviorTypeDTOMapper.toDetailDTO(behaviorType);

          if (behaviorType.school) {
            behaviorTypeDTO.school = SchoolDTOMapper.toDetailDTO(
              behaviorType.school
            );
          }

          detailedBehaviorTypes.push(behaviorTypeDTO);
        }
      }

      return detailedBehaviorTypes;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBehaviorTypesBulk service:", error);
      throw new AppError("Failed to create behavior types in bulk");
    }
  }

  /**
   * Delete multiple behavior types at once
   */
  public async deleteBehaviorTypesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify behavior types exist
      const behaviorTypes = await Promise.all(
        ids.map((id) => this.repository.findBehaviorTypeById(id))
      );

      // Filter out any null results (behavior types not found)
      const existingBehaviorTypes = behaviorTypes.filter(
        (behaviorType) => behaviorType !== null
      );

      if (existingBehaviorTypes.length === 0) {
        throw new NotFoundError(
          "None of the specified behavior types were found"
        );
      }

      // Delete behavior types
      const deletedCount = await this.repository.deleteBehaviorTypesBulk(
        existingBehaviorTypes.map((behaviorType) => behaviorType!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted behavior type
      for (const behaviorType of existingBehaviorTypes) {
        if (behaviorType) {
          await this.clearBehaviorTypeCache(behaviorType.id);

          // Clear school behavior types cache
          await cache.del(
            `${this.CACHE_PREFIX}school:${behaviorType.schoolId}`
          );
        }
      }

      // Clear category caches
      await cache.del(`${this.CACHE_PREFIX}category:POSITIVE`);
      await cache.del(`${this.CACHE_PREFIX}category:NEGATIVE`);

      return {
        success: true,
        count: deletedCount,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteBehaviorTypesBulk service:", error);
      throw new AppError("Failed to delete behavior types in bulk");
    }
  }

  /**
   * Clear behavior type cache
   */
  private async clearBehaviorTypeCache(behaviorTypeId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${behaviorTypeId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new BehaviorTypeService(repository);
