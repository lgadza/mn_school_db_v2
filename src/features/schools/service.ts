import { ISchoolService, ISchoolRepository } from "./interfaces/services";
import {
  SchoolDetailDTO,
  CreateSchoolDTO,
  UpdateSchoolDTO,
  PaginatedSchoolListDTO,
  SchoolListQueryParams,
  SchoolDTOMapper,
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
import { AddressDTOMapper, CreateAddressDTO } from "../address/dto"; // Add CreateAddressDTO here
import addressRepository from "../address/repository";
import { SchoolType, SchoolLevel } from "./interfaces/interfaces";
import db from "@/config/database"; // Also add missing db import

export class SchoolService implements ISchoolService {
  private repository: ISchoolRepository;
  private readonly CACHE_PREFIX = "school:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ISchoolRepository) {
    this.repository = repository;
  }

  /**
   * Get school by ID
   */
  public async getSchoolById(id: string): Promise<SchoolDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedSchool = await cache.get(cacheKey);

      if (cachedSchool) {
        return JSON.parse(cachedSchool);
      }

      // Get from database if not in cache
      const school = await this.repository.findSchoolById(id);
      if (!school) {
        throw new NotFoundError(`School with ID ${id} not found`);
      }

      // Map to DTO with address
      const schoolDTO = SchoolDTOMapper.toDetailDTO(school);

      // If the school has an address, map it to an address DTO
      if (school.address) {
        schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolDTO), this.CACHE_TTL);

      return schoolDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolById service:", error);
      throw new AppError("Failed to get school");
    }
  }

  /**
   * Get school by code
   */
  public async getSchoolByCode(code: string): Promise<SchoolDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}code:${code}`;
      const cachedSchool = await cache.get(cacheKey);

      if (cachedSchool) {
        return JSON.parse(cachedSchool);
      }

      // Get from database if not in cache
      const school = await this.repository.findSchoolByCode(code);
      if (!school) {
        throw new NotFoundError(`School with code ${code} not found`);
      }

      // Map to DTO with address
      const schoolDTO = SchoolDTOMapper.toDetailDTO(school);

      // If the school has an address, map it to an address DTO
      if (school.address) {
        schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(schoolDTO), this.CACHE_TTL);

      return schoolDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolByCode service:", error);
      throw new AppError("Failed to get school by code");
    }
  }

  /**
   * Create a new school
   */
  public async createSchool(
    schoolData: CreateSchoolDTO
  ): Promise<SchoolDetailDTO> {
    try {
      // Validate data
      await this.validateSchoolData(schoolData);

      // Check if address exists
      const address = await addressRepository.findAddressById(
        schoolData.addressId
      );
      if (!address) {
        throw new BadRequestError(
          `Address with ID ${schoolData.addressId} not found`
        );
      }

      // Generate school code if not provided
      if (!schoolData.schoolCode) {
        schoolData.schoolCode = await this.generateSchoolCode(
          schoolData.name,
          schoolData.level
        );
      } else {
        // Check if school code is already taken
        const isCodeTaken = await this.repository.isSchoolCodeTaken(
          schoolData.schoolCode
        );
        if (isCodeTaken) {
          throw new ConflictError(
            `School code ${schoolData.schoolCode} is already taken`
          );
        }
      }

      // Create the school
      const newSchool = await this.repository.createSchool(schoolData);

      // Get the complete school with address
      const school = await this.repository.findSchoolById(newSchool.id);
      if (!school) {
        throw new AppError("Failed to retrieve created school");
      }

      // Map to DTO with address
      const schoolDTO = SchoolDTOMapper.toDetailDTO(school);
      if (school.address) {
        schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
      }

      return schoolDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSchool service:", error);
      throw new AppError("Failed to create school");
    }
  }

  /**
   * Create a new school with address
   */
  public async createSchoolWithAddress(
    schoolData: CreateSchoolDTO,
    addressData: CreateAddressDTO
  ): Promise<SchoolDetailDTO> {
    try {
      // Start a transaction to ensure both operations succeed or fail together
      const transaction = await db.sequelize.transaction();

      try {
        // Create the address first
        const newAddress = await addressRepository.createAddress(
          addressData,
          transaction
        );

        // Set the addressId in the school data
        schoolData.addressId = newAddress.id;

        // Validate data
        await this.validateSchoolData(schoolData);

        // Generate school code if not provided
        if (!schoolData.schoolCode) {
          schoolData.schoolCode = await this.generateSchoolCode(
            schoolData.name,
            schoolData.level
          );
        } else {
          // Check if school code is already taken
          const isCodeTaken = await this.repository.isSchoolCodeTaken(
            schoolData.schoolCode
          );
          if (isCodeTaken) {
            throw new ConflictError(
              `School code ${schoolData.schoolCode} is already taken`
            );
          }
        }

        // Create the school
        const newSchool = await this.repository.createSchool(
          schoolData,
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Get the complete school with address
        const school = await this.repository.findSchoolById(newSchool.id);
        if (!school) {
          throw new AppError("Failed to retrieve created school");
        }

        // Map to DTO with address
        const schoolDTO = SchoolDTOMapper.toDetailDTO(school);
        if (school.address) {
          schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
        }

        return schoolDTO;
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSchoolWithAddress service:", error);
      throw new AppError("Failed to create school with address");
    }
  }

  /**
   * Update a school
   */
  public async updateSchool(
    id: string,
    schoolData: UpdateSchoolDTO
  ): Promise<SchoolDetailDTO> {
    try {
      // Check if school exists
      const existingSchool = await this.repository.findSchoolById(id);
      if (!existingSchool) {
        throw new NotFoundError(`School with ID ${id} not found`);
      }

      // Validate data
      await this.validateSchoolData(schoolData);

      // Check if address exists if addressId is provided
      if (schoolData.addressId) {
        const address = await addressRepository.findAddressById(
          schoolData.addressId
        );
        if (!address) {
          throw new BadRequestError(
            `Address with ID ${schoolData.addressId} not found`
          );
        }
      }

      // Check if school code is already taken if changing
      if (
        schoolData.schoolCode &&
        schoolData.schoolCode !== existingSchool.schoolCode
      ) {
        const isCodeTaken = await this.repository.isSchoolCodeTaken(
          schoolData.schoolCode,
          id
        );
        if (isCodeTaken) {
          throw new ConflictError(
            `School code ${schoolData.schoolCode} is already taken`
          );
        }
      }

      // Update school
      await this.repository.updateSchool(id, schoolData);

      // Clear cache
      await this.clearSchoolCache(id);
      if (existingSchool.schoolCode) {
        await cache.del(
          `${this.CACHE_PREFIX}code:${existingSchool.schoolCode}`
        );
      }
      if (
        schoolData.schoolCode &&
        schoolData.schoolCode !== existingSchool.schoolCode
      ) {
        await cache.del(`${this.CACHE_PREFIX}code:${schoolData.schoolCode}`);
      }

      // Get the updated school
      return this.getSchoolById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateSchool service:", error);
      throw new AppError("Failed to update school");
    }
  }

  /**
   * Delete a school
   */
  public async deleteSchool(id: string): Promise<boolean> {
    try {
      // Check if school exists
      const existingSchool = await this.repository.findSchoolById(id);
      if (!existingSchool) {
        throw new NotFoundError(`School with ID ${id} not found`);
      }

      // Delete the school
      const result = await this.repository.deleteSchool(id);

      // Clear cache
      await this.clearSchoolCache(id);
      if (existingSchool.schoolCode) {
        await cache.del(
          `${this.CACHE_PREFIX}code:${existingSchool.schoolCode}`
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteSchool service:", error);
      throw new AppError("Failed to delete school");
    }
  }

  /**
   * Get paginated school list
   */
  public async getSchoolList(
    params: SchoolListQueryParams
  ): Promise<PaginatedSchoolListDTO> {
    try {
      const { schools, total } = await this.repository.getSchoolList(params);

      // Map to DTOs with addresses
      const schoolDTOs = schools.map((school) => {
        const schoolDTO = SchoolDTOMapper.toDetailDTO(school);
        if (school.address) {
          schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
        }
        return schoolDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        schools: schoolDTOs,
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
      logger.error("Error in getSchoolList service:", error);
      throw new AppError("Failed to get school list");
    }
  }

  /**
   * Get schools by principal
   */
  public async getSchoolsByPrincipal(
    principalId: string
  ): Promise<SchoolDetailDTO[]> {
    try {
      const schools = await this.repository.findSchoolsByPrincipal(principalId);

      // Map to DTOs with addresses
      return schools.map((school) => {
        const schoolDTO = SchoolDTOMapper.toDetailDTO(school);
        if (school.address) {
          schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
        }
        return schoolDTO;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolsByPrincipal service:", error);
      throw new AppError("Failed to get schools by principal");
    }
  }

  /**
   * Get schools by administrator
   */
  public async getSchoolsByAdmin(adminId: string): Promise<SchoolDetailDTO[]> {
    try {
      const schools = await this.repository.findSchoolsByAdmin(adminId);

      // Map to DTOs with addresses
      return schools.map((school) => {
        const schoolDTO = SchoolDTOMapper.toDetailDTO(school);
        if (school.address) {
          schoolDTO.address = AddressDTOMapper.toDetailDTO(school.address);
        }
        return schoolDTO;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSchoolsByAdmin service:", error);
      throw new AppError("Failed to get schools by administrator");
    }
  }

  /**
   * Generate a unique school code
   */
  public async generateSchoolCode(
    name: string,
    level: string
  ): Promise<string> {
    // Convert the name to uppercase and remove any non-alphanumeric characters
    const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Get the first 3 characters of the name (or pad with X if shorter)
    const namePrefix = (cleanName.substring(0, 3) + "XXX").substring(0, 3);

    // Get the first character of the level
    const levelChar = level.substring(0, 1).toUpperCase();

    // Generate a 3-digit random number
    const randomDigits = Math.floor(Math.random() * 900) + 100;

    // Combine to create a code: NAME-L-RRR (e.g., ABC-P-123)
    const proposedCode = `${namePrefix}-${levelChar}-${randomDigits}`;

    // Check if this code is already taken
    const isCodeTaken = await this.repository.isSchoolCodeTaken(proposedCode);

    // If code is taken, try again with a new random number
    if (isCodeTaken) {
      return this.generateSchoolCode(name, level);
    }

    return proposedCode;
  }

  /**
   * Validate school data
   */
  public async validateSchoolData(
    schoolData: CreateSchoolDTO | UpdateSchoolDTO
  ): Promise<boolean> {
    // Validate level if provided
    if ("level" in schoolData && schoolData.level) {
      const validLevels: SchoolLevel[] = [
        "primary",
        "secondary",
        "high",
        "tertiary",
        "quaternary",
      ];
      if (!validLevels.includes(schoolData.level)) {
        throw new BadRequestError(
          `Invalid school level: ${
            schoolData.level
          }. Must be one of: ${validLevels.join(", ")}`
        );
      }
    }

    // Validate school type if provided
    if ("schoolType" in schoolData && schoolData.schoolType) {
      const validTypes: SchoolType[] = ["day", "boarding", "both"];
      if (!validTypes.includes(schoolData.schoolType)) {
        throw new BadRequestError(
          `Invalid school type: ${
            schoolData.schoolType
          }. Must be one of: ${validTypes.join(", ")}`
        );
      }
    }

    // Validate year opened if provided
    if ("yearOpened" in schoolData && schoolData.yearOpened) {
      const currentYear = new Date().getFullYear();
      if (schoolData.yearOpened < 1800 || schoolData.yearOpened > currentYear) {
        throw new BadRequestError(
          `Invalid year opened: ${schoolData.yearOpened}. Must be between 1800 and ${currentYear}`
        );
      }
    }

    // Validate email format if provided
    if ("email" in schoolData && schoolData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(schoolData.email)) {
        throw new BadRequestError(`Invalid email format: ${schoolData.email}`);
      }
    }

    // Validate website URL format if provided
    if ("websiteUrl" in schoolData && schoolData.websiteUrl) {
      try {
        new URL(schoolData.websiteUrl);
      } catch (error) {
        throw new BadRequestError(
          `Invalid website URL: ${schoolData.websiteUrl}`
        );
      }
    }

    return true;
  }

  /**
   * Clear school cache
   */
  private async clearSchoolCache(schoolId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${schoolId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new SchoolService(repository);
