import { IProspectService, IProspectRepository } from "./interfaces/services";
import {
  ProspectDetailDTO,
  CreateProspectDTO,
  UpdateProspectDTO,
  PaginatedProspectListDTO,
  ProspectListQueryParams,
  ProspectDTOMapper,
} from "./dto";
import { ProspectStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { UserDTOMapper } from "../../users/dto";
import { SchoolDTOMapper } from "../../schools/dto";
import { RoleDTOMapper } from "../../rbac/dto/roles.dto";
import { AddressDTOMapper } from "../../address/dto";
import userService from "../../users/service";
import schoolService from "../../schools/service";
import roleService from "../../rbac/services/roles.service";
import addressService from "../../address/service";
import db from "@/config/database";
import DateTimeUtil from "@/common/utils/date/dateTimeUtil";
import { ProspectInterface } from "./interfaces/interfaces";
import {
  SchoolApplicationStatistics,
  ProspectApplicationsDetail,
} from "../school-applications/interfaces/interfaces";
import SchoolApplication from "../school-applications/model";
import School from "../../schools/model";
import { SchoolApplicationDTOMapper } from "../school-applications/dto";

export class ProspectService implements IProspectService {
  private repository: IProspectRepository;
  private readonly CACHE_PREFIX = "prospect:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IProspectRepository) {
    this.repository = repository;
  }

  /**
   * Get prospect by ID
   */
  public async getProspectById(id: string): Promise<ProspectDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedProspect = await cache.get(cacheKey);

      if (cachedProspect) {
        return JSON.parse(cachedProspect);
      }

      // Get from database if not in cache
      const prospect = await this.repository.findProspectById(id);
      if (!prospect) {
        throw new NotFoundError(`Prospect with ID ${id} not found`);
      }

      // Map to DTO with related entities
      const prospectDTO = ProspectDTOMapper.toDetailDTO(prospect);

      // If the prospect has related entities, map them to DTOs
      if (prospect.user) {
        prospectDTO.user = UserDTOMapper.toDetailDTO(prospect.user);
      }

      if (prospect.school) {
        prospectDTO.school = SchoolDTOMapper.toDetailDTO(prospect.school);
      }

      if (prospect.role) {
        prospectDTO.role = RoleDTOMapper.toDTO(prospect.role);
      }

      if (prospect.address) {
        prospectDTO.address = AddressDTOMapper.toDetailDTO(prospect.address);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(prospectDTO), this.CACHE_TTL);

      return prospectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectById service:", error);
      throw new AppError("Failed to get prospect");
    }
  }

  /**
   * Get prospect by user ID
   */
  public async getProspectByUserId(userId: string): Promise<ProspectDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}user:${userId}`;
      const cachedProspect = await cache.get(cacheKey);

      if (cachedProspect) {
        return JSON.parse(cachedProspect);
      }

      // Get from database if not in cache
      const prospect = await this.repository.findProspectByUserId(userId);
      if (!prospect) {
        throw new NotFoundError(`Prospect with user ID ${userId} not found`);
      }

      // Map to DTO with related entities
      const prospectDTO = ProspectDTOMapper.toDetailDTO(prospect);

      // If the prospect has related entities, map them to DTOs
      if (prospect.user) {
        prospectDTO.user = UserDTOMapper.toDetailDTO(prospect.user);
      }

      if (prospect.school) {
        prospectDTO.school = SchoolDTOMapper.toDetailDTO(prospect.school);
      }

      if (prospect.role) {
        prospectDTO.role = RoleDTOMapper.toDTO(prospect.role);
      }

      if (prospect.address) {
        prospectDTO.address = AddressDTOMapper.toDetailDTO(prospect.address);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(prospectDTO), this.CACHE_TTL);

      return prospectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectByUserId service:", error);
      throw new AppError("Failed to get prospect by user ID");
    }
  }

  /**
   * Create a new prospect
   */
  public async createProspect(
    prospectData: CreateProspectDTO
  ): Promise<ProspectDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate data
      await this.validateProspectData(prospectData);

      // Check if user exists
      try {
        await userService.getUserById(prospectData.userId);
      } catch (error) {
        throw new BadRequestError(
          `User with ID ${prospectData.userId} not found`
        );
      }

      // Check if school exists
      try {
        await schoolService.getSchoolById(prospectData.schoolId);
      } catch (error) {
        throw new BadRequestError(
          `School with ID ${prospectData.schoolId} not found`
        );
      }

      // Check if role exists
      try {
        await roleService.getRoleById(prospectData.roleId);
      } catch (error) {
        throw new BadRequestError(
          `Role with ID ${prospectData.roleId} not found`
        );
      }

      // Check if address exists
      try {
        await addressService.getAddressById(prospectData.addressId);
      } catch (error) {
        throw new BadRequestError(
          `Address with ID ${prospectData.addressId} not found`
        );
      }

      // Check if user is already a prospect
      const existingProspect = await this.repository.findProspectByUserId(
        prospectData.userId
      );
      if (existingProspect) {
        throw new ConflictError(
          `User with ID ${prospectData.userId} is already a prospect`
        );
      }

      // Create the prospect
      const newProspect = await this.repository.createProspect(
        prospectData,
        transaction
      );

      await transaction.commit();

      // Get the complete prospect with associations
      return this.getProspectById(newProspect.id);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createProspect service:", error);
      throw new AppError("Failed to create prospect");
    }
  }

  /**
   * Update a prospect
   */
  public async updateProspect(
    id: string,
    prospectData: UpdateProspectDTO
  ): Promise<ProspectDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if prospect exists
      const existingProspect = await this.repository.findProspectById(id);
      if (!existingProspect) {
        throw new NotFoundError(`Prospect with ID ${id} not found`);
      }

      // Validate data
      await this.validateProspectData(prospectData);

      // Check if school exists if provided
      if (prospectData.schoolId) {
        try {
          await schoolService.getSchoolById(prospectData.schoolId);
        } catch (error) {
          throw new BadRequestError(
            `School with ID ${prospectData.schoolId} not found`
          );
        }
      }

      // Check if role exists if provided
      if (prospectData.roleId) {
        try {
          await roleService.getRoleById(prospectData.roleId);
        } catch (error) {
          throw new BadRequestError(
            `Role with ID ${prospectData.roleId} not found`
          );
        }
      }

      // Check if address exists if provided
      if (prospectData.addressId) {
        try {
          await addressService.getAddressById(prospectData.addressId);
        } catch (error) {
          throw new BadRequestError(
            `Address with ID ${prospectData.addressId} not found`
          );
        }
      }

      // Update prospect
      await this.repository.updateProspect(id, prospectData, transaction);

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${id}`,
        `${this.CACHE_PREFIX}user:${existingProspect.userId}`,
      ];

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      // Get the updated prospect
      return this.getProspectById(id);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateProspect service:", error);
      throw new AppError("Failed to update prospect");
    }
  }

  /**
   * Delete a prospect
   */
  public async deleteProspect(id: string): Promise<boolean> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if prospect exists
      const existingProspect = await this.repository.findProspectById(id);
      if (!existingProspect) {
        throw new NotFoundError(`Prospect with ID ${id} not found`);
      }

      // Delete the prospect
      const result = await this.repository.deleteProspect(id, transaction);

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${id}`,
        `${this.CACHE_PREFIX}user:${existingProspect.userId}`,
      ];

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      return result;
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteProspect service:", error);
      throw new AppError("Failed to delete prospect");
    }
  }

  /**
   * Get paginated prospect list
   */
  public async getProspectList(
    params: ProspectListQueryParams
  ): Promise<PaginatedProspectListDTO> {
    try {
      const { prospects, total } = await this.repository.getProspectList(
        params
      );

      // Map to DTOs with related entities
      const prospectDTOs = prospects.map((prospect) => {
        const prospectDTO = ProspectDTOMapper.toDetailDTO(prospect);

        if (prospect.user) {
          prospectDTO.user = UserDTOMapper.toDetailDTO(prospect.user);
        }

        if (prospect.school) {
          prospectDTO.school = SchoolDTOMapper.toDetailDTO(prospect.school);
        }

        if (prospect.role) {
          prospectDTO.role = RoleDTOMapper.toDTO(prospect.role);
        }

        if (prospect.address) {
          prospectDTO.address = AddressDTOMapper.toDetailDTO(prospect.address);
        }

        return prospectDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        prospects: prospectDTOs,
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
      logger.error("Error in getProspectList service:", error);
      throw new AppError("Failed to get prospect list");
    }
  }

  /**
   * Get prospects by school
   */
  public async getProspectsBySchool(
    schoolId: string
  ): Promise<ProspectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedProspects = await cache.get(cacheKey);

      if (cachedProspects) {
        return JSON.parse(cachedProspects);
      }

      // Check if school exists
      try {
        await schoolService.getSchoolById(schoolId);
      } catch (error) {
        throw new BadRequestError(`School with ID ${schoolId} not found`);
      }

      const prospects = await this.repository.findProspectsBySchool(schoolId);

      // Map to DTOs with related entities
      const prospectDTOs = prospects.map((prospect) => {
        const prospectDTO = ProspectDTOMapper.toDetailDTO(prospect);

        if (prospect.user) {
          prospectDTO.user = UserDTOMapper.toDetailDTO(prospect.user);
        }

        if (prospect.school) {
          prospectDTO.school = SchoolDTOMapper.toDetailDTO(prospect.school);
        }

        if (prospect.role) {
          prospectDTO.role = RoleDTOMapper.toDTO(prospect.role);
        }

        if (prospect.address) {
          prospectDTO.address = AddressDTOMapper.toDetailDTO(prospect.address);
        }

        return prospectDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(prospectDTOs), this.CACHE_TTL);

      return prospectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectsBySchool service:", error);
      throw new AppError("Failed to get prospects by school");
    }
  }

  /**
   * Get prospects by role
   */
  public async getProspectsByRole(
    roleId: string
  ): Promise<ProspectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}role:${roleId}`;
      const cachedProspects = await cache.get(cacheKey);

      if (cachedProspects) {
        return JSON.parse(cachedProspects);
      }

      // Check if role exists
      try {
        await roleService.getRoleById(roleId);
      } catch (error) {
        throw new BadRequestError(`Role with ID ${roleId} not found`);
      }

      const prospects = await this.repository.findProspectsByRole(roleId);

      // Map to DTOs with related entities
      const prospectDTOs = prospects.map((prospect) => {
        const prospectDTO = ProspectDTOMapper.toDetailDTO(prospect);

        if (prospect.user) {
          prospectDTO.user = UserDTOMapper.toDetailDTO(prospect.user);
        }

        if (prospect.school) {
          prospectDTO.school = SchoolDTOMapper.toDetailDTO(prospect.school);
        }

        if (prospect.role) {
          prospectDTO.role = RoleDTOMapper.toDTO(prospect.role);
        }

        if (prospect.address) {
          prospectDTO.address = AddressDTOMapper.toDetailDTO(prospect.address);
        }

        return prospectDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(prospectDTOs), this.CACHE_TTL);

      return prospectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectsByRole service:", error);
      throw new AppError("Failed to get prospects by role");
    }
  }

  /**
   * Get prospects by interest level
   */
  public async getProspectsByInterestLevel(
    interestLevel: string
  ): Promise<ProspectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}interest:${interestLevel}`;
      const cachedProspects = await cache.get(cacheKey);

      if (cachedProspects) {
        return JSON.parse(cachedProspects);
      }

      const prospects = await this.repository.findProspectsByInterestLevel(
        interestLevel
      );

      // Map to DTOs with related entities
      const prospectDTOs = prospects.map((prospect) => {
        const prospectDTO = ProspectDTOMapper.toDetailDTO(prospect);

        if (prospect.user) {
          prospectDTO.user = UserDTOMapper.toDetailDTO(prospect.user);
        }

        if (prospect.school) {
          prospectDTO.school = SchoolDTOMapper.toDetailDTO(prospect.school);
        }

        if (prospect.role) {
          prospectDTO.role = RoleDTOMapper.toDTO(prospect.role);
        }

        if (prospect.address) {
          prospectDTO.address = AddressDTOMapper.toDetailDTO(prospect.address);
        }

        return prospectDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(prospectDTOs), this.CACHE_TTL);

      return prospectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectsByInterestLevel service:", error);
      throw new AppError("Failed to get prospects by interest level");
    }
  }

  /**
   * Validate prospect data
   */
  public async validateProspectData(
    prospectData: CreateProspectDTO | UpdateProspectDTO
  ): Promise<boolean> {
    // Validate contact date if provided
    if (
      "contactDate" in prospectData &&
      prospectData.contactDate !== null &&
      prospectData.contactDate !== undefined
    ) {
      const contactDate = new Date(prospectData.contactDate);
      if (!DateTimeUtil.isValidDate(contactDate)) {
        throw new BadRequestError(
          `Invalid contact date: ${prospectData.contactDate}`
        );
      }

      // Contact date should not be in the future
      const today = new Date();
      if (contactDate > today) {
        throw new BadRequestError("Contact date cannot be in the future");
      }
    }

    return true;
  }

  /**
   * Get prospect statistics
   */
  public async getProspectStatistics(): Promise<ProspectStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getProspectStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectStatistics service:", error);
      throw new AppError("Failed to get prospect statistics");
    }
  }

  /**
   * Get prospect application statistics
   */
  public async getProspectApplicationStatistics(): Promise<SchoolApplicationStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}application-statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics =
        await this.repository.getProspectApplicationStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getProspectApplicationStatistics service:", error);
      throw new AppError("Failed to get prospect application statistics");
    }
  }

  /**
   * Get prospects who applied to multiple schools
   */
  public async getProspectsWithMultipleApplications(): Promise<
    ProspectApplicationsDetail[]
  > {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}multiple-applications`;
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Get prospects with multiple applications
      const prospects =
        await this.repository.getProspectsWithMultipleApplications();

      // If no prospects found, return empty array
      if (prospects.length === 0) {
        return [];
      }

      // Build detailed response with applications for each prospect
      const result: ProspectApplicationsDetail[] = [];

      for (const prospect of prospects) {
        // Get all applications for this prospect
        const applications = (await SchoolApplication.findAll({
          where: { prospectId: prospect.id },
          include: [{ model: School, as: "school" }],
        })) as (SchoolApplication & { school?: School })[];

        // Skip if no applications found (should not happen)
        if (applications.length <= 1) continue;

        // Convert DTOs to interface format with proper date handling
        const applicationDTOs = applications.map((app) => {
          // First get the DTO
          const dto = SchoolApplicationDTOMapper.toDetailDTO(app);

          // Convert back to interface format with Date objects
          return {
            id: dto.id,
            prospectId: dto.prospectId,
            schoolId: dto.schoolId,
            applicationDate: app.applicationDate, // Keep as Date from model
            status: dto.status,
            applicationDocumentIds: dto.applicationDocumentIds,
            notes: dto.notes,
            createdAt: new Date(dto.createdAt), // Convert string back to Date
            updatedAt: new Date(dto.updatedAt), // Convert string back to Date
            // Only include school if it exists
            ...(app.school && { school: app.school }),
          };
        });

        // Create detail object
        const detail: ProspectApplicationsDetail = {
          prospectId: prospect.id,
          userId: prospect.userId,
          userName: prospect.user
            ? `${prospect.user.firstName} ${prospect.user.lastName}`
            : "Unknown",
          schoolCount: applications.length,
          applications: applicationDTOs,
        };

        result.push(detail);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(result), 300); // 5 minutes TTL

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(
        "Error in getProspectsWithMultipleApplications service:",
        error
      );
      throw new AppError("Failed to get prospects with multiple applications");
    }
  }

  /**
   * Update a prospect's hasApplied status
   */
  public async updateHasAppliedStatus(
    prospectId: string,
    hasApplied: boolean
  ): Promise<boolean> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if prospect exists
      const prospect = await this.repository.findProspectById(prospectId);
      if (!prospect) {
        throw new NotFoundError(`Prospect with ID ${prospectId} not found`);
      }

      // Update the hasApplied status
      const result = await this.repository.updateHasAppliedStatus(
        prospectId,
        hasApplied,
        transaction
      );

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${prospectId}`,
        `${this.CACHE_PREFIX}user:${prospect.userId}`,
        `${this.CACHE_PREFIX}statistics`,
        `${this.CACHE_PREFIX}application-statistics`,
      ];

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      return result;
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateHasAppliedStatus service:", error);
      throw new AppError("Failed to update prospect's application status");
    }
  }
}

// Create and export service instance
export default new ProspectService(repository);
