import { ISchoolFeeService, ISchoolFeeRepository } from "./interfaces/services";
import {
  SchoolFeeDetailDTO,
  CreateSchoolFeeDTO,
  UpdateSchoolFeeDTO,
  PaginatedSchoolFeeListDTO,
  SchoolFeeListQueryParams,
  SchoolFeeDTOMapper,
} from "./dto";
import { SchoolFeeStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import db from "@/config/database";

export class SchoolFeeService implements ISchoolFeeService {
  private repository: ISchoolFeeRepository;
  private readonly CACHE_PREFIX = "schoolFee:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ISchoolFeeRepository) {
    this.repository = repository;
  }

  /**
   * Get school fee by ID
   */
  public async getSchoolFeeById(id: string): Promise<SchoolFeeDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedSchoolFee = await cache.get(cacheKey);

      if (cachedSchoolFee) {
        return JSON.parse(cachedSchoolFee);
      }

      // Get from database if not in cache
      const schoolFee = await this.repository.findSchoolFeeById(id);
      if (!schoolFee) {
        throw new NotFoundError(`School fee with ID ${id} not found`);
      }

      // Map to DTO
      const schoolFeeDTO = SchoolFeeDTOMapper.toDetailDTO(schoolFee);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolFeeDTO), this.CACHE_TTL);

      return schoolFeeDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolFeeById service:", error);
      throw new AppError("Failed to get school fee");
    }
  }

  /**
   * Create a new school fee
   */
  public async createSchoolFee(
    schoolFeeData: CreateSchoolFeeDTO
  ): Promise<SchoolFeeDetailDTO> {
    try {
      // Validate date ranges if present
      if (
        schoolFeeData.startDate &&
        schoolFeeData.endDate &&
        new Date(schoolFeeData.startDate) > new Date(schoolFeeData.endDate)
      ) {
        throw new BadRequestError("End date must be after start date");
      }

      // Create the school fee
      const newSchoolFee = await this.repository.createSchoolFee(schoolFeeData);

      // Get the complete school fee with associations
      const schoolFee = await this.repository.findSchoolFeeById(
        newSchoolFee.id
      );
      if (!schoolFee) {
        throw new AppError("Failed to retrieve created school fee");
      }

      // Map to DTO
      return SchoolFeeDTOMapper.toDetailDTO(schoolFee);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSchoolFee service:", error);
      throw new AppError("Failed to create school fee");
    }
  }

  /**
   * Update a school fee
   */
  public async updateSchoolFee(
    id: string,
    schoolFeeData: UpdateSchoolFeeDTO
  ): Promise<SchoolFeeDetailDTO> {
    try {
      // Check if school fee exists
      const existingSchoolFee = await this.repository.findSchoolFeeById(id);
      if (!existingSchoolFee) {
        throw new NotFoundError(`School fee with ID ${id} not found`);
      }

      // Validate date ranges if present
      if (
        schoolFeeData.startDate &&
        schoolFeeData.endDate &&
        new Date(schoolFeeData.startDate) > new Date(schoolFeeData.endDate)
      ) {
        throw new BadRequestError("End date must be after start date");
      }

      // Update school fee
      await this.repository.updateSchoolFee(id, schoolFeeData);

      // Clear cache
      await this.clearSchoolFeeCache(id);

      // Get the updated school fee
      return this.getSchoolFeeById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateSchoolFee service:", error);
      throw new AppError("Failed to update school fee");
    }
  }

  /**
   * Delete a school fee
   */
  public async deleteSchoolFee(id: string): Promise<boolean> {
    try {
      // Check if school fee exists
      const existingSchoolFee = await this.repository.findSchoolFeeById(id);
      if (!existingSchoolFee) {
        throw new NotFoundError(`School fee with ID ${id} not found`);
      }

      // Delete the school fee
      const result = await this.repository.deleteSchoolFee(id);

      // Clear cache
      await this.clearSchoolFeeCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteSchoolFee service:", error);
      throw new AppError("Failed to delete school fee");
    }
  }

  /**
   * Get paginated school fee list
   */
  public async getSchoolFeeList(
    params: SchoolFeeListQueryParams
  ): Promise<PaginatedSchoolFeeListDTO> {
    try {
      const { schoolFees, total } = await this.repository.getSchoolFeeList(
        params
      );

      // Map to DTOs
      const schoolFeeDTOs = schoolFees.map((schoolFee) =>
        SchoolFeeDTOMapper.toDetailDTO(schoolFee)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        schoolFees: schoolFeeDTOs,
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
      logger.error("Error in getSchoolFeeList service:", error);
      throw new AppError("Failed to get school fee list");
    }
  }

  /**
   * Get school fees by school
   */
  public async getSchoolFeesBySchool(
    schoolId: string
  ): Promise<SchoolFeeDetailDTO[]> {
    try {
      const schoolFees = await this.repository.findSchoolFeesBySchool(schoolId);

      // Map to DTOs
      return schoolFees.map((schoolFee) =>
        SchoolFeeDTOMapper.toDetailDTO(schoolFee)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolFeesBySchool service:", error);
      throw new AppError("Failed to get school fees by school");
    }
  }

  /**
   * Get school fee statistics
   */
  public async getSchoolFeeStatistics(): Promise<SchoolFeeStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStatistics = await cache.get(cacheKey);

      if (cachedStatistics) {
        return JSON.parse(cachedStatistics);
      }

      // Get from database if not in cache
      const statistics = await this.repository.getSchoolFeeStatistics();

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(statistics), this.CACHE_TTL);

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolFeeStatistics service:", error);
      throw new AppError("Failed to get school fee statistics");
    }
  }

  /**
   * Create multiple school fees at once
   */
  public async createSchoolFeesBulk(
    schoolFeesData: CreateSchoolFeeDTO[]
  ): Promise<SchoolFeeDetailDTO[]> {
    try {
      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Validate date ranges for each fee
        for (const fee of schoolFeesData) {
          if (
            fee.startDate &&
            fee.endDate &&
            new Date(fee.startDate) > new Date(fee.endDate)
          ) {
            throw new BadRequestError(
              `For fee "${fee.name}": End date must be after start date`
            );
          }
        }

        // Create school fees in bulk
        const newSchoolFees = await this.repository.createSchoolFeesBulk(
          schoolFeesData,
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Get details for each created fee
        const schoolFeeDTOs: SchoolFeeDetailDTO[] = [];
        for (const fee of newSchoolFees) {
          const schoolFee = await this.repository.findSchoolFeeById(fee.id);
          if (schoolFee) {
            schoolFeeDTOs.push(SchoolFeeDTOMapper.toDetailDTO(schoolFee));
          }
        }

        return schoolFeeDTOs;
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSchoolFeesBulk service:", error);
      throw new AppError("Failed to create school fees in bulk");
    }
  }

  /**
   * Delete multiple school fees at once
   */
  public async deleteSchoolFeesBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    try {
      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Delete school fees in bulk
        const deletedCount = await this.repository.deleteSchoolFeesBulk(
          ids,
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Clear cache for each deleted fee
        for (const id of ids) {
          await this.clearSchoolFeeCache(id);
        }

        // Clear statistics cache
        await cache.del(`${this.CACHE_PREFIX}statistics`);

        return {
          success: deletedCount > 0,
          count: deletedCount,
        };
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteSchoolFeesBulk service:", error);
      throw new AppError("Failed to delete school fees in bulk");
    }
  }

  /**
   * Get school fees by category
   */
  public async getSchoolFeesByCategory(
    category: string
  ): Promise<SchoolFeeDetailDTO[]> {
    try {
      const schoolFees = await this.repository.findSchoolFeesByCategory(
        category
      );

      // Map to DTOs
      return schoolFees.map((schoolFee) =>
        SchoolFeeDTOMapper.toDetailDTO(schoolFee)
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolFeesByCategory service:", error);
      throw new AppError("Failed to get school fees by category");
    }
  }

  /**
   * Clear school fee cache
   */
  private async clearSchoolFeeCache(schoolFeeId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${schoolFeeId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new SchoolFeeService(repository);
