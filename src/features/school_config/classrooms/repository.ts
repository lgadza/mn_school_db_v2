import { IClassroomRepository } from "./interfaces/services";
import {
  ClassroomInterface,
  ClassroomStatistics,
} from "./interfaces/interfaces";
import Classroom from "./model";
import Block from "../blocks/model";
import {
  Transaction,
  Op,
  WhereOptions,
  Sequelize,
  QueryTypes,
  fn,
  col,
  literal,
} from "sequelize";
import {
  ClassroomListQueryParams,
  CreateClassroomDTO,
  UpdateClassroomDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ClassroomRepository implements IClassroomRepository {
  /**
   * Find a classroom by ID
   */
  public async findClassroomById(
    id: string
  ): Promise<ClassroomInterface | null> {
    try {
      return await Classroom.findByPk(id, {
        include: [
          {
            model: Block,
            as: "block",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding classroom by ID:", error);
      throw new DatabaseError("Database error while finding classroom", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classroomId: id },
      });
    }
  }

  /**
   * Create a new classroom
   */
  public async createClassroom(
    classroomData: CreateClassroomDTO,
    transaction?: Transaction
  ): Promise<ClassroomInterface> {
    try {
      return await Classroom.create(classroomData as any, { transaction });
    } catch (error) {
      logger.error("Error creating classroom:", error);
      throw new DatabaseError("Database error while creating classroom", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a classroom
   */
  public async updateClassroom(
    id: string,
    classroomData: UpdateClassroomDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Classroom.update(classroomData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating classroom:", error);
      throw new DatabaseError("Database error while updating classroom", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classroomId: id },
      });
    }
  }

  /**
   * Delete a classroom
   */
  public async deleteClassroom(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Classroom.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting classroom:", error);
      throw new DatabaseError("Database error while deleting classroom", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classroomId: id },
      });
    }
  }

  /**
   * Get classroom list with filtering and pagination
   */
  public async getClassroomList(params: ClassroomListQueryParams): Promise<{
    classrooms: ClassroomInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        schoolId,
        blockId,
        roomType,
        status,
        minCapacity,
        maxCapacity,
        floor,
        feature,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (blockId) {
        where.blockId = blockId;
      }

      if (roomType) {
        where.roomType = roomType;
      }

      if (status) {
        where.status = status;
      }

      // Capacity range
      if (minCapacity !== undefined || maxCapacity !== undefined) {
        where.maxStudents = {};
        if (minCapacity !== undefined) {
          where.maxStudents[Op.gte] = minCapacity;
        }
        if (maxCapacity !== undefined) {
          where.maxStudents[Op.lte] = maxCapacity;
        }
      }

      // Filter by floor
      if (floor !== undefined) {
        where.floor = floor;
      }

      // Filter by feature
      if (feature) {
        where.features = {
          [Op.contains]: [feature],
        };
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { details: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get classrooms and total count
      const { count, rows } = await Classroom.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Block,
            as: "block",
          },
        ],
      });

      return {
        classrooms: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting classroom list:", error);
      throw new DatabaseError("Database error while getting classroom list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find classrooms by school ID
   */
  public async findClassroomsBySchool(
    schoolId: string
  ): Promise<ClassroomInterface[]> {
    try {
      return await Classroom.findAll({
        where: { schoolId },
        include: [
          {
            model: Block,
            as: "block",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding classrooms by school:", error);
      throw new DatabaseError(
        "Database error while finding classrooms by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find classrooms by block ID
   */
  public async findClassroomsByBlock(
    blockId: string
  ): Promise<ClassroomInterface[]> {
    try {
      return await Classroom.findAll({
        where: { blockId },
        include: [
          {
            model: Block,
            as: "block",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding classrooms by block:", error);
      throw new DatabaseError(
        "Database error while finding classrooms by block",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, blockId },
        }
      );
    }
  }

  /**
   * Get classroom statistics
   */
  public async getClassroomStatistics(): Promise<ClassroomStatistics> {
    try {
      // Get total classrooms count
      const totalClassrooms = await Classroom.count();

      // Get classrooms per school
      const classroomsPerSchoolResult = await Classroom.findAll({
        attributes: ["schoolId", [fn("COUNT", col("id")), "count"]],
        group: ["schoolId"],
        raw: true,
      });

      const classroomsPerSchool: { [schoolId: string]: number } = {};
      classroomsPerSchoolResult.forEach((result: any) => {
        classroomsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get classrooms per block
      const classroomsPerBlockResult = await Classroom.findAll({
        attributes: ["blockId", [fn("COUNT", col("id")), "count"]],
        group: ["blockId"],
        raw: true,
      });

      const classroomsPerBlock: { [blockId: string]: number } = {};
      classroomsPerBlockResult.forEach((result: any) => {
        classroomsPerBlock[result.blockId] = parseInt(result.count, 10);
      });

      // Get total and average capacity
      const totalCapacityResult = await Classroom.sum("maxStudents");
      const totalCapacity = totalCapacityResult || 0;
      const averageCapacity =
        totalClassrooms > 0 ? totalCapacity / totalClassrooms : 0;

      // Get classrooms by type
      const classroomsByTypeResult = await Classroom.findAll({
        attributes: ["roomType", [fn("COUNT", col("id")), "count"]],
        group: ["roomType"],
        raw: true,
      });

      const classroomsByType: { [roomType: string]: number } = {};
      classroomsByTypeResult.forEach((result: any) => {
        classroomsByType[result.roomType] = parseInt(result.count, 10);
      });

      // Get classrooms by status
      const classroomsByStatusResult = await Classroom.findAll({
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        where: {
          status: {
            [Op.ne]: null,
          },
        },
        group: ["status"],
        raw: true,
      });

      const classroomsByStatus: { [status: string]: number } = {};
      classroomsByStatusResult.forEach((result: any) => {
        if (result.status) {
          classroomsByStatus[result.status] = parseInt(result.count, 10);
        }
      });

      // Get features distribution
      // This is more complex as features is an array
      // We need a subquery to unnest the array
      const featuresDistributionResult = await Classroom.sequelize?.query(
        `
        SELECT feature, COUNT(*) as count
        FROM (
          SELECT unnest(features) as feature
          FROM classrooms
          WHERE features IS NOT NULL
        ) as features_unnested
        GROUP BY feature
        ORDER BY count DESC
      `,
        { type: QueryTypes.SELECT }
      );

      const featuresDistribution: { [feature: string]: number } = {};
      if (featuresDistributionResult) {
        featuresDistributionResult.forEach((result: any) => {
          featuresDistribution[result.feature] = parseInt(result.count, 10);
        });
      }

      return {
        totalClassrooms,
        classroomsPerSchool,
        classroomsPerBlock,
        totalCapacity,
        averageCapacity,
        classroomsByType,
        classroomsByStatus,
        featuresDistribution,
      };
    } catch (error) {
      logger.error("Error getting classroom statistics:", error);
      throw new DatabaseError(
        "Database error while getting classroom statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple classrooms at once
   */
  public async createClassroomsBulk(
    classroomsData: CreateClassroomDTO[],
    transaction?: Transaction
  ): Promise<ClassroomInterface[]> {
    try {
      return await Classroom.bulkCreate(classroomsData as any, {
        transaction,
      });
    } catch (error) {
      logger.error("Error bulk creating classrooms:", error);
      throw new DatabaseError("Database error while bulk creating classrooms", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple classrooms at once
   */
  public async deleteClassroomsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Classroom.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting classrooms:", error);
      throw new DatabaseError("Database error while bulk deleting classrooms", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          classroomIds: ids,
        },
      });
    }
  }
}

// Create and export repository instance
export default new ClassroomRepository();
