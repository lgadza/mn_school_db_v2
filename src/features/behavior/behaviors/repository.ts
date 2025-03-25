import { IBehaviorRepository } from "./interfaces/services";
import { BehaviorInterface, BehaviorStatistics } from "./interfaces/interfaces";
import Behavior from "./model";
import School from "../../schools/model";
import BehaviorType from "../behavior_types/model";
import Class from "../../school_config/classes/model";
import User from "../../users/model";
import {
  Transaction,
  Op,
  WhereOptions,
  Sequelize,
  QueryTypes,
} from "sequelize";
import {
  BehaviorListQueryParams,
  CreateBehaviorDTO,
  UpdateBehaviorDTO,
} from "./dto";
import sequelize from "../../../config/sequelize";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BehaviorRepository implements IBehaviorRepository {
  /**
   * Find a behavior by ID
   */
  public async findBehaviorById(id: string): Promise<BehaviorInterface | null> {
    try {
      return await Behavior.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: BehaviorType,
            as: "behaviorType",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: User,
            as: "staff",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behavior by ID:", error);
      throw new DatabaseError("Database error while finding behavior", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorId: id },
      });
    }
  }

  /**
   * Create a new behavior
   */
  public async createBehavior(
    behaviorData: CreateBehaviorDTO,
    transaction?: Transaction
  ): Promise<BehaviorInterface> {
    try {
      return await Behavior.create(behaviorData as any, { transaction });
    } catch (error) {
      logger.error("Error creating behavior:", error);
      throw new DatabaseError("Database error while creating behavior", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a behavior
   */
  public async updateBehavior(
    id: string,
    behaviorData: UpdateBehaviorDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Behavior.update(behaviorData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating behavior:", error);
      throw new DatabaseError("Database error while updating behavior", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorId: id },
      });
    }
  }

  /**
   * Delete a behavior
   */
  public async deleteBehavior(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Behavior.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting behavior:", error);
      throw new DatabaseError("Database error while deleting behavior", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorId: id },
      });
    }
  }

  /**
   * Get behavior list with filtering and pagination
   */
  public async getBehaviorList(params: BehaviorListQueryParams): Promise<{
    behaviors: BehaviorInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "dateOfIncident",
        sortOrder = "desc",
        schoolId,
        classId,
        studentId,
        behaviorTypeId,
        staffId,
        startDate,
        endDate,
        resolutionStatus,
        priority,
        category,
      } = params;

      // Build where clause
      let where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (classId) {
        where.classId = classId;
      }

      if (studentId) {
        where.studentId = studentId;
      }

      if (behaviorTypeId) {
        where.behaviorTypeId = behaviorTypeId;
      }

      if (staffId) {
        where.staffId = staffId;
      }

      // Date range
      if (startDate || endDate) {
        where.dateOfIncident = {};
        if (startDate) {
          where.dateOfIncident[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.dateOfIncident[Op.lte] = new Date(endDate);
        }
      }

      if (resolutionStatus) {
        where.resolutionStatus = resolutionStatus;
      }

      if (priority) {
        where.priority = priority;
      }

      // Filter by behavior type category
      const includeModels = [
        {
          model: School,
          as: "school",
        },
        {
          model: BehaviorType,
          as: "behaviorType",
          ...(category ? { where: { category } } : {}),
        },
        {
          model: Class,
          as: "class",
        },
        {
          model: User,
          as: "staff",
        },
      ];

      // Search across multiple fields
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            { studentName: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
            { actionTaken: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get behaviors and total count
      const { count, rows } = await Behavior.findAndCountAll({
        where,
        include: includeModels,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      return {
        behaviors: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting behavior list:", error);
      throw new DatabaseError("Database error while getting behavior list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find behaviors by school ID
   */
  public async findBehaviorsBySchool(
    schoolId: string
  ): Promise<BehaviorInterface[]> {
    try {
      return await Behavior.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: BehaviorType,
            as: "behaviorType",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: User,
            as: "staff",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behaviors by school:", error);
      throw new DatabaseError(
        "Database error while finding behaviors by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find behaviors by student ID
   */
  public async findBehaviorsByStudent(
    studentId: string
  ): Promise<BehaviorInterface[]> {
    try {
      return await Behavior.findAll({
        where: { studentId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: BehaviorType,
            as: "behaviorType",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: User,
            as: "staff",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behaviors by student:", error);
      throw new DatabaseError(
        "Database error while finding behaviors by student",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, studentId },
        }
      );
    }
  }

  /**
   * Find behaviors by class ID
   */
  public async findBehaviorsByClass(
    classId: string
  ): Promise<BehaviorInterface[]> {
    try {
      return await Behavior.findAll({
        where: { classId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: BehaviorType,
            as: "behaviorType",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: User,
            as: "staff",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behaviors by class:", error);
      throw new DatabaseError(
        "Database error while finding behaviors by class",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId },
        }
      );
    }
  }

  /**
   * Find behaviors by behavior type ID
   */
  public async findBehaviorsByBehaviorType(
    behaviorTypeId: string
  ): Promise<BehaviorInterface[]> {
    try {
      return await Behavior.findAll({
        where: { behaviorTypeId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: BehaviorType,
            as: "behaviorType",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: User,
            as: "staff",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding behaviors by behavior type:", error);
      throw new DatabaseError(
        "Database error while finding behaviors by behavior type",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, behaviorTypeId },
        }
      );
    }
  }

  /**
   * Get behavior statistics
   */
  public async getBehaviorStatistics(): Promise<BehaviorStatistics> {
    try {
      // Get total behaviors count
      const totalBehaviors = await Behavior.count();

      // Get behaviors per school
      const behaviorsPerSchoolResult = await Behavior.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const behaviorsPerSchool: { [schoolId: string]: number } = {};
      behaviorsPerSchoolResult.forEach((result: any) => {
        behaviorsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      const behaviorsByCategoryQuery = `
        SELECT bt.category, COUNT(b.id) as count
        FROM behaviors b
        JOIN behavior_types bt ON b."behaviorTypeId" = bt.id
        GROUP BY bt.category
      `;

      const behaviorsByCategoryResult = await sequelize.query(
        behaviorsByCategoryQuery,
        {
          type: QueryTypes.SELECT,
        }
      );

      const behaviorsPerCategory: { POSITIVE: number; NEGATIVE: number } = {
        POSITIVE: 0,
        NEGATIVE: 0,
      };

      behaviorsByCategoryResult.forEach((result: any) => {
        behaviorsPerCategory[result.category as "POSITIVE" | "NEGATIVE"] =
          parseInt(result.count, 10);
      });

      // Get behaviors per student
      const behaviorsPerStudentResult = await Behavior.findAll({
        attributes: [
          "studentId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["studentId"],
        raw: true,
      });

      const behaviorsPerStudent: { [studentId: string]: number } = {};
      behaviorsPerStudentResult.forEach((result: any) => {
        behaviorsPerStudent[result.studentId] = parseInt(result.count, 10);
      });

      // Get behaviors per class
      const behaviorsPerClassResult = await Behavior.findAll({
        attributes: [
          "classId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["classId"],
        raw: true,
      });

      const behaviorsPerClass: { [classId: string]: number } = {};
      behaviorsPerClassResult.forEach((result: any) => {
        behaviorsPerClass[result.classId] = parseInt(result.count, 10);
      });

      const behaviorsPerMonthQuery = `
        SELECT TO_CHAR(DATE_TRUNC('month', "dateOfIncident"), 'YYYY-MM') as month,
               COUNT(id) as count
        FROM behaviors
        GROUP BY DATE_TRUNC('month', "dateOfIncident")
      `;

      const behaviorsPerMonthResult = await sequelize.query(
        behaviorsPerMonthQuery,
        {
          type: QueryTypes.SELECT,
        }
      );

      const behaviorsPerMonth: { [month: string]: number } = {};
      behaviorsPerMonthResult.forEach((result: any) => {
        behaviorsPerMonth[result.month] = parseInt(result.count, 10);
      });

      // Get behaviors per priority
      const behaviorsPerPriorityResult = await Behavior.findAll({
        attributes: [
          "priority",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["priority"],
        raw: true,
      });

      const behaviorsPerPriority: {
        High: number;
        Medium: number;
        Low: number;
      } = {
        High: 0,
        Medium: 0,
        Low: 0,
      };

      behaviorsPerPriorityResult.forEach((result: any) => {
        behaviorsPerPriority[result.priority as "High" | "Medium" | "Low"] =
          parseInt(result.count, 10);
      });

      // Get behaviors per resolution status
      const behaviorsPerStatusResult = await Behavior.findAll({
        attributes: [
          "resolutionStatus",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["resolutionStatus"],
        raw: true,
      });

      const behaviorsPerResolutionStatus: {
        Pending: number;
        Resolved: number;
        Dismissed: number;
        "Under Investigation": number;
      } = {
        Pending: 0,
        Resolved: 0,
        Dismissed: 0,
        "Under Investigation": 0,
      };

      behaviorsPerStatusResult.forEach((result: any) => {
        behaviorsPerResolutionStatus[
          result.resolutionStatus as
            | "Pending"
            | "Resolved"
            | "Dismissed"
            | "Under Investigation"
        ] = parseInt(result.count, 10);
      });

      return {
        totalBehaviors,
        behaviorsPerSchool,
        behaviorsPerCategory,
        behaviorsPerStudent,
        behaviorsPerClass,
        behaviorsPerMonth,
        behaviorsPerPriority,
        behaviorsPerResolutionStatus,
      };
    } catch (error) {
      logger.error("Error getting behavior statistics:", error);
      throw new DatabaseError(
        "Database error while getting behavior statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple behaviors at once
   */
  public async createBehaviorsBulk(
    behaviorsData: CreateBehaviorDTO[],
    transaction?: Transaction
  ): Promise<BehaviorInterface[]> {
    try {
      // Create all behaviors
      const createdBehaviors = await Behavior.bulkCreate(behaviorsData as any, {
        transaction,
      });

      // Return the created behaviors
      return createdBehaviors;
    } catch (error) {
      logger.error("Error bulk creating behaviors:", error);
      throw new DatabaseError("Database error while bulk creating behaviors", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple behaviors at once
   */
  public async deleteBehaviorsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Behavior.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting behaviors:", error);
      throw new DatabaseError("Database error while bulk deleting behaviors", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          behaviorIds: ids,
        },
      });
    }
  }
}

// Create and export repository instance
export default new BehaviorRepository();
