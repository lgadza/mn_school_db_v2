import { ISubjectService, ISubjectRepository } from "./interfaces/services";
import {
  SubjectDetailDTO,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  PaginatedSubjectListDTO,
  SubjectListQueryParams,
  SubjectDTOMapper,
} from "./dto";
import { SubjectStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { SchoolDTOMapper } from "../../schools/dto";
import { CategoryDTOMapper } from "../categories/dto";
import { DepartmentDTOMapper } from "../departments/dto";
import schoolService from "../../schools/service";
import categoryService from "../categories/service";
import departmentService from "../departments/service";
import db from "@/config/database";

export class SubjectService implements ISubjectService {
  private repository: ISubjectRepository;
  private readonly CACHE_PREFIX = "subject:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: ISubjectRepository) {
    this.repository = repository;
  }

  /**
   * Get subject by ID
   */
  public async getSubjectById(id: string): Promise<SubjectDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedSubject = await cache.get(cacheKey);

      if (cachedSubject) {
        return JSON.parse(cachedSubject);
      }

      // Get from database if not in cache
      const subject = await this.repository.findSubjectById(id);
      if (!subject) {
        throw new NotFoundError(`Subject with ID ${id} not found`);
      }

      // Map to DTO with related entities
      const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

      // Map related entities if present
      if (subject.school) {
        subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
      }

      if (subject.category) {
        subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
      }

      if (subject.department) {
        subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
          subject.department
        );
      }

      if (subject.prerequisiteSubject) {
        subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
          subject.prerequisiteSubject
        );
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(subjectDTO), this.CACHE_TTL);

      return subjectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSubjectById service:", error);
      throw new AppError("Failed to get subject");
    }
  }

  /**
   * Create a new subject
   */
  public async createSubject(
    subjectData: CreateSubjectDTO
  ): Promise<SubjectDetailDTO> {
    try {
      // Validate data
      await this.validateSubjectData(subjectData);

      // Check if school exists
      await schoolService.getSchoolById(subjectData.schoolId);

      // Check if category exists if provided
      if (subjectData.categoryId) {
        await categoryService.getCategoryById(subjectData.categoryId);
      }

      // Check if department exists if provided
      if (subjectData.departmentId) {
        await departmentService.getDepartmentById(subjectData.departmentId);
      }

      // Check if prerequisite subject exists if provided
      if (subjectData.prerequisite) {
        await this.getSubjectById(subjectData.prerequisite);
      }

      // Create the subject
      const newSubject = await this.repository.createSubject(subjectData);

      // Get the complete subject with relationships
      const subject = await this.repository.findSubjectById(newSubject.id);
      if (!subject) {
        throw new AppError("Failed to retrieve created subject");
      }

      // Map to DTO with related entities
      const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

      if (subject.school) {
        subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
      }

      if (subject.category) {
        subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
      }

      if (subject.department) {
        subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
          subject.department
        );
      }

      if (subject.prerequisiteSubject) {
        subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
          subject.prerequisiteSubject
        );
      }

      return subjectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSubject service:", error);
      throw new AppError("Failed to create subject");
    }
  }

  /**
   * Update a subject
   */
  public async updateSubject(
    id: string,
    subjectData: UpdateSubjectDTO
  ): Promise<SubjectDetailDTO> {
    try {
      // Check if subject exists
      const existingSubject = await this.repository.findSubjectById(id);
      if (!existingSubject) {
        throw new NotFoundError(`Subject with ID ${id} not found`);
      }

      // Validate data
      await this.validateSubjectData(subjectData);

      // Check if school exists if schoolId is provided
      if (subjectData.schoolId) {
        await schoolService.getSchoolById(subjectData.schoolId);
      }

      // Check if category exists if categoryId is provided
      if (subjectData.categoryId) {
        await categoryService.getCategoryById(subjectData.categoryId);
      }

      // Check if department exists if departmentId is provided
      if (subjectData.departmentId) {
        await departmentService.getDepartmentById(subjectData.departmentId);
      }

      // Check if prerequisite subject exists if provided and not same as current subject
      if (subjectData.prerequisite && subjectData.prerequisite !== id) {
        await this.getSubjectById(subjectData.prerequisite);
      }

      // Prevent self-reference for prerequisite
      if (subjectData.prerequisite === id) {
        throw new BadRequestError(
          "A subject cannot be a prerequisite for itself"
        );
      }

      // Update subject
      await this.repository.updateSubject(id, subjectData);

      // Clear cache
      await this.clearSubjectCache(id);

      // Get the updated subject
      return this.getSubjectById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateSubject service:", error);
      throw new AppError("Failed to update subject");
    }
  }

  /**
   * Delete a subject
   */
  public async deleteSubject(id: string): Promise<boolean> {
    try {
      // Check if subject exists
      const existingSubject = await this.repository.findSubjectById(id);
      if (!existingSubject) {
        throw new NotFoundError(`Subject with ID ${id} not found`);
      }

      // Check if the subject is a prerequisite for other subjects
      // This would require additional code to check the dependency

      // Delete the subject
      const result = await this.repository.deleteSubject(id);

      // Clear cache
      await this.clearSubjectCache(id);

      // Clear related caches
      if (existingSubject.schoolId) {
        await cache.del(
          `${this.CACHE_PREFIX}school:${existingSubject.schoolId}`
        );
      }

      if (existingSubject.categoryId) {
        await cache.del(
          `${this.CACHE_PREFIX}category:${existingSubject.categoryId}`
        );
      }

      if (existingSubject.departmentId) {
        await cache.del(
          `${this.CACHE_PREFIX}department:${existingSubject.departmentId}`
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteSubject service:", error);
      throw new AppError("Failed to delete subject");
    }
  }

  /**
   * Get paginated subject list
   */
  public async getSubjectList(
    params: SubjectListQueryParams
  ): Promise<PaginatedSubjectListDTO> {
    try {
      const { subjects, total } = await this.repository.getSubjectList(params);

      // Map to DTOs with related entities
      const subjectDTOs = subjects.map((subject) => {
        const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

        if (subject.school) {
          subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
        }

        if (subject.category) {
          subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
        }

        if (subject.department) {
          subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
            subject.department
          );
        }

        if (subject.prerequisiteSubject) {
          subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
            subject.prerequisiteSubject
          );
        }

        return subjectDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        subjects: subjectDTOs,
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
      logger.error("Error in getSubjectList service:", error);
      throw new AppError("Failed to get subject list");
    }
  }

  /**
   * Get subjects by school
   */
  public async getSubjectsBySchool(
    schoolId: string
  ): Promise<SubjectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedSubjects = await cache.get(cacheKey);

      if (cachedSubjects) {
        return JSON.parse(cachedSubjects);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const subjects = await this.repository.findSubjectsBySchool(schoolId);

      // Map to DTOs with related entities
      const subjectDTOs = subjects.map((subject) => {
        const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

        if (subject.school) {
          subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
        }

        if (subject.category) {
          subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
        }

        if (subject.department) {
          subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
            subject.department
          );
        }

        if (subject.prerequisiteSubject) {
          subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
            subject.prerequisiteSubject
          );
        }

        return subjectDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(subjectDTOs), this.CACHE_TTL);

      return subjectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSubjectsBySchool service:", error);
      throw new AppError("Failed to get subjects by school");
    }
  }

  /**
   * Get subjects by category
   */
  public async getSubjectsByCategory(
    categoryId: string
  ): Promise<SubjectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}category:${categoryId}`;
      const cachedSubjects = await cache.get(cacheKey);

      if (cachedSubjects) {
        return JSON.parse(cachedSubjects);
      }

      // Check if category exists
      await categoryService.getCategoryById(categoryId);

      const subjects = await this.repository.findSubjectsByCategory(categoryId);

      // Map to DTOs with related entities
      const subjectDTOs = subjects.map((subject) => {
        const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

        if (subject.school) {
          subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
        }

        if (subject.category) {
          subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
        }

        if (subject.department) {
          subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
            subject.department
          );
        }

        if (subject.prerequisiteSubject) {
          subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
            subject.prerequisiteSubject
          );
        }

        return subjectDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(subjectDTOs), this.CACHE_TTL);

      return subjectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSubjectsByCategory service:", error);
      throw new AppError("Failed to get subjects by category");
    }
  }

  /**
   * Get subjects by department
   */
  public async getSubjectsByDepartment(
    departmentId: string
  ): Promise<SubjectDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}department:${departmentId}`;
      const cachedSubjects = await cache.get(cacheKey);

      if (cachedSubjects) {
        return JSON.parse(cachedSubjects);
      }

      // Check if department exists
      await departmentService.getDepartmentById(departmentId);

      const subjects = await this.repository.findSubjectsByDepartment(
        departmentId
      );

      // Map to DTOs with related entities
      const subjectDTOs = subjects.map((subject) => {
        const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

        if (subject.school) {
          subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
        }

        if (subject.category) {
          subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
        }

        if (subject.department) {
          subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
            subject.department
          );
        }

        if (subject.prerequisiteSubject) {
          subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
            subject.prerequisiteSubject
          );
        }

        return subjectDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(subjectDTOs), this.CACHE_TTL);

      return subjectDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSubjectsByDepartment service:", error);
      throw new AppError("Failed to get subjects by department");
    }
  }

  /**
   * Get subject by code
   */
  public async getSubjectByCode(
    code: string,
    schoolId?: string
  ): Promise<SubjectDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}code:${code}${
        schoolId ? `:${schoolId}` : ""
      }`;
      const cachedSubject = await cache.get(cacheKey);

      if (cachedSubject) {
        return JSON.parse(cachedSubject);
      }

      // Get from database if not in cache
      const subject = await this.repository.findSubjectByCode(code, schoolId);
      if (!subject) {
        throw new NotFoundError(
          `Subject with code ${code}${
            schoolId ? ` in school ${schoolId}` : ""
          } not found`
        );
      }

      // Map to DTO with related entities
      const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

      if (subject.school) {
        subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
      }

      if (subject.category) {
        subjectDTO.category = CategoryDTOMapper.toDetailDTO(subject.category);
      }

      if (subject.department) {
        subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
          subject.department
        );
      }

      if (subject.prerequisiteSubject) {
        subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
          subject.prerequisiteSubject
        );
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(subjectDTO), this.CACHE_TTL);

      return subjectDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSubjectByCode service:", error);
      throw new AppError("Failed to get subject by code");
    }
  }

  /**
   * Validate subject data
   */
  public async validateSubjectData(
    subjectData: CreateSubjectDTO | UpdateSubjectDTO
  ): Promise<boolean> {
    // Validate credits as a positive number
    if (
      "credits" in subjectData &&
      subjectData.credits !== null &&
      subjectData.credits !== undefined
    ) {
      if (subjectData.credits < 0) {
        throw new BadRequestError("Credits must be a positive number");
      }
    }

    // Validate sort order as a positive integer
    if (
      "sortOrder" in subjectData &&
      subjectData.sortOrder !== null &&
      subjectData.sortOrder !== undefined
    ) {
      if (
        subjectData.sortOrder < 0 ||
        !Number.isInteger(subjectData.sortOrder)
      ) {
        throw new BadRequestError("Sort order must be a positive integer");
      }
    }

    // Check for unique code within school if provided
    if (
      "code" in subjectData &&
      subjectData.code &&
      "schoolId" in subjectData &&
      subjectData.schoolId
    ) {
      const existingSubject = await this.repository.findSubjectByCode(
        subjectData.code,
        subjectData.schoolId
      );

      // If creating a new subject or updating to a different code
      if (existingSubject) {
        throw new BadRequestError(
          `Subject with code '${subjectData.code}' already exists in the specified school`
        );
      }
    }

    return true;
  }

  /**
   * Get subject statistics
   */
  public async getSubjectStatistics(): Promise<SubjectStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getSubjectStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getSubjectStatistics service:", error);
      throw new AppError("Failed to get subject statistics");
    }
  }

  /**
   * Create multiple subjects at once
   */
  public async createSubjectsBulk(
    subjectsData: CreateSubjectDTO[]
  ): Promise<SubjectDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all subject data
      for (const subjectData of subjectsData) {
        await this.validateSubjectData(subjectData);

        // Check if school exists
        await schoolService.getSchoolById(subjectData.schoolId);

        // Check if category exists if provided
        if (subjectData.categoryId) {
          await categoryService.getCategoryById(subjectData.categoryId);
        }

        // Check if department exists if provided
        if (subjectData.departmentId) {
          await departmentService.getDepartmentById(subjectData.departmentId);
        }

        // Check if prerequisite subject exists if provided
        if (subjectData.prerequisite) {
          await this.getSubjectById(subjectData.prerequisite);
        }
      }

      // Create subjects in bulk
      const newSubjects = await this.repository.createSubjectsBulk(
        subjectsData,
        transaction
      );

      await transaction.commit();

      // Get the complete subjects with relationships
      const subjectIds = newSubjects.map((subject) => subject.id);
      const detailedSubjects: SubjectDetailDTO[] = [];

      for (const id of subjectIds) {
        const subject = await this.repository.findSubjectById(id);
        if (subject) {
          const subjectDTO = SubjectDTOMapper.toDetailDTO(subject);

          if (subject.school) {
            subjectDTO.school = SchoolDTOMapper.toDetailDTO(subject.school);
          }

          if (subject.category) {
            subjectDTO.category = CategoryDTOMapper.toDetailDTO(
              subject.category
            );
          }

          if (subject.department) {
            subjectDTO.department = DepartmentDTOMapper.toDetailDTO(
              subject.department
            );
          }

          if (subject.prerequisiteSubject) {
            subjectDTO.prerequisiteSubject = SubjectDTOMapper.toBaseDTO(
              subject.prerequisiteSubject
            );
          }

          detailedSubjects.push(subjectDTO);
        }
      }

      return detailedSubjects;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createSubjectsBulk service:", error);
      throw new AppError("Failed to create subjects in bulk");
    }
  }

  /**
   * Delete multiple subjects at once
   */
  public async deleteSubjectsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify subjects exist
      const subjects = await Promise.all(
        ids.map((id) => this.repository.findSubjectById(id))
      );

      // Filter out any null results (subjects not found)
      const existingSubjects = subjects.filter((subject) => subject !== null);

      if (existingSubjects.length === 0) {
        throw new NotFoundError("None of the specified subjects were found");
      }

      // Delete subjects
      const deletedCount = await this.repository.deleteSubjectsBulk(
        existingSubjects.map((subject) => subject!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted subject
      for (const subject of existingSubjects) {
        if (subject) {
          await this.clearSubjectCache(subject.id);

          // Clear related caches
          if (subject.schoolId) {
            await cache.del(`${this.CACHE_PREFIX}school:${subject.schoolId}`);
          }

          if (subject.categoryId) {
            await cache.del(
              `${this.CACHE_PREFIX}category:${subject.categoryId}`
            );
          }

          if (subject.departmentId) {
            await cache.del(
              `${this.CACHE_PREFIX}department:${subject.departmentId}`
            );
          }
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
      logger.error("Error in deleteSubjectsBulk service:", error);
      throw new AppError("Failed to delete subjects in bulk");
    }
  }

  /**
   * Clear subject cache
   */
  private async clearSubjectCache(subjectId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${subjectId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new SubjectService(repository);
