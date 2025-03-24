import { ISectionService, ISectionRepository } from "./interfaces/services";
import {
  SectionDetailDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
  PaginatedSectionListDTO,
  SectionListQueryParams,
  SectionDTOMapper,
} from "./dto";
import { SectionStatistics } from "./interfaces/interfaces";
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

export class SectionService implements ISectionService {
  private repository: ISectionRepository;
  private readonly CACHE_PREFIX = "section:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ISectionRepository) {
    this.repository = repository;
  }

  /**
   * Get section by ID
   */
  public async getSectionById(id: string): Promise<SectionDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedSection = await cache.get(cacheKey);

      if (cachedSection) {
        return JSON.parse(cachedSection);
      }

      // Get from database if not in cache
      const section = await this.repository.findSectionById(id);
      if (!section) {
        throw new NotFoundError(`Section with ID ${id} not found`);
      }

      // Map to DTO with school
      const sectionDTO = SectionDTOMapper.toDetailDTO(section);

      // If the section has a school, map it to a school DTO
      if (section.school) {
        sectionDTO.school = SchoolDTOMapper.toDetailDTO(section.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(sectionDTO), this.CACHE_TTL);

      return sectionDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSectionById service:", error);
      throw new AppError("Failed to get section");
    }
  }

  /**
   * Create a new section
   */
  public async createSection(
    sectionData: CreateSectionDTO
  ): Promise<SectionDetailDTO> {
    try {
      // Validate data
      await this.validateSectionData(sectionData);

      // Check if school exists
      await schoolService.getSchoolById(sectionData.schoolId);

      // Create the section
      const newSection = await this.repository.createSection(sectionData);

      // Get the complete section with school
      const section = await this.repository.findSectionById(newSection.id);
      if (!section) {
        throw new AppError("Failed to retrieve created section");
      }

      // Map to DTO with school
      const sectionDTO = SectionDTOMapper.toDetailDTO(section);

      if (section.school) {
        sectionDTO.school = SchoolDTOMapper.toDetailDTO(section.school);
      }

      return sectionDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSection service:", error);
      throw new AppError("Failed to create section");
    }
  }

  /**
   * Update a section
   */
  public async updateSection(
    id: string,
    sectionData: UpdateSectionDTO
  ): Promise<SectionDetailDTO> {
    try {
      // Check if section exists
      const existingSection = await this.repository.findSectionById(id);
      if (!existingSection) {
        throw new NotFoundError(`Section with ID ${id} not found`);
      }

      // Validate data
      await this.validateSectionData(sectionData);

      // Check if school exists if schoolId is provided
      if (sectionData.schoolId) {
        await schoolService.getSchoolById(sectionData.schoolId);
      }

      // Update section
      await this.repository.updateSection(id, sectionData);

      // Clear cache
      await this.clearSectionCache(id);

      // Get the updated section
      return this.getSectionById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateSection service:", error);
      throw new AppError("Failed to update section");
    }
  }

  /**
   * Delete a section
   */
  public async deleteSection(id: string): Promise<boolean> {
    try {
      // Check if section exists
      const existingSection = await this.repository.findSectionById(id);
      if (!existingSection) {
        throw new NotFoundError(`Section with ID ${id} not found`);
      }

      // Delete the section
      const result = await this.repository.deleteSection(id);

      // Clear cache
      await this.clearSectionCache(id);

      // Clear school sections cache
      await cache.del(`${this.CACHE_PREFIX}school:${existingSection.schoolId}`);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteSection service:", error);
      throw new AppError("Failed to delete section");
    }
  }

  /**
   * Get paginated section list
   */
  public async getSectionList(
    params: SectionListQueryParams
  ): Promise<PaginatedSectionListDTO> {
    try {
      const { sections, total } = await this.repository.getSectionList(params);

      // Map to DTOs with schools
      const sectionDTOs = sections.map((section) => {
        const sectionDTO = SectionDTOMapper.toDetailDTO(section);

        if (section.school) {
          sectionDTO.school = SchoolDTOMapper.toDetailDTO(section.school);
        }

        return sectionDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        sections: sectionDTOs,
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
      logger.error("Error in getSectionList service:", error);
      throw new AppError("Failed to get section list");
    }
  }

  /**
   * Get sections by school
   */
  public async getSectionsBySchool(
    schoolId: string
  ): Promise<SectionDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedSections = await cache.get(cacheKey);

      if (cachedSections) {
        return JSON.parse(cachedSections);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const sections = await this.repository.findSectionsBySchool(schoolId);

      // Map to DTOs with schools
      const sectionDTOs = sections.map((section) => {
        const sectionDTO = SectionDTOMapper.toDetailDTO(section);

        if (section.school) {
          sectionDTO.school = SchoolDTOMapper.toDetailDTO(section.school);
        }

        return sectionDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(sectionDTOs), this.CACHE_TTL);

      return sectionDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSectionsBySchool service:", error);
      throw new AppError("Failed to get sections by school");
    }
  }

  /**
   * Validate section data
   */
  public async validateSectionData(
    sectionData: CreateSectionDTO | UpdateSectionDTO
  ): Promise<boolean> {
    // Validate dates
    if (
      "startDate" in sectionData &&
      "endDate" in sectionData &&
      sectionData.startDate &&
      sectionData.endDate
    ) {
      const startDate = new Date(sectionData.startDate);
      const endDate = new Date(sectionData.endDate);

      if (startDate > endDate) {
        throw new BadRequestError("Start date cannot be after end date");
      }
    }

    // Validate capacity as a positive integer
    if (
      "capacity" in sectionData &&
      sectionData.capacity !== null &&
      sectionData.capacity !== undefined
    ) {
      if (sectionData.capacity < 0 || !Number.isInteger(sectionData.capacity)) {
        throw new BadRequestError("Capacity must be a positive integer");
      }
    }

    return true;
  }

  /**
   * Get section statistics
   */
  public async getSectionStatistics(): Promise<SectionStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getSectionStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSectionStatistics service:", error);
      throw new AppError("Failed to get section statistics");
    }
  }

  /**
   * Create multiple sections at once
   */
  public async createSectionsBulk(
    sectionsData: CreateSectionDTO[]
  ): Promise<SectionDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all section data
      for (const sectionData of sectionsData) {
        await this.validateSectionData(sectionData);

        // Check if school exists
        await schoolService.getSchoolById(sectionData.schoolId);
      }

      // Create sections in bulk
      const newSections = await this.repository.createSectionsBulk(
        sectionsData,
        transaction
      );

      await transaction.commit();

      // Get the complete sections with schools
      const sectionIds = newSections.map((section) => section.id);
      const detailedSections: SectionDetailDTO[] = [];

      for (const id of sectionIds) {
        const section = await this.repository.findSectionById(id);
        if (section) {
          const sectionDTO = SectionDTOMapper.toDetailDTO(section);

          if (section.school) {
            sectionDTO.school = SchoolDTOMapper.toDetailDTO(section.school);
          }

          detailedSections.push(sectionDTO);
        }
      }

      return detailedSections;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSectionsBulk service:", error);
      throw new AppError("Failed to create sections in bulk");
    }
  }

  /**
   * Delete multiple sections at once
   */
  public async deleteSectionsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify sections exist
      const sections = await Promise.all(
        ids.map((id) => this.repository.findSectionById(id))
      );

      // Filter out any null results (sections not found)
      const existingSections = sections.filter((section) => section !== null);

      if (existingSections.length === 0) {
        throw new NotFoundError("None of the specified sections were found");
      }

      // Delete sections
      const deletedCount = await this.repository.deleteSectionsBulk(
        existingSections.map((section) => section!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted section
      for (const section of existingSections) {
        if (section) {
          await this.clearSectionCache(section.id);

          // Clear school sections cache
          await cache.del(`${this.CACHE_PREFIX}school:${section.schoolId}`);
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
      logger.error("Error in deleteSectionsBulk service:", error);
      throw new AppError("Failed to delete sections in bulk");
    }
  }

  /**
   * Clear section cache
   */
  private async clearSectionCache(sectionId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${sectionId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new SectionService(repository);
