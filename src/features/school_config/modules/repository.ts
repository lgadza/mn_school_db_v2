import { IModuleRepository } from "./interfaces/services";
import { ModuleInterface, ModuleDeletionResult } from "./interfaces/interfaces";
import Module from "./model";
import Subject from "../subjects/model";
import Class from "../classes/model";
import Teacher from "../../teachers/model";
import School from "../../schools/model";
import Classroom from "../classrooms/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  CreateModuleDTO,
  UpdateModuleDTO,
  ModuleListQueryParams,
  BulkCreateModuleDTO,
  BulkDeleteModuleDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ModuleRepository implements IModuleRepository {
  /**
   * Find a module by ID
   */
  public async findModuleById(id: string): Promise<ModuleInterface | null> {
    try {
      return await Module.findByPk(id, {
        include: [
          {
            model: Subject,
            as: "subject",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: Teacher,
            as: "teacher",
          },
          {
            model: Teacher,
            as: "assistantTeacher",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Classroom,
            as: "classroom",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding module by ID:", error);
      throw new DatabaseError("Database error while finding module", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, moduleId: id },
      });
    }
  }

  /**
   * Find modules by class ID
   */
  public async findModulesByClassId(
    classId: string
  ): Promise<ModuleInterface[]> {
    try {
      return await Module.findAll({
        where: { classId },
        include: [
          {
            model: Subject,
            as: "subject",
          },
          {
            model: Teacher,
            as: "teacher",
          },
          {
            model: Teacher,
            as: "assistantTeacher",
          },
          {
            model: Classroom,
            as: "classroom",
          },
        ],
        order: [["name", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding modules by class ID:", error);
      throw new DatabaseError("Database error while finding modules by class", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId },
      });
    }
  }

  /**
   * Find modules by subject ID
   */
  public async findModulesBySubjectId(
    subjectId: string
  ): Promise<ModuleInterface[]> {
    try {
      return await Module.findAll({
        where: { subjectId },
        include: [
          {
            model: Class,
            as: "class",
          },
          {
            model: Teacher,
            as: "teacher",
          },
          {
            model: Teacher,
            as: "assistantTeacher",
          },
          {
            model: Classroom,
            as: "classroom",
          },
        ],
        order: [["name", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding modules by subject ID:", error);
      throw new DatabaseError(
        "Database error while finding modules by subject",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, subjectId },
        }
      );
    }
  }

  /**
   * Find modules by teacher ID
   */
  public async findModulesByTeacherId(
    teacherId: string
  ): Promise<ModuleInterface[]> {
    try {
      return await Module.findAll({
        where: {
          [Op.or]: [{ teacherId }, { assistantTeacherId: teacherId }],
        },
        include: [
          {
            model: Subject,
            as: "subject",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: Classroom,
            as: "classroom",
          },
        ],
        order: [["name", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding modules by teacher ID:", error);
      throw new DatabaseError(
        "Database error while finding modules by teacher",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId },
        }
      );
    }
  }

  /**
   * Find modules by school ID
   */
  public async findModulesBySchoolId(
    schoolId: string
  ): Promise<ModuleInterface[]> {
    try {
      return await Module.findAll({
        where: { schoolId },
        include: [
          {
            model: Subject,
            as: "subject",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: Teacher,
            as: "teacher",
          },
        ],
        order: [["name", "ASC"]],
      });
    } catch (error) {
      logger.error("Error finding modules by school ID:", error);
      throw new DatabaseError(
        "Database error while finding modules by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Create a new module
   */
  public async createModule(
    moduleData: CreateModuleDTO,
    transaction?: Transaction
  ): Promise<ModuleInterface> {
    try {
      return await Module.create(moduleData as any, { transaction });
    } catch (error) {
      logger.error("Error creating module:", error);
      throw new DatabaseError("Database error while creating module", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Bulk create modules
   */
  public async bulkCreateModules(
    modulesData: BulkCreateModuleDTO[],
    transaction?: Transaction
  ): Promise<ModuleInterface[]> {
    try {
      return await Module.bulkCreate(modulesData as any, {
        transaction,
        validate: true,
      });
    } catch (error) {
      logger.error("Error bulk creating modules:", error);
      throw new DatabaseError("Database error while bulk creating modules", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a module
   */
  public async updateModule(
    id: string,
    moduleData: UpdateModuleDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Module.update(moduleData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating module:", error);
      throw new DatabaseError("Database error while updating module", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, moduleId: id },
      });
    }
  }

  /**
   * Delete a module
   */
  public async deleteModule(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Module.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting module:", error);
      throw new DatabaseError("Database error while deleting module", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, moduleId: id },
      });
    }
  }

  /**
   * Bulk delete modules
   */
  public async bulkDeleteModules(
    criteria: BulkDeleteModuleDTO,
    transaction?: Transaction
  ): Promise<ModuleDeletionResult> {
    try {
      const whereClause: WhereOptions<any> = {};

      if (criteria.ids && criteria.ids.length > 0) {
        whereClause.id = { [Op.in]: criteria.ids };
      }
      if (criteria.classId) {
        whereClause.classId = criteria.classId;
      }
      if (criteria.subjectId) {
        whereClause.subjectId = criteria.subjectId;
      }
      if (criteria.teacherId) {
        whereClause.teacherId = criteria.teacherId;
      }
      if (criteria.schoolId) {
        whereClause.schoolId = criteria.schoolId;
      }
      if (criteria.termId) {
        whereClause.termId = criteria.termId;
      }

      // Ensure at least one criteria is provided
      if (Object.keys(whereClause).length === 0) {
        return {
          success: false,
          count: 0,
          message: "No deletion criteria specified",
        };
      }

      const count = await Module.destroy({
        where: whereClause,
        transaction,
      });

      return {
        success: count > 0,
        count,
        message: count > 0 ? `Deleted ${count} modules` : "No modules deleted",
      };
    } catch (error) {
      logger.error("Error bulk deleting modules:", error);
      throw new DatabaseError("Database error while bulk deleting modules", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, criteria },
      });
    }
  }

  /**
   * Get module list with filtering and pagination
   */
  public async getModuleList(params: ModuleListQueryParams): Promise<{
    modules: ModuleInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        classId,
        subjectId,
        teacherId,
        assistantTeacherId,
        schoolId,
        classroomId,
        termId,
        classType,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (classId) {
        where.classId = classId;
      }
      if (subjectId) {
        where.subjectId = subjectId;
      }
      if (teacherId) {
        where.teacherId = teacherId;
      }
      if (assistantTeacherId) {
        where.assistantTeacherId = assistantTeacherId;
      }
      if (schoolId) {
        where.schoolId = schoolId;
      }
      if (classroomId) {
        where.classroomId = classroomId;
      }
      if (termId) {
        where.termId = termId;
      }
      if (classType) {
        where.classType = classType;
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
            { materials: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get modules and total count
      const { count, rows } = await Module.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Subject,
            as: "subject",
          },
          {
            model: Class,
            as: "class",
          },
          {
            model: Teacher,
            as: "teacher",
          },
          {
            model: Teacher,
            as: "assistantTeacher",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Classroom,
            as: "classroom",
          },
        ],
      });

      return {
        modules: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting module list:", error);
      throw new DatabaseError("Database error while getting module list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Check if a module name exists for a class
   */
  public async isModuleNameTakenInClass(
    name: string,
    classId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const whereClause: any = { name, classId };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Module.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if module name is taken:", error);
      throw new DatabaseError(
        "Database error while checking module name availability",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            name,
            classId,
          },
        }
      );
    }
  }
}

// Create and export repository instance
export default new ModuleRepository();
