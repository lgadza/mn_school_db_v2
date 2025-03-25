import {
  ISchoolYearService,
  ISchoolYearRepository,
} from "./interfaces/services";
import {
  SchoolYearDetailDTO,
  CreateSchoolYearDTO,
  UpdateSchoolYearDTO,
  PaginatedSchoolYearListDTO,
  SchoolYearListQueryParams,
  SchoolYearDTOMapper,
} from "./dto";
import {
  SchoolYearInterface,
  SchoolYearStatus,
  SchoolYearStatistics,
} from "./interfaces/interfaces";
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

export class SchoolYearService implements ISchoolYearService {
  private repository: ISchoolYearRepository;
  private readonly CACHE_PREFIX = "schoolYear:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ISchoolYearRepository) {
    this.repository = repository;
  }

  /**
   * Get school year by ID
   */
  public async getSchoolYearById(id: string): Promise<SchoolYearDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedSchoolYear = await cache.get(cacheKey);

      if (cachedSchoolYear) {
        return JSON.parse(cachedSchoolYear);
      }

      // Get from database if not in cache
      const schoolYear = await this.repository.findSchoolYearById(id);
      if (!schoolYear) {
        throw new NotFoundError(`School year with ID ${id} not found`);
      }

      // Map to DTO with school
      const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

      // If the school year has a school, map it to a school DTO
      if (schoolYear.school) {
        schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(schoolYear.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolYearDTO), this.CACHE_TTL);

      return schoolYearDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolYearById service:", error);
      throw new AppError("Failed to get school year");
    }
  }

  /**
   * Create a new school year
   */
  public async createSchoolYear(
    schoolYearData: CreateSchoolYearDTO
  ): Promise<SchoolYearDetailDTO> {
    try {
      // Validate data
      await this.validateSchoolYearData(schoolYearData);

      // Check if school exists
      await schoolService.getSchoolById(schoolYearData.schoolId);

      // Check if a school year with the same year already exists for this school
      const existingSchoolYears = await this.repository.findSchoolYearsBySchool(
        schoolYearData.schoolId
      );

      const yearExists = existingSchoolYears.some(
        (existingYear) => existingYear.year === schoolYearData.year
      );

      if (yearExists) {
        throw new ConflictError(
          `School year ${schoolYearData.year} already exists for this school`
        );
      }

      // Create the school year
      const newSchoolYear = await this.repository.createSchoolYear(
        schoolYearData
      );

      // Get the complete school year with school
      const schoolYear = await this.repository.findSchoolYearById(
        newSchoolYear.id
      );
      if (!schoolYear) {
        throw new AppError("Failed to retrieve created school year");
      }

      // Map to DTO with school
      const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

      if (schoolYear.school) {
        schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(schoolYear.school);
      }

      return schoolYearDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSchoolYear service:", error);
      throw new AppError("Failed to create school year");
    }
  }

  /**
   * Update a school year
   */
  public async updateSchoolYear(
    id: string,
    schoolYearData: UpdateSchoolYearDTO
  ): Promise<SchoolYearDetailDTO> {
    try {
      // Check if school year exists
      const existingSchoolYear = await this.repository.findSchoolYearById(id);
      if (!existingSchoolYear) {
        throw new NotFoundError(`School year with ID ${id} not found`);
      }

      // Validate data
      await this.validateSchoolYearData({
        ...existingSchoolYear,
        ...schoolYearData,
      } as CreateSchoolYearDTO);

      // Check if school exists if schoolId is provided
      if (schoolYearData.schoolId) {
        await schoolService.getSchoolById(schoolYearData.schoolId);
      }

      // If changing the year, check if a school year with the new year already exists for this school
      if (
        schoolYearData.year &&
        schoolYearData.year !== existingSchoolYear.year
      ) {
        const schoolId = schoolYearData.schoolId || existingSchoolYear.schoolId;
        const existingSchoolYears =
          await this.repository.findSchoolYearsBySchool(schoolId);

        const yearExists = existingSchoolYears.some(
          (existingYear) =>
            existingYear.year === schoolYearData.year && existingYear.id !== id
        );

        if (yearExists) {
          throw new ConflictError(
            `School year ${schoolYearData.year} already exists for this school`
          );
        }
      }

      // Update school year
      await this.repository.updateSchoolYear(id, schoolYearData);

      // Clear cache
      await this.clearSchoolYearCache(id);

      // Get the updated school year
      return this.getSchoolYearById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateSchoolYear service:", error);
      throw new AppError("Failed to update school year");
    }
  }

  /**
   * Delete a school year
   */
  public async deleteSchoolYear(id: string): Promise<boolean> {
    try {
      // Check if school year exists
      const existingSchoolYear = await this.repository.findSchoolYearById(id);
      if (!existingSchoolYear) {
        throw new NotFoundError(`School year with ID ${id} not found`);
      }

      // Don't allow deletion of active school years
      if (existingSchoolYear.status === SchoolYearStatus.ACTIVE) {
        throw new BadRequestError(
          "Cannot delete an active school year. Change its status first."
        );
      }

      // Delete the school year
      const result = await this.repository.deleteSchoolYear(id);

      // Clear cache
      await this.clearSchoolYearCache(id);

      // Clear school school years cache
      await cache.del(
        `${this.CACHE_PREFIX}school:${existingSchoolYear.schoolId}`
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteSchoolYear service:", error);
      throw new AppError("Failed to delete school year");
    }
  }

  /**
   * Get paginated school year list
   */
  public async getSchoolYearList(
    params: SchoolYearListQueryParams
  ): Promise<PaginatedSchoolYearListDTO> {
    try {
      const { schoolYears, total } = await this.repository.getSchoolYearList(
        params
      );

      // Map to DTOs with schools
      const schoolYearDTOs = schoolYears.map((schoolYear) => {
        const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

        if (schoolYear.school) {
          schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(schoolYear.school);
        }

        return schoolYearDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        schoolYears: schoolYearDTOs,
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
      logger.error("Error in getSchoolYearList service:", error);
      throw new AppError("Failed to get school year list");
    }
  }

  /**
   * Get school years by school
   */
  public async getSchoolYearsBySchool(
    schoolId: string
  ): Promise<SchoolYearDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedSchoolYears = await cache.get(cacheKey);

      if (cachedSchoolYears) {
        return JSON.parse(cachedSchoolYears);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const schoolYears = await this.repository.findSchoolYearsBySchool(
        schoolId
      );

      // Map to DTOs with schools
      const schoolYearDTOs = schoolYears.map((schoolYear) => {
        const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

        if (schoolYear.school) {
          schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(schoolYear.school);
        }

        return schoolYearDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolYearDTOs), this.CACHE_TTL);

      return schoolYearDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolYearsBySchool service:", error);
      throw new AppError("Failed to get school years by school");
    }
  }

  /**
   * Validate school year data
   */
  public async validateSchoolYearData(
    schoolYearData: CreateSchoolYearDTO | UpdateSchoolYearDTO
  ): Promise<boolean> {
    // Validate dates
    if (
      "startDate" in schoolYearData &&
      "endDate" in schoolYearData &&
      schoolYearData.startDate &&
      schoolYearData.endDate
    ) {
      const startDate = new Date(schoolYearData.startDate);
      const endDate = new Date(schoolYearData.endDate);

      if (startDate >= endDate) {
        throw new BadRequestError("Start date must be before end date");
      }
    }

    // Validate year format
    if ("year" in schoolYearData && schoolYearData.year) {
      const yearRegex = /^\d{4}-\d{4}$/;
      if (!yearRegex.test(schoolYearData.year)) {
        throw new BadRequestError("Year must be in format YYYY-YYYY");
      }

      // Validate year values match the dates
      if (
        "startDate" in schoolYearData &&
        "endDate" in schoolYearData &&
        schoolYearData.startDate &&
        schoolYearData.endDate
      ) {
        const [startYear, endYear] = schoolYearData.year.split("-").map(Number);
        const startDate = new Date(schoolYearData.startDate);
        const endDate = new Date(schoolYearData.endDate);
        const startDateYear = startDate.getFullYear();
        const endDateYear = endDate.getFullYear();

        if (startYear !== startDateYear || endYear !== endDateYear) {
          throw new BadRequestError(
            "Year format must match the start and end date years"
          );
        }
      }
    }

    return true;
  }

  /**
   * Get school year statistics
   */
  public async getSchoolYearStatistics(): Promise<SchoolYearStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getSchoolYearStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolYearStatistics service:", error);
      throw new AppError("Failed to get school year statistics");
    }
  }

  /**
   * Create multiple school years at once
   */
  public async createSchoolYearsBulk(
    schoolYearsData: CreateSchoolYearDTO[]
  ): Promise<SchoolYearDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all school year data
      for (const schoolYearData of schoolYearsData) {
        await this.validateSchoolYearData(schoolYearData);

        // Check if school exists
        await schoolService.getSchoolById(schoolYearData.schoolId);
      }

      // Group school years by schoolId to check for duplicates
      const schoolYearsBySchool: Record<string, string[]> = {};
      schoolYearsData.forEach((schoolYear) => {
        if (!schoolYearsBySchool[schoolYear.schoolId]) {
          schoolYearsBySchool[schoolYear.schoolId] = [];
        }
        schoolYearsBySchool[schoolYear.schoolId].push(schoolYear.year);
      });

      // Check for duplicate years within the same school
      for (const schoolId of Object.keys(schoolYearsBySchool)) {
        const years = schoolYearsBySchool[schoolId];
        const uniqueYears = new Set(years);
        if (uniqueYears.size !== years.length) {
          throw new ConflictError(
            "Duplicate school years for the same school in the request"
          );
        }

        // Check if any of the years already exist for this school
        const existingSchoolYears =
          await this.repository.findSchoolYearsBySchool(schoolId);
        const existingYears = new Set(
          existingSchoolYears.map((year) => year.year)
        );

        for (const year of years) {
          if (existingYears.has(year)) {
            throw new ConflictError(
              `School year ${year} already exists for school ${schoolId}`
            );
          }
        }
      }

      // Create school years in bulk
      const newSchoolYears = await this.repository.createSchoolYearsBulk(
        schoolYearsData,
        transaction
      );

      await transaction.commit();

      // Get the complete school years with schools
      const schoolYearIds = newSchoolYears.map((schoolYear) => schoolYear.id);
      const detailedSchoolYears: SchoolYearDetailDTO[] = [];

      for (const id of schoolYearIds) {
        const schoolYear = await this.repository.findSchoolYearById(id);
        if (schoolYear) {
          const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

          if (schoolYear.school) {
            schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(
              schoolYear.school
            );
          }

          detailedSchoolYears.push(schoolYearDTO);
        }
      }

      return detailedSchoolYears;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSchoolYearsBulk service:", error);
      throw new AppError("Failed to create school years in bulk");
    }
  }

  /**
   * Get active school year for a school
   */
  public async getActiveSchoolYear(
    schoolId: string
  ): Promise<SchoolYearDetailDTO | null> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}active:${schoolId}`;
      const cachedSchoolYear = await cache.get(cacheKey);

      if (cachedSchoolYear) {
        return cachedSchoolYear === "null"
          ? null
          : JSON.parse(cachedSchoolYear);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const schoolYear = await this.repository.getActiveSchoolYear(schoolId);

      if (!schoolYear) {
        // Cache the null result to avoid repeated DB queries
        await cache.set(cacheKey, "null", this.CACHE_TTL);
        return null;
      }

      // Map to DTO with school
      const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

      if (schoolYear.school) {
        schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(schoolYear.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolYearDTO), this.CACHE_TTL);

      return schoolYearDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getActiveSchoolYear service:", error);
      throw new AppError("Failed to get active school year");
    }
  }

  /**
   * Get current school year based on current date
   */
  public async getCurrentSchoolYear(
    schoolId: string
  ): Promise<SchoolYearDetailDTO | null> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}current:${schoolId}`;
      const cachedSchoolYear = await cache.get(cacheKey);

      if (cachedSchoolYear) {
        return cachedSchoolYear === "null"
          ? null
          : JSON.parse(cachedSchoolYear);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const schoolYear = await this.repository.getCurrentSchoolYear(schoolId);

      if (!schoolYear) {
        // Cache the null result to avoid repeated DB queries
        await cache.set(cacheKey, "null", this.CACHE_TTL);
        return null;
      }

      // Map to DTO with school
      const schoolYearDTO = SchoolYearDTOMapper.toDetailDTO(schoolYear);

      if (schoolYear.school) {
        schoolYearDTO.school = SchoolDTOMapper.toDetailDTO(schoolYear.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolYearDTO), this.CACHE_TTL);

      return schoolYearDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getCurrentSchoolYear service:", error);
      throw new AppError("Failed to get current school year");
    }
  }

  /**
   * Set a school year as active (and deactivate others for this school)
   */
  public async setActiveSchoolYear(id: string): Promise<SchoolYearDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if school year exists
      const schoolYear = await this.repository.findSchoolYearById(id);
      if (!schoolYear) {
        throw new NotFoundError(`School year with ID ${id} not found`);
      }

      // Get all school years for this school
      const schoolYears = await this.repository.findSchoolYearsBySchool(
        schoolYear.schoolId
      );

      // Update all school years for this school to not be active
      for (const year of schoolYears) {
        if (year.status === SchoolYearStatus.ACTIVE) {
          await this.repository.updateSchoolYear(
            year.id,
            { status: SchoolYearStatus.UPCOMING },
            transaction
          );
          await this.clearSchoolYearCache(year.id);
        }
      }

      // Update the target school year to be active
      await this.repository.updateSchoolYear(
        id,
        { status: SchoolYearStatus.ACTIVE },
        transaction
      );

      await transaction.commit();

      // Clear caches
      await this.clearSchoolYearCache(id);
      await cache.del(`${this.CACHE_PREFIX}school:${schoolYear.schoolId}`);
      await cache.del(`${this.CACHE_PREFIX}active:${schoolYear.schoolId}`);
      await cache.del(`${this.CACHE_PREFIX}current:${schoolYear.schoolId}`);
      await cache.del(`${this.CACHE_PREFIX}statistics`);

      // Get the updated school year
      return this.getSchoolYearById(id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in setActiveSchoolYear service:", error);
      throw new AppError("Failed to set active school year");
    }
  }

  /**
   * Generate multiple school years for a school
   */
  public async generateSchoolYears(params: {
    schoolId: string;
    startYear: number;
    numberOfYears: number;
    yearStartMonth?: number;
    yearStartDay?: number;
    yearEndMonth?: number;
    yearEndDay?: number;
  }): Promise<SchoolYearDetailDTO[]> {
    const {
      schoolId,
      startYear,
      numberOfYears,
      yearStartMonth = 9, // September default
      yearStartDay = 1, // 1st default
      yearEndMonth = 6, // June default
      yearEndDay = 30, // 30th default
    } = params;

    try {
      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      // Get existing school years for this school
      const existingSchoolYears = await this.repository.findSchoolYearsBySchool(
        schoolId
      );
      const existingYears = new Set(
        existingSchoolYears.map((schoolYear) => schoolYear.year)
      );

      // Generate school year data
      const schoolYearsToCreate: CreateSchoolYearDTO[] = [];

      for (let i = 0; i < numberOfYears; i++) {
        const currentStartYear = startYear + i;
        const currentEndYear = currentStartYear + 1;
        const yearString = `${currentStartYear}-${currentEndYear}`;

        // Skip if this year already exists
        if (existingYears.has(yearString)) {
          continue;
        }

        // Create start and end dates
        const startDate = new Date(
          currentStartYear,
          yearStartMonth - 1,
          yearStartDay
        );
        const endDate = new Date(currentEndYear, yearEndMonth - 1, yearEndDay);

        // Create school year data
        schoolYearsToCreate.push({
          year: yearString,
          startDate,
          endDate,
          schoolId,
          status: SchoolYearStatus.UPCOMING,
        });
      }

      // If no new years to create, return empty array
      if (schoolYearsToCreate.length === 0) {
        return [];
      }

      // Create school years in bulk
      return this.createSchoolYearsBulk(schoolYearsToCreate);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateSchoolYears service:", error);
      throw new AppError("Failed to generate school years");
    }
  }

  /**
   * Clear school year cache
   */
  private async clearSchoolYearCache(schoolYearId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${schoolYearId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new SchoolYearService(repository);
