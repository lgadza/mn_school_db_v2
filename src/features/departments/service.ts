import {
  IDepartmentService,
  IDepartmentRepository,
} from "./interfaces/services";
import {
  DepartmentDetailDTO,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  PaginatedDepartmentListDTO,
  DepartmentListQueryParams,
  DepartmentDTOMapper,
} from "./dto";
import { DepartmentStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../schools/dto";
import schoolService from "../schools/service";
import db from "@/config/database";

export class DepartmentService implements IDepartmentService {
  private repository: IDepartmentRepository;
  private readonly CACHE_PREFIX = "department:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IDepartmentRepository) {
    this.repository = repository;
  }

  /**
   * Get department by ID
   */
  public async getDepartmentById(id: string): Promise<DepartmentDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedDepartment = await cache.get(cacheKey);

      if (cachedDepartment) {
        return JSON.parse(cachedDepartment);
      }

      // Get from database if not in cache
      const department = await this.repository.findDepartmentById(id);
      if (!department) {
        throw new NotFoundError(`Department with ID ${id} not found`);
      }

      // Map to DTO with school
      const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);

      // If the department has a school, map it to a school DTO
      if (department.school) {
        departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(departmentDTO), this.CACHE_TTL);

      return departmentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getDepartmentById service:", error);
      throw new AppError("Failed to get department");
    }
  }

  /**
   * Get department by code
   */
  public async getDepartmentByCode(code: string): Promise<DepartmentDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}code:${code}`;
      const cachedDepartment = await cache.get(cacheKey);

      if (cachedDepartment) {
        return JSON.parse(cachedDepartment);
      }

      // Get from database if not in cache
      const department = await this.repository.findDepartmentByCode(code);
      if (!department) {
        throw new NotFoundError(`Department with code ${code} not found`);
      }

      // Map to DTO with school
      const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);

      // If the department has a school, map it to a school DTO
      if (department.school) {
        departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(departmentDTO), this.CACHE_TTL);

      return departmentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getDepartmentByCode service:", error);
      throw new AppError("Failed to get department by code");
    }
  }

  /**
   * Create a new department
   */
  public async createDepartment(
    departmentData: CreateDepartmentDTO
  ): Promise<DepartmentDetailDTO> {
    try {
      // Validate data
      await this.validateDepartmentData(departmentData);

      // Check if school exists
      await schoolService.getSchoolById(departmentData.schoolId);

      // Generate department code if not provided
      if (!departmentData.code) {
        departmentData.code = await this.generateDepartmentCode(
          departmentData.name,
          departmentData.schoolId
        );
      } else {
        // Check if department code is already taken
        const isCodeTaken = await this.repository.isDepartmentCodeTaken(
          departmentData.code
        );
        if (isCodeTaken) {
          throw new ConflictError(
            `Department code ${departmentData.code} is already taken`
          );
        }
      }

      // Create the department
      const newDepartment = await this.repository.createDepartment(
        departmentData
      );

      // Get the complete department with school
      const department = await this.repository.findDepartmentById(
        newDepartment.id
      );
      if (!department) {
        throw new AppError("Failed to retrieve created department");
      }

      // Map to DTO with school
      const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);
      if (department.school) {
        departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
      }

      return departmentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createDepartment service:", error);
      throw new AppError("Failed to create department");
    }
  }

  /**
   * Update a department
   */
  public async updateDepartment(
    id: string,
    departmentData: UpdateDepartmentDTO
  ): Promise<DepartmentDetailDTO> {
    try {
      // Check if department exists
      const existingDepartment = await this.repository.findDepartmentById(id);
      if (!existingDepartment) {
        throw new NotFoundError(`Department with ID ${id} not found`);
      }

      // Validate data
      await this.validateDepartmentData(departmentData);

      // Check if school exists if schoolId is provided
      if (departmentData.schoolId) {
        await schoolService.getSchoolById(departmentData.schoolId);
      }

      // Check if department code is already taken if changing
      if (
        departmentData.code &&
        departmentData.code !== existingDepartment.code
      ) {
        const isCodeTaken = await this.repository.isDepartmentCodeTaken(
          departmentData.code,
          id
        );
        if (isCodeTaken) {
          throw new ConflictError(
            `Department code ${departmentData.code} is already taken`
          );
        }
      }

      // Update department
      await this.repository.updateDepartment(id, departmentData);

      // Clear cache
      await this.clearDepartmentCache(id);
      if (existingDepartment.code) {
        await cache.del(`${this.CACHE_PREFIX}code:${existingDepartment.code}`);
      }
      if (
        departmentData.code &&
        departmentData.code !== existingDepartment.code
      ) {
        await cache.del(`${this.CACHE_PREFIX}code:${departmentData.code}`);
      }

      // Get the updated department
      return this.getDepartmentById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateDepartment service:", error);
      throw new AppError("Failed to update department");
    }
  }

  /**
   * Delete a department
   */
  public async deleteDepartment(id: string): Promise<boolean> {
    try {
      // Check if department exists
      const existingDepartment = await this.repository.findDepartmentById(id);
      if (!existingDepartment) {
        throw new NotFoundError(`Department with ID ${id} not found`);
      }

      // Don't allow deletion of default departments
      if (existingDepartment.isDefault) {
        throw new BadRequestError(
          `Cannot delete a default department. Please set another department as default first.`
        );
      }

      // Delete the department
      const result = await this.repository.deleteDepartment(id);

      // Clear cache
      await this.clearDepartmentCache(id);
      if (existingDepartment.code) {
        await cache.del(`${this.CACHE_PREFIX}code:${existingDepartment.code}`);
      }

      // Clear school departments cache
      await cache.del(
        `${this.CACHE_PREFIX}school:${existingDepartment.schoolId}`
      );

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteDepartment service:", error);
      throw new AppError("Failed to delete department");
    }
  }

  /**
   * Get paginated department list
   */
  public async getDepartmentList(
    params: DepartmentListQueryParams
  ): Promise<PaginatedDepartmentListDTO> {
    try {
      const { departments, total } = await this.repository.getDepartmentList(
        params
      );

      // Map to DTOs with schools
      const departmentDTOs = departments.map((department) => {
        const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);
        if (department.school) {
          departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
        }
        return departmentDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        departments: departmentDTOs,
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
      logger.error("Error in getDepartmentList service:", error);
      throw new AppError("Failed to get department list");
    }
  }

  /**
   * Get departments by school
   */
  public async getDepartmentsBySchool(
    schoolId: string
  ): Promise<DepartmentDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedDepartments = await cache.get(cacheKey);

      if (cachedDepartments) {
        return JSON.parse(cachedDepartments);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const departments = await this.repository.findDepartmentsBySchool(
        schoolId
      );

      // Map to DTOs with schools
      const departmentDTOs = departments.map((department) => {
        const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);
        if (department.school) {
          departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
        }
        return departmentDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(departmentDTOs), this.CACHE_TTL);

      return departmentDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getDepartmentsBySchool service:", error);
      throw new AppError("Failed to get departments by school");
    }
  }

  /**
   * Get departments by head
   */
  public async getDepartmentsByHead(
    headId: string
  ): Promise<DepartmentDetailDTO[]> {
    try {
      const departments = await this.repository.findDepartmentsByHead(headId);

      // Map to DTOs with schools
      return departments.map((department) => {
        const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);
        if (department.school) {
          departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
        }
        return departmentDTO;
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getDepartmentsByHead service:", error);
      throw new AppError("Failed to get departments by head");
    }
  }

  /**
   * Generate a unique department code
   */
  public async generateDepartmentCode(
    name: string,
    schoolId: string
  ): Promise<string> {
    try {
      // Get the school for prefix
      const schoolDetail = await schoolService.getSchoolById(schoolId);

      // Get school short name or first 2 chars of school name
      const schoolPrefix = schoolDetail.shortName
        ? schoolDetail.shortName.substring(0, 2).toUpperCase()
        : schoolDetail.name.substring(0, 2).toUpperCase();

      // Clean department name (remove non-alphanumeric chars)
      const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, "");

      // Get first 3 chars of department name
      const deptPrefix = (cleanName.substring(0, 3) + "XXX").substring(0, 3);

      // Generate a 3-digit random number
      const randomDigits = Math.floor(Math.random() * 900) + 100;

      // Combine to create a code: SS-DDD-NNN (e.g., GH-ACC-123)
      const proposedCode = `${schoolPrefix}-${deptPrefix}-${randomDigits}`;

      // Check if this code is already taken
      const isCodeTaken = await this.repository.isDepartmentCodeTaken(
        proposedCode
      );

      // If code is taken, try again
      if (isCodeTaken) {
        return this.generateDepartmentCode(name, schoolId);
      }

      return proposedCode;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateDepartmentCode service:", error);
      throw new AppError("Failed to generate department code");
    }
  }

  /**
   * Validate department data
   */
  public async validateDepartmentData(
    departmentData: CreateDepartmentDTO | UpdateDepartmentDTO
  ): Promise<boolean> {
    // Validate email format if provided
    if ("contactEmail" in departmentData && departmentData.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(departmentData.contactEmail)) {
        throw new BadRequestError(
          `Invalid email format: ${departmentData.contactEmail}`
        );
      }
    }

    // Validate budget as positive number if provided
    if (
      "budget" in departmentData &&
      departmentData.budget !== null &&
      departmentData.budget !== undefined
    ) {
      if (departmentData.budget < 0) {
        throw new BadRequestError(`Budget must be a positive number`);
      }
    }

    // Validate counts as positive integers if provided
    if (
      "facultyCount" in departmentData &&
      departmentData.facultyCount !== null &&
      departmentData.facultyCount !== undefined
    ) {
      if (
        departmentData.facultyCount < 0 ||
        !Number.isInteger(departmentData.facultyCount)
      ) {
        throw new BadRequestError(`Faculty count must be a positive integer`);
      }
    }

    if (
      "studentCount" in departmentData &&
      departmentData.studentCount !== null &&
      departmentData.studentCount !== undefined
    ) {
      if (
        departmentData.studentCount < 0 ||
        !Number.isInteger(departmentData.studentCount)
      ) {
        throw new BadRequestError(`Student count must be a positive integer`);
      }
    }

    return true;
  }

  /**
   * Get department statistics
   */
  public async getDepartmentStatistics(): Promise<DepartmentStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getDepartmentStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getDepartmentStatistics service:", error);
      throw new AppError("Failed to get department statistics");
    }
  }

  /**
   * Get default department for a school
   */
  public async getDefaultDepartment(
    schoolId: string
  ): Promise<DepartmentDetailDTO | null> {
    try {
      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const department = await this.repository.getDefaultDepartment(schoolId);

      if (!department) {
        return null;
      }

      // Map to DTO with school
      const departmentDTO = DepartmentDTOMapper.toDetailDTO(department);
      if (department.school) {
        departmentDTO.school = SchoolDTOMapper.toDetailDTO(department.school);
      }

      return departmentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getDefaultDepartment service:", error);
      throw new AppError("Failed to get default department");
    }
  }

  /**
   * Set a department as default for a school
   */
  public async setDefaultDepartment(
    departmentId: string,
    schoolId: string
  ): Promise<DepartmentDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if department exists and belongs to the given school
      const department = await this.repository.findDepartmentById(departmentId);

      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }

      if (department.schoolId !== schoolId) {
        throw new BadRequestError(
          `Department with ID ${departmentId} does not belong to school with ID ${schoolId}`
        );
      }

      // Set this department as default (repository will handle unsetting others)
      await this.repository.updateDepartment(
        departmentId,
        { isDefault: true },
        transaction
      );

      await transaction.commit();

      // Clear relevant caches
      await this.clearDepartmentCache(departmentId);
      await cache.del(`${this.CACHE_PREFIX}school:${schoolId}`);

      // Get the updated department
      return this.getDepartmentById(departmentId);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in setDefaultDepartment service:", error);
      throw new AppError("Failed to set department as default");
    }
  }

  /**
   * Clear department cache
   */
  private async clearDepartmentCache(departmentId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${departmentId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new DepartmentService(repository);
