import { ITeacherService, ITeacherRepository } from "./interfaces/services";
import {
  TeacherDetailDTO,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  PaginatedTeacherListDTO,
  TeacherListQueryParams,
  TeacherDTOMapper,
} from "./dto";
import { TeacherStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { UserDTOMapper } from "../users/dto";
import { SchoolDTOMapper } from "../schools/dto";
import { DepartmentDTOMapper } from "../departments/dto";
import userService from "../users/service";
import schoolService from "../schools/service";
import departmentService from "../departments/service";
import db from "@/config/database";
import DateTimeUtil from "@/common/utils/date/dateTimeUtil";

export class TeacherService implements ITeacherService {
  private repository: ITeacherRepository;
  private readonly CACHE_PREFIX = "teacher:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ITeacherRepository) {
    this.repository = repository;
  }

  /**
   * Get teacher by ID
   */
  public async getTeacherById(id: string): Promise<TeacherDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedTeacher = await cache.get(cacheKey);

      if (cachedTeacher) {
        return JSON.parse(cachedTeacher);
      }

      // Get from database if not in cache
      const teacher = await this.repository.findTeacherById(id);
      if (!teacher) {
        throw new NotFoundError(`Teacher with ID ${id} not found`);
      }

      // Map to DTO with related entities
      const teacherDTO = TeacherDTOMapper.toDetailDTO(teacher);

      // If the teacher has related entities, map them to DTOs
      if (teacher.user) {
        teacherDTO.user = UserDTOMapper.toDetailDTO(teacher.user);
      }

      if (teacher.school) {
        teacherDTO.school = SchoolDTOMapper.toDetailDTO(teacher.school);
      }

      if (teacher.department) {
        teacherDTO.department = DepartmentDTOMapper.toDetailDTO(
          teacher.department
        );
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(teacherDTO), this.CACHE_TTL);

      return teacherDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getTeacherById service:", error);
      throw new AppError("Failed to get teacher");
    }
  }

  /**
   * Get teacher by user ID
   */
  public async getTeacherByUserId(userId: string): Promise<TeacherDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}user:${userId}`;
      const cachedTeacher = await cache.get(cacheKey);

      if (cachedTeacher) {
        return JSON.parse(cachedTeacher);
      }

      // Get from database if not in cache
      const teacher = await this.repository.findTeacherByUserId(userId);
      if (!teacher) {
        throw new NotFoundError(`Teacher with user ID ${userId} not found`);
      }

      // Map to DTO with related entities
      const teacherDTO = TeacherDTOMapper.toDetailDTO(teacher);

      // If the teacher has related entities, map them to DTOs
      if (teacher.user) {
        teacherDTO.user = UserDTOMapper.toDetailDTO(teacher.user);
      }

      if (teacher.school) {
        teacherDTO.school = SchoolDTOMapper.toDetailDTO(teacher.school);
      }

      if (teacher.department) {
        teacherDTO.department = DepartmentDTOMapper.toDetailDTO(
          teacher.department
        );
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(teacherDTO), this.CACHE_TTL);

      return teacherDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getTeacherByUserId service:", error);
      throw new AppError("Failed to get teacher by user ID");
    }
  }

  /**
   * Get teacher by employee ID
   */
  public async getTeacherByEmployeeId(
    employeeId: string
  ): Promise<TeacherDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}employeeId:${employeeId}`;
      const cachedTeacher = await cache.get(cacheKey);

      if (cachedTeacher) {
        return JSON.parse(cachedTeacher);
      }

      // Get from database if not in cache
      const teacher = await this.repository.findTeacherByEmployeeId(employeeId);
      if (!teacher) {
        throw new NotFoundError(
          `Teacher with employee ID ${employeeId} not found`
        );
      }

      // Map to DTO with related entities
      const teacherDTO = TeacherDTOMapper.toDetailDTO(teacher);

      // If the teacher has related entities, map them to DTOs
      if (teacher.user) {
        teacherDTO.user = UserDTOMapper.toDetailDTO(teacher.user);
      }

      if (teacher.school) {
        teacherDTO.school = SchoolDTOMapper.toDetailDTO(teacher.school);
      }

      if (teacher.department) {
        teacherDTO.department = DepartmentDTOMapper.toDetailDTO(
          teacher.department
        );
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(teacherDTO), this.CACHE_TTL);

      return teacherDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getTeacherByEmployeeId service:", error);
      throw new AppError("Failed to get teacher by employee ID");
    }
  }

  /**
   * Create a new teacher
   */
  public async createTeacher(
    teacherData: CreateTeacherDTO
  ): Promise<TeacherDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate data
      await this.validateTeacherData(teacherData);

      // Check if user exists
      try {
        await userService.getUserById(teacherData.userId);
      } catch (error) {
        throw new BadRequestError(
          `User with ID ${teacherData.userId} not found`
        );
      }

      // Check if school exists
      try {
        await schoolService.getSchoolById(teacherData.schoolId);
      } catch (error) {
        throw new BadRequestError(
          `School with ID ${teacherData.schoolId} not found`
        );
      }

      // Check if department exists if provided
      if (teacherData.departmentId) {
        try {
          await departmentService.getDepartmentById(teacherData.departmentId);
        } catch (error) {
          throw new BadRequestError(
            `Department with ID ${teacherData.departmentId} not found`
          );
        }
      }

      // Check if user is already a teacher
      const existingTeacher = await this.repository.findTeacherByUserId(
        teacherData.userId
      );
      if (existingTeacher) {
        throw new ConflictError(
          `User with ID ${teacherData.userId} is already a teacher`
        );
      }

      // Generate employee ID if not provided
      if (!teacherData.employeeId) {
        teacherData.employeeId = await this.generateEmployeeId(
          teacherData.schoolId
        );
      } else {
        // Check if employee ID is already taken
        const isEmployeeIdTaken = await this.repository.isEmployeeIdTaken(
          teacherData.employeeId
        );
        if (isEmployeeIdTaken) {
          throw new ConflictError(
            `Employee ID ${teacherData.employeeId} is already taken`
          );
        }
      }

      // Create the teacher
      const newTeacher = await this.repository.createTeacher(
        teacherData,
        transaction
      );

      await transaction.commit();

      // Get the complete teacher with associations
      return this.getTeacherById(newTeacher.id);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createTeacher service:", error);
      throw new AppError("Failed to create teacher");
    }
  }

  /**
   * Update a teacher
   */
  public async updateTeacher(
    id: string,
    teacherData: UpdateTeacherDTO
  ): Promise<TeacherDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if teacher exists
      const existingTeacher = await this.repository.findTeacherById(id);
      if (!existingTeacher) {
        throw new NotFoundError(`Teacher with ID ${id} not found`);
      }

      // Validate data
      await this.validateTeacherData(teacherData);

      // Check if school exists if provided
      if (teacherData.schoolId) {
        try {
          await schoolService.getSchoolById(teacherData.schoolId);
        } catch (error) {
          throw new BadRequestError(
            `School with ID ${teacherData.schoolId} not found`
          );
        }
      }

      // Check if department exists if provided
      if (teacherData.departmentId) {
        try {
          await departmentService.getDepartmentById(teacherData.departmentId);
        } catch (error) {
          throw new BadRequestError(
            `Department with ID ${teacherData.departmentId} not found`
          );
        }
      }

      // Check if employee ID is already taken if changing
      if (
        teacherData.employeeId &&
        teacherData.employeeId !== existingTeacher.employeeId
      ) {
        const isEmployeeIdTaken = await this.repository.isEmployeeIdTaken(
          teacherData.employeeId,
          id
        );
        if (isEmployeeIdTaken) {
          throw new ConflictError(
            `Employee ID ${teacherData.employeeId} is already taken`
          );
        }
      }

      // Update teacher
      await this.repository.updateTeacher(id, teacherData, transaction);

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${id}`,
        `${this.CACHE_PREFIX}user:${existingTeacher.userId}`,
      ];

      if (existingTeacher.employeeId) {
        cacheKeys.push(
          `${this.CACHE_PREFIX}employeeId:${existingTeacher.employeeId}`
        );
      }

      if (
        teacherData.employeeId &&
        teacherData.employeeId !== existingTeacher.employeeId
      ) {
        cacheKeys.push(
          `${this.CACHE_PREFIX}employeeId:${teacherData.employeeId}`
        );
      }

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      // Get the updated teacher
      return this.getTeacherById(id);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateTeacher service:", error);
      throw new AppError("Failed to update teacher");
    }
  }

  /**
   * Delete a teacher
   */
  public async deleteTeacher(id: string): Promise<boolean> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if teacher exists
      const existingTeacher = await this.repository.findTeacherById(id);
      if (!existingTeacher) {
        throw new NotFoundError(`Teacher with ID ${id} not found`);
      }

      // Delete the teacher
      const result = await this.repository.deleteTeacher(id, transaction);

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${id}`,
        `${this.CACHE_PREFIX}user:${existingTeacher.userId}`,
      ];

      if (existingTeacher.employeeId) {
        cacheKeys.push(
          `${this.CACHE_PREFIX}employeeId:${existingTeacher.employeeId}`
        );
      }

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      return result;
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteTeacher service:", error);
      throw new AppError("Failed to delete teacher");
    }
  }

  /**
   * Get paginated teacher list
   */
  public async getTeacherList(
    params: TeacherListQueryParams
  ): Promise<PaginatedTeacherListDTO> {
    try {
      const { teachers, total } = await this.repository.getTeacherList(params);

      // Map to DTOs with related entities
      const teacherDTOs = teachers.map((teacher) => {
        const teacherDTO = TeacherDTOMapper.toDetailDTO(teacher);

        if (teacher.user) {
          teacherDTO.user = UserDTOMapper.toDetailDTO(teacher.user);
        }

        if (teacher.school) {
          teacherDTO.school = SchoolDTOMapper.toDetailDTO(teacher.school);
        }

        if (teacher.department) {
          teacherDTO.department = DepartmentDTOMapper.toDetailDTO(
            teacher.department
          );
        }

        return teacherDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        teachers: teacherDTOs,
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
      logger.error("Error in getTeacherList service:", error);
      throw new AppError("Failed to get teacher list");
    }
  }

  /**
   * Get teachers by school
   */
  public async getTeachersBySchool(
    schoolId: string
  ): Promise<TeacherDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedTeachers = await cache.get(cacheKey);

      if (cachedTeachers) {
        return JSON.parse(cachedTeachers);
      }

      // Check if school exists
      try {
        await schoolService.getSchoolById(schoolId);
      } catch (error) {
        throw new BadRequestError(`School with ID ${schoolId} not found`);
      }

      const teachers = await this.repository.findTeachersBySchool(schoolId);

      // Map to DTOs with related entities
      const teacherDTOs = teachers.map((teacher) => {
        const teacherDTO = TeacherDTOMapper.toDetailDTO(teacher);

        if (teacher.user) {
          teacherDTO.user = UserDTOMapper.toDetailDTO(teacher.user);
        }

        if (teacher.school) {
          teacherDTO.school = SchoolDTOMapper.toDetailDTO(teacher.school);
        }

        if (teacher.department) {
          teacherDTO.department = DepartmentDTOMapper.toDetailDTO(
            teacher.department
          );
        }

        return teacherDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(teacherDTOs), this.CACHE_TTL);

      return teacherDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getTeachersBySchool service:", error);
      throw new AppError("Failed to get teachers by school");
    }
  }

  /**
   * Get teachers by department
   */
  public async getTeachersByDepartment(
    departmentId: string
  ): Promise<TeacherDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}department:${departmentId}`;
      const cachedTeachers = await cache.get(cacheKey);

      if (cachedTeachers) {
        return JSON.parse(cachedTeachers);
      }

      // Check if department exists
      try {
        await departmentService.getDepartmentById(departmentId);
      } catch (error) {
        throw new BadRequestError(
          `Department with ID ${departmentId} not found`
        );
      }

      const teachers = await this.repository.findTeachersByDepartment(
        departmentId
      );

      // Map to DTOs with related entities
      const teacherDTOs = teachers.map((teacher) => {
        const teacherDTO = TeacherDTOMapper.toDetailDTO(teacher);

        if (teacher.user) {
          teacherDTO.user = UserDTOMapper.toDetailDTO(teacher.user);
        }

        if (teacher.school) {
          teacherDTO.school = SchoolDTOMapper.toDetailDTO(teacher.school);
        }

        if (teacher.department) {
          teacherDTO.department = DepartmentDTOMapper.toDetailDTO(
            teacher.department
          );
        }

        return teacherDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(teacherDTOs), this.CACHE_TTL);

      return teacherDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getTeachersByDepartment service:", error);
      throw new AppError("Failed to get teachers by department");
    }
  }

  /**
   * Generate a unique employee ID
   */
  public async generateEmployeeId(schoolId: string): Promise<string> {
    try {
      // Check if school exists
      const schoolDetail = await schoolService.getSchoolById(schoolId);

      // Get school short name or first 2 chars of school name
      const schoolPrefix = schoolDetail.shortName
        ? schoolDetail.shortName.substring(0, 2).toUpperCase()
        : schoolDetail.name.substring(0, 2).toUpperCase();

      // Get current year
      const currentYear = new Date().getFullYear().toString().substring(2);

      // Get sequential number (count of teachers in the school + 1)
      const teachersInSchool = await this.repository.findTeachersBySchool(
        schoolId
      );
      const sequentialNumber = (teachersInSchool.length + 1)
        .toString()
        .padStart(3, "0");

      // Combine to create a unique ID: SS-YY-NNN (e.g., GH-23-001)
      const proposedId = `${schoolPrefix}-${currentYear}-${sequentialNumber}`;

      // Check if this ID is already taken
      const isIdTaken = await this.repository.isEmployeeIdTaken(proposedId);

      // If ID is taken, append a random number
      if (isIdTaken) {
        const randomDigit = Math.floor(Math.random() * 10);
        return `${proposedId}-${randomDigit}`;
      }

      return proposedId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateEmployeeId service:", error);
      throw new AppError("Failed to generate employee ID");
    }
  }

  /**
   * Validate teacher data
   */
  public async validateTeacherData(
    teacherData: CreateTeacherDTO | UpdateTeacherDTO
  ): Promise<boolean> {
    // Validate hire date if provided
    if (
      "hireDate" in teacherData &&
      teacherData.hireDate !== null &&
      teacherData.hireDate !== undefined
    ) {
      const hireDate = new Date(teacherData.hireDate);
      if (!DateTimeUtil.isValidDate(hireDate)) {
        throw new BadRequestError(`Invalid hire date: ${teacherData.hireDate}`);
      }

      // Hire date should not be in the future
      const today = new Date();
      if (hireDate > today) {
        throw new BadRequestError("Hire date cannot be in the future");
      }
    }

    // Validate last promotion date if provided
    if (
      "lastPromotionDate" in teacherData &&
      teacherData.lastPromotionDate !== null &&
      teacherData.lastPromotionDate !== undefined
    ) {
      const promotionDate = new Date(teacherData.lastPromotionDate);
      if (!DateTimeUtil.isValidDate(promotionDate)) {
        throw new BadRequestError(
          `Invalid last promotion date: ${teacherData.lastPromotionDate}`
        );
      }

      // Last promotion date should not be in the future
      const today = new Date();
      if (promotionDate > today) {
        throw new BadRequestError(
          "Last promotion date cannot be in the future"
        );
      }

      // Last promotion date should not be before hire date if both are provided
      if (
        "hireDate" in teacherData &&
        teacherData.hireDate !== null &&
        teacherData.hireDate !== undefined
      ) {
        const hireDate = new Date(teacherData.hireDate);
        if (promotionDate < hireDate) {
          throw new BadRequestError(
            "Last promotion date cannot be before hire date"
          );
        }
      }
    }

    // Validate years of experience as positive number if provided
    if (
      "yearsOfExperience" in teacherData &&
      teacherData.yearsOfExperience !== null &&
      teacherData.yearsOfExperience !== undefined
    ) {
      if (
        teacherData.yearsOfExperience < 0 ||
        !Number.isInteger(teacherData.yearsOfExperience)
      ) {
        throw new BadRequestError(
          "Years of experience must be a positive integer"
        );
      }
    }

    // Validate teaching load as positive number if provided
    if (
      "teachingLoad" in teacherData &&
      teacherData.teachingLoad !== null &&
      teacherData.teachingLoad !== undefined
    ) {
      if (teacherData.teachingLoad < 0) {
        throw new BadRequestError("Teaching load must be a positive number");
      }
    }

    // Validate salary as positive number if provided
    if (
      "salary" in teacherData &&
      teacherData.salary !== null &&
      teacherData.salary !== undefined
    ) {
      if (teacherData.salary < 0) {
        throw new BadRequestError("Salary must be a positive number");
      }
    }

    return true;
  }

  /**
   * Get teacher statistics
   */
  public async getTeacherStatistics(): Promise<TeacherStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getTeacherStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getTeacherStatistics service:", error);
      throw new AppError("Failed to get teacher statistics");
    }
  }
}

// Create and export service instance
export default new TeacherService(repository);
