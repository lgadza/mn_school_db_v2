import { IPeriodService, IPeriodRepository } from "./interfaces/services";
import {
  PeriodDetailDTO,
  CreatePeriodDTO,
  UpdatePeriodDTO,
  PaginatedPeriodListDTO,
  PeriodListQueryParams,
  PeriodDTOMapper,
} from "./dto";
import { PeriodStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import schoolService from "../../schools/service";
import db from "@/config/database";

export class PeriodService implements IPeriodService {
  private repository: IPeriodRepository;
  private readonly CACHE_PREFIX = "period:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IPeriodRepository) {
    this.repository = repository;
  }

  /**
   * Get period by ID
   */
  public async getPeriodById(id: string): Promise<PeriodDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedPeriod = await cache.get(cacheKey);

      if (cachedPeriod) {
        return JSON.parse(cachedPeriod);
      }

      // Get from database if not in cache
      const period = await this.repository.findPeriodById(id);
      if (!period) {
        throw new NotFoundError(`Period with ID ${id} not found`);
      }

      // Map to DTO with school
      const periodDTO = PeriodDTOMapper.toDetailDTO(period);

      // If the period has a school, map it to a school DTO
      if (period.school) {
        periodDTO.school = SchoolDTOMapper.toDetailDTO(period.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(periodDTO), this.CACHE_TTL);

      return periodDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getPeriodById service:", error);
      throw new AppError("Failed to get period");
    }
  }

  /**
   * Create a new period
   */
  public async createPeriod(
    periodData: CreatePeriodDTO
  ): Promise<PeriodDetailDTO> {
    try {
      // Validate data
      await this.validatePeriodData(periodData);

      // Check if school exists
      await schoolService.getSchoolById(periodData.schoolId);

      // Check for overlapping periods
      const overlappingPeriods = await this.repository.findOverlappingPeriods(
        periodData.schoolId,
        periodData.startTime,
        periodData.endTime
      );

      if (overlappingPeriods.length > 0) {
        throw new ConflictError(
          "This period overlaps with an existing period in the same school"
        );
      }

      // Create the period
      const newPeriod = await this.repository.createPeriod(periodData);

      // Get the complete period with school
      const period = await this.repository.findPeriodById(newPeriod.id);
      if (!period) {
        throw new AppError("Failed to retrieve created period");
      }

      // Map to DTO with school
      const periodDTO = PeriodDTOMapper.toDetailDTO(period);

      if (period.school) {
        periodDTO.school = SchoolDTOMapper.toDetailDTO(period.school);
      }

      // Clear school periods cache
      await cache.del(`${this.CACHE_PREFIX}school:${periodData.schoolId}`);

      return periodDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createPeriod service:", error);
      throw new AppError("Failed to create period");
    }
  }

  /**
   * Update a period
   */
  public async updatePeriod(
    id: string,
    periodData: UpdatePeriodDTO
  ): Promise<PeriodDetailDTO> {
    try {
      // Check if period exists
      const existingPeriod = await this.repository.findPeriodById(id);
      if (!existingPeriod) {
        throw new NotFoundError(`Period with ID ${id} not found`);
      }

      // Validate data
      await this.validatePeriodData(periodData, id);

      // Check if school exists if schoolId is provided
      if (periodData.schoolId) {
        await schoolService.getSchoolById(periodData.schoolId);
      }

      // Check for overlapping periods if time or school is changing
      if (periodData.startTime || periodData.endTime || periodData.schoolId) {
        const startTime = periodData.startTime || existingPeriod.startTime;
        const endTime = periodData.endTime || existingPeriod.endTime;
        const schoolId = periodData.schoolId || existingPeriod.schoolId;

        const overlappingPeriods = await this.repository.findOverlappingPeriods(
          schoolId,
          startTime,
          endTime,
          id
        );

        if (overlappingPeriods.length > 0) {
          throw new ConflictError(
            "This period would overlap with an existing period in the same school"
          );
        }
      }

      // Update period
      await this.repository.updatePeriod(id, periodData);

      // Clear cache
      await this.clearPeriodCache(id);

      // Clear school periods cache
      const schoolId = periodData.schoolId || existingPeriod.schoolId;
      await cache.del(`${this.CACHE_PREFIX}school:${schoolId}`);

      // If school changed, clear old school's cache too
      if (
        periodData.schoolId &&
        periodData.schoolId !== existingPeriod.schoolId
      ) {
        await cache.del(
          `${this.CACHE_PREFIX}school:${existingPeriod.schoolId}`
        );
      }

      // Get the updated period
      return this.getPeriodById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updatePeriod service:", error);
      throw new AppError("Failed to update period");
    }
  }

  /**
   * Delete a period
   */
  public async deletePeriod(id: string): Promise<boolean> {
    try {
      // Check if period exists
      const existingPeriod = await this.repository.findPeriodById(id);
      if (!existingPeriod) {
        throw new NotFoundError(`Period with ID ${id} not found`);
      }

      // Delete the period
      const result = await this.repository.deletePeriod(id);

      // Clear cache
      await this.clearPeriodCache(id);

      // Clear school periods cache
      await cache.del(`${this.CACHE_PREFIX}school:${existingPeriod.schoolId}`);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deletePeriod service:", error);
      throw new AppError("Failed to delete period");
    }
  }

  /**
   * Get paginated period list
   */
  public async getPeriodList(
    params: PeriodListQueryParams
  ): Promise<PaginatedPeriodListDTO> {
    try {
      const { periods, total } = await this.repository.getPeriodList(params);

      // Map to DTOs with schools
      const periodDTOs = periods.map((period) => {
        const periodDTO = PeriodDTOMapper.toDetailDTO(period);

        if (period.school) {
          periodDTO.school = SchoolDTOMapper.toDetailDTO(period.school);
        }

        return periodDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        periods: periodDTOs,
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
      logger.error("Error in getPeriodList service:", error);
      throw new AppError("Failed to get period list");
    }
  }

  /**
   * Get periods by school
   */
  public async getPeriodsBySchool(
    schoolId: string
  ): Promise<PeriodDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedPeriods = await cache.get(cacheKey);

      if (cachedPeriods) {
        return JSON.parse(cachedPeriods);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const periods = await this.repository.findPeriodsBySchool(schoolId);

      // Map to DTOs with schools
      const periodDTOs = periods.map((period) => {
        const periodDTO = PeriodDTOMapper.toDetailDTO(period);

        if (period.school) {
          periodDTO.school = SchoolDTOMapper.toDetailDTO(period.school);
        }

        return periodDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(periodDTOs), this.CACHE_TTL);

      return periodDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getPeriodsBySchool service:", error);
      throw new AppError("Failed to get periods by school");
    }
  }

  /**
   * Validate period data
   */
  public async validatePeriodData(
    periodData: CreatePeriodDTO | UpdatePeriodDTO,
    periodId?: string
  ): Promise<boolean> {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if ("startTime" in periodData && periodData.startTime) {
      if (!timeRegex.test(periodData.startTime)) {
        throw new BadRequestError("Start time must be in format HH:MM");
      }
    }

    if ("endTime" in periodData && periodData.endTime) {
      if (!timeRegex.test(periodData.endTime)) {
        throw new BadRequestError("End time must be in format HH:MM");
      }
    }

    // Validate start time is before end time
    if (
      "startTime" in periodData &&
      "endTime" in periodData &&
      periodData.startTime &&
      periodData.endTime
    ) {
      const startMinutes = this.convertTimeToMinutes(periodData.startTime);
      const endMinutes = this.convertTimeToMinutes(periodData.endTime);

      if (startMinutes >= endMinutes) {
        throw new BadRequestError(
          `End time (${periodData.endTime}) must be after start time (${periodData.startTime})`
        );
      }

      // Check if provided duration matches calculated duration
      if ("duration" in periodData && periodData.duration !== undefined) {
        const calculatedDuration = endMinutes - startMinutes;
        if (periodData.duration !== calculatedDuration) {
          throw new BadRequestError(
            `Provided duration (${periodData.duration} minutes) does not match the time difference between start and end time (${calculatedDuration} minutes)`
          );
        }
      }
    }

    // Validate duration is positive
    if ("duration" in periodData && periodData.duration !== undefined) {
      if (periodData.duration <= 0) {
        throw new BadRequestError("Duration must be positive");
      }
    }

    return true;
  }

  /**
   * Get period statistics
   */
  public async getPeriodStatistics(): Promise<PeriodStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getPeriodStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getPeriodStatistics service:", error);
      throw new AppError("Failed to get period statistics");
    }
  }

  /**
   * Create multiple periods at once
   */
  public async createPeriodsBulk(
    periodsData: CreatePeriodDTO[]
  ): Promise<PeriodDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all period data
      for (const periodData of periodsData) {
        await this.validatePeriodData(periodData);

        // Check if school exists
        await schoolService.getSchoolById(periodData.schoolId);

        // Check for overlapping periods
        const overlappingPeriods = await this.repository.findOverlappingPeriods(
          periodData.schoolId,
          periodData.startTime,
          periodData.endTime
        );

        if (overlappingPeriods.length > 0) {
          throw new ConflictError(
            `Period ${periodData.name} overlaps with an existing period in the same school`
          );
        }
      }

      // Create periods in bulk
      const newPeriods = await this.repository.createPeriodsBulk(
        periodsData,
        transaction
      );

      await transaction.commit();

      // Get the complete periods with schools
      const periodIds = newPeriods.map((period) => period.id);
      const detailedPeriods: PeriodDetailDTO[] = [];

      for (const id of periodIds) {
        const period = await this.repository.findPeriodById(id);
        if (period) {
          const periodDTO = PeriodDTOMapper.toDetailDTO(period);

          if (period.school) {
            periodDTO.school = SchoolDTOMapper.toDetailDTO(period.school);
          }

          detailedPeriods.push(periodDTO);
        }
      }

      // Clear school periods cache for all affected schools
      const schoolIds = [
        ...new Set(periodsData.map((period) => period.schoolId)),
      ];
      for (const schoolId of schoolIds) {
        await cache.del(`${this.CACHE_PREFIX}school:${schoolId}`);
      }

      return detailedPeriods;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createPeriodsBulk service:", error);
      throw new AppError("Failed to create periods in bulk");
    }
  }

  /**
   * Delete multiple periods at once
   */
  public async deletePeriodsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify periods exist
      const periods = await Promise.all(
        ids.map((id) => this.repository.findPeriodById(id))
      );

      // Filter out any null results (periods not found)
      const existingPeriods = periods.filter((period) => period !== null);

      if (existingPeriods.length === 0) {
        throw new NotFoundError("None of the specified periods were found");
      }

      // Delete periods
      const deletedCount = await this.repository.deletePeriodsBulk(
        existingPeriods.map((period) => period!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted period
      for (const period of existingPeriods) {
        if (period) {
          await this.clearPeriodCache(period.id);

          // Clear school periods cache
          await cache.del(`${this.CACHE_PREFIX}school:${period.schoolId}`);
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
      logger.error("Error in deletePeriodsBulk service:", error);
      throw new AppError("Failed to delete periods in bulk");
    }
  }

  /**
   * Clear period cache
   */
  private async clearPeriodCache(periodId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${periodId}`;
    await cache.del(cacheKey);
  }

  /**
   * Convert time string to minutes
   */
  private convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}

// Create and export service instance
export default new PeriodService(repository);
