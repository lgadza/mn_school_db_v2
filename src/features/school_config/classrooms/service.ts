import { IClassroomService, IClassroomRepository } from "./interfaces/services";
import {
  ClassroomDetailDTO,
  CreateClassroomDTO,
  UpdateClassroomDTO,
  PaginatedClassroomListDTO,
  ClassroomListQueryParams,
  ClassroomDTOMapper,
} from "./dto";
import { ClassroomStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import blockService from "../blocks/service";
import schoolService from "../../../features/schools/service";
import { BlockDTOMapper } from "../blocks/dto";
import db from "@/config/database";

export class ClassroomService implements IClassroomService {
  private repository: IClassroomRepository;
  private readonly CACHE_PREFIX = "classroom:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IClassroomRepository) {
    this.repository = repository;
  }

  /**
   * Get classroom by ID
   */
  public async getClassroomById(id: string): Promise<ClassroomDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedClassroom = await cache.get(cacheKey);

      if (cachedClassroom) {
        return JSON.parse(cachedClassroom);
      }

      // Get from database if not in cache
      const classroom = await this.repository.findClassroomById(id);
      if (!classroom) {
        throw new NotFoundError(`Classroom with ID ${id} not found`);
      }

      // Map to DTO with block
      const classroomDTO = ClassroomDTOMapper.toDetailDTO(classroom);

      // If the classroom has a block, map it to a block DTO
      if (classroom.block) {
        classroomDTO.block = BlockDTOMapper.toSimpleDTO(classroom.block);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classroomDTO), this.CACHE_TTL);

      return classroomDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassroomById service:", error);
      throw new AppError("Failed to get classroom");
    }
  }

  /**
   * Create a new classroom
   */
  public async createClassroom(
    classroomData: CreateClassroomDTO
  ): Promise<ClassroomDetailDTO> {
    try {
      // Validate data
      await this.validateClassroomData(classroomData);

      // Ensure the block and school exist
      await blockService.getBlockById(classroomData.blockId);
      await schoolService.getSchoolById(classroomData.schoolId);

      // Ensure the block belongs to the specified school
      const block = await blockService.getBlockById(classroomData.blockId);
      if (block.schoolId !== classroomData.schoolId) {
        throw new BadRequestError(
          "The specified block does not belong to the specified school"
        );
      }

      // Create the classroom
      const newClassroom = await this.repository.createClassroom(classroomData);

      // Get the complete classroom with block
      const classroom = await this.repository.findClassroomById(
        newClassroom.id
      );
      if (!classroom) {
        throw new AppError("Failed to retrieve created classroom");
      }

      // Map to DTO with block
      const classroomDTO = ClassroomDTOMapper.toDetailDTO(classroom);

      if (classroom.block) {
        classroomDTO.block = BlockDTOMapper.toSimpleDTO(classroom.block);
      }

      return classroomDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createClassroom service:", error);
      throw new AppError("Failed to create classroom");
    }
  }

  /**
   * Update a classroom
   */
  public async updateClassroom(
    id: string,
    classroomData: UpdateClassroomDTO
  ): Promise<ClassroomDetailDTO> {
    try {
      // Check if classroom exists
      const existingClassroom = await this.repository.findClassroomById(id);
      if (!existingClassroom) {
        throw new NotFoundError(`Classroom with ID ${id} not found`);
      }

      // Validate data
      await this.validateClassroomData(classroomData);

      // If updating blockId, ensure the block exists
      if (classroomData.blockId) {
        await blockService.getBlockById(classroomData.blockId);
      }

      // If updating schoolId, ensure the school exists
      if (classroomData.schoolId) {
        await schoolService.getSchoolById(classroomData.schoolId);
      }

      // If updating both blockId and schoolId, ensure they're related
      if (classroomData.blockId && classroomData.schoolId) {
        const block = await blockService.getBlockById(classroomData.blockId);
        if (block.schoolId !== classroomData.schoolId) {
          throw new BadRequestError(
            "The specified block does not belong to the specified school"
          );
        }
      }
      // If updating only blockId, ensure it belongs to the existing school
      else if (classroomData.blockId) {
        const block = await blockService.getBlockById(classroomData.blockId);
        if (block.schoolId !== existingClassroom.schoolId) {
          throw new BadRequestError(
            "The specified block does not belong to the classroom's school"
          );
        }
      }
      // If updating only schoolId, ensure the existing block belongs to the new school
      else if (classroomData.schoolId) {
        const block = await blockService.getBlockById(
          existingClassroom.blockId
        );
        if (block.schoolId !== classroomData.schoolId) {
          throw new BadRequestError(
            "The classroom's block does not belong to the specified school"
          );
        }
      }

      // Update classroom
      await this.repository.updateClassroom(id, classroomData);

      // Clear cache
      await this.clearClassroomCache(id);

      // Get the updated classroom
      return this.getClassroomById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateClassroom service:", error);
      throw new AppError("Failed to update classroom");
    }
  }

  /**
   * Delete a classroom
   */
  public async deleteClassroom(id: string): Promise<boolean> {
    try {
      // Check if classroom exists
      const existingClassroom = await this.repository.findClassroomById(id);
      if (!existingClassroom) {
        throw new NotFoundError(`Classroom with ID ${id} not found`);
      }

      // Delete the classroom
      const result = await this.repository.deleteClassroom(id);

      // Clear cache
      await this.clearClassroomCache(id);

      // Clear school and block classrooms cache
      await cache.del(
        `${this.CACHE_PREFIX}school:${existingClassroom.schoolId}`
      );
      await cache.del(`${this.CACHE_PREFIX}block:${existingClassroom.blockId}`);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteClassroom service:", error);
      throw new AppError("Failed to delete classroom");
    }
  }

  /**
   * Get paginated classroom list
   */
  public async getClassroomList(
    params: ClassroomListQueryParams
  ): Promise<PaginatedClassroomListDTO> {
    try {
      const { classrooms, total } = await this.repository.getClassroomList(
        params
      );

      // Map to DTOs with blocks
      const classroomDTOs = classrooms.map((classroom) => {
        const classroomDTO = ClassroomDTOMapper.toDetailDTO(classroom);

        if (classroom.block) {
          classroomDTO.block = BlockDTOMapper.toSimpleDTO(classroom.block);
        }

        return classroomDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        classrooms: classroomDTOs,
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
      logger.error("Error in getClassroomList service:", error);
      throw new AppError("Failed to get classroom list");
    }
  }

  /**
   * Get classrooms by school
   */
  public async getClassroomsBySchool(
    schoolId: string
  ): Promise<ClassroomDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedClassrooms = await cache.get(cacheKey);

      if (cachedClassrooms) {
        return JSON.parse(cachedClassrooms);
      }

      // Check if school exists
      await schoolService.getSchoolById(schoolId);

      const classrooms = await this.repository.findClassroomsBySchool(schoolId);

      // Map to DTOs with blocks
      const classroomDTOs = classrooms.map((classroom) => {
        const classroomDTO = ClassroomDTOMapper.toDetailDTO(classroom);

        if (classroom.block) {
          classroomDTO.block = BlockDTOMapper.toSimpleDTO(classroom.block);
        }

        return classroomDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classroomDTOs), this.CACHE_TTL);

      return classroomDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassroomsBySchool service:", error);
      throw new AppError("Failed to get classrooms by school");
    }
  }

  /**
   * Get classrooms by block
   */
  public async getClassroomsByBlock(
    blockId: string
  ): Promise<ClassroomDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}block:${blockId}`;
      const cachedClassrooms = await cache.get(cacheKey);

      if (cachedClassrooms) {
        return JSON.parse(cachedClassrooms);
      }

      // Check if block exists
      await blockService.getBlockById(blockId);

      const classrooms = await this.repository.findClassroomsByBlock(blockId);

      // Map to DTOs with blocks
      const classroomDTOs = classrooms.map((classroom) => {
        const classroomDTO = ClassroomDTOMapper.toDetailDTO(classroom);

        if (classroom.block) {
          classroomDTO.block = BlockDTOMapper.toSimpleDTO(classroom.block);
        }

        return classroomDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(classroomDTOs), this.CACHE_TTL);

      return classroomDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassroomsByBlock service:", error);
      throw new AppError("Failed to get classrooms by block");
    }
  }

  /**
   * Validate classroom data
   */
  public async validateClassroomData(
    classroomData: CreateClassroomDTO | UpdateClassroomDTO
  ): Promise<boolean> {
    // Validate max students is a positive integer
    if (
      "maxStudents" in classroomData &&
      classroomData.maxStudents !== undefined
    ) {
      if (
        classroomData.maxStudents < 1 ||
        !Number.isInteger(classroomData.maxStudents)
      ) {
        throw new BadRequestError(
          "Maximum students must be a positive integer"
        );
      }
    }

    // Validate floor is an integer if provided
    if (
      "floor" in classroomData &&
      classroomData.floor !== null &&
      classroomData.floor !== undefined
    ) {
      if (!Number.isInteger(classroomData.floor)) {
        throw new BadRequestError("Floor must be an integer");
      }
    }

    // Validate room type if provided
    if ("roomType" in classroomData && classroomData.roomType !== undefined) {
      const validRoomTypes = [
        "standard",
        "laboratory",
        "computer_lab",
        "library",
        "auditorium",
        "gymnasium",
        "art_studio",
        "music_room",
        "staff_room",
        "other",
      ];
      if (!validRoomTypes.includes(classroomData.roomType)) {
        throw new BadRequestError(
          `Room type must be one of: ${validRoomTypes.join(", ")}`
        );
      }
    }

    // Validate status if provided
    if (
      "status" in classroomData &&
      classroomData.status !== null &&
      classroomData.status !== undefined
    ) {
      const validStatuses = [
        "active",
        "inactive",
        "maintenance",
        "renovation",
        "closed",
      ];
      if (!validStatuses.includes(classroomData.status)) {
        throw new BadRequestError(
          `Status must be one of: ${validStatuses.join(", ")}`
        );
      }
    }

    return true;
  }

  /**
   * Get classroom statistics
   */
  public async getClassroomStatistics(): Promise<ClassroomStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getClassroomStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getClassroomStatistics service:", error);
      throw new AppError("Failed to get classroom statistics");
    }
  }

  /**
   * Create multiple classrooms at once
   */
  public async createClassroomsBulk(
    classroomsData: CreateClassroomDTO[]
  ): Promise<ClassroomDetailDTO[]> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate all classroom data and ensure blocks belong to the correct schools
      for (const classroomData of classroomsData) {
        await this.validateClassroomData(classroomData);

        // Check if block and school exist and are related
        const block = await blockService.getBlockById(classroomData.blockId);
        await schoolService.getSchoolById(classroomData.schoolId);

        if (block.schoolId !== classroomData.schoolId) {
          throw new BadRequestError(
            `Block ${classroomData.blockId} does not belong to school ${classroomData.schoolId}`
          );
        }
      }

      // Create classrooms in bulk
      const newClassrooms = await this.repository.createClassroomsBulk(
        classroomsData,
        transaction
      );

      await transaction.commit();

      // Get the complete classrooms with blocks
      const classroomIds = newClassrooms.map((classroom) => classroom.id);
      const detailedClassrooms: ClassroomDetailDTO[] = [];

      for (const id of classroomIds) {
        const classroom = await this.repository.findClassroomById(id);
        if (classroom) {
          const classroomDTO = ClassroomDTOMapper.toDetailDTO(classroom);

          if (classroom.block) {
            classroomDTO.block = BlockDTOMapper.toSimpleDTO(classroom.block);
          }

          detailedClassrooms.push(classroomDTO);
        }
      }

      return detailedClassrooms;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createClassroomsBulk service:", error);
      throw new AppError("Failed to create classrooms in bulk");
    }
  }

  /**
   * Delete multiple classrooms at once
   */
  public async deleteClassroomsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }> {
    const transaction = await db.sequelize.transaction();

    try {
      // Verify classrooms exist
      const classrooms = await Promise.all(
        ids.map((id) => this.repository.findClassroomById(id))
      );

      // Filter out any null results (classrooms not found)
      const existingClassrooms = classrooms.filter(
        (classroom) => classroom !== null
      );

      if (existingClassrooms.length === 0) {
        throw new NotFoundError("None of the specified classrooms were found");
      }

      // Delete classrooms
      const deletedCount = await this.repository.deleteClassroomsBulk(
        existingClassrooms.map((classroom) => classroom!.id),
        transaction
      );

      await transaction.commit();

      // Clear cache for each deleted classroom
      for (const classroom of existingClassrooms) {
        if (classroom) {
          await this.clearClassroomCache(classroom.id);

          // Clear school and block classrooms cache
          await cache.del(`${this.CACHE_PREFIX}school:${classroom.schoolId}`);
          await cache.del(`${this.CACHE_PREFIX}block:${classroom.blockId}`);
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
      logger.error("Error in deleteClassroomsBulk service:", error);
      throw new AppError("Failed to delete classrooms in bulk");
    }
  }

  /**
   * Clear classroom cache
   */
  private async clearClassroomCache(classroomId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${classroomId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new ClassroomService(repository);
