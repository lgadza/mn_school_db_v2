import { ISubjectRepository } from "./interfaces/services";
import { SubjectInterface, SubjectStatistics } from "./interfaces/interfaces";
import Subject from "./model";
import School from "../../schools/model";
import Category from "../categories/model";
import Department from "../departments/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  SubjectListQueryParams,
  CreateSubjectDTO,
  UpdateSubjectDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SubjectRepository implements ISubjectRepository {
  /**
   * Find a subject by ID
   */
  public async findSubjectById(id: string): Promise<SubjectInterface | null> {
    try {
      return await Subject.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Department,
            as: "department",
          },
          {
            model: Subject,
            as: "prerequisiteSubject",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding subject by ID:", error);
      throw new DatabaseError("Database error while finding subject", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, subjectId: id },
      });
    }
  }

  /**
   * Create a new subject
   */
  public async createSubject(
    subjectData: CreateSubjectDTO,
    transaction?: Transaction
  ): Promise<SubjectInterface> {
    try {
      return await Subject.create(subjectData as any, { transaction });
    } catch (error) {
      logger.error("Error creating subject:", error);
      throw new DatabaseError("Database error while creating subject", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a subject
   */
  public async updateSubject(
    id: string,
    subjectData: UpdateSubjectDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Subject.update(subjectData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating subject:", error);
      throw new DatabaseError("Database error while updating subject", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, subjectId: id },
      });
    }
  }

  /**
   * Delete a subject
   */
  public async deleteSubject(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Subject.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting subject:", error);
      throw new DatabaseError("Database error while deleting subject", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, subjectId: id },
      });
    }
  }

  /**
   * Get subject list with filtering and pagination
   */
  public async getSubjectList(params: SubjectListQueryParams): Promise<{
    subjects: SubjectInterface[];
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
        categoryId,
        departmentId,
        level,
        compulsory,
        hasPrerequisite,
        isDefault,
        minCredits,
        maxCredits,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (level) {
        where.level = level;
      }

      if (compulsory !== undefined) {
        where.compulsory = compulsory;
      }

      if (isDefault !== undefined) {
        where.isDefault = isDefault;
      }

      if (hasPrerequisite !== undefined) {
        if (hasPrerequisite) {
          where.prerequisite = {
            [Op.ne]: null,
          };
        } else {
          where.prerequisite = null;
        }
      }

      // Credits range
      if (minCredits !== undefined || maxCredits !== undefined) {
        where.credits = {};
        if (minCredits !== undefined) {
          where.credits[Op.gte] = minCredits;
        }
        if (maxCredits !== undefined) {
          where.credits[Op.lte] = maxCredits;
        }
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { code: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get subjects and total count
      const { count, rows } = await Subject.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Department,
            as: "department",
          },
          {
            model: Subject,
            as: "prerequisiteSubject",
          },
        ],
      });

      return {
        subjects: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting subject list:", error);
      throw new DatabaseError("Database error while getting subject list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find subjects by school ID
   */
  public async findSubjectsBySchool(
    schoolId: string
  ): Promise<SubjectInterface[]> {
    try {
      return await Subject.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Department,
            as: "department",
          },
          {
            model: Subject,
            as: "prerequisiteSubject",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding subjects by school:", error);
      throw new DatabaseError(
        "Database error while finding subjects by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find subjects by category ID
   */
  public async findSubjectsByCategory(
    categoryId: string
  ): Promise<SubjectInterface[]> {
    try {
      return await Subject.findAll({
        where: { categoryId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Department,
            as: "department",
          },
          {
            model: Subject,
            as: "prerequisiteSubject",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding subjects by category:", error);
      throw new DatabaseError(
        "Database error while finding subjects by category",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, categoryId },
        }
      );
    }
  }

  /**
   * Find subjects by department ID
   */
  public async findSubjectsByDepartment(
    departmentId: string
  ): Promise<SubjectInterface[]> {
    try {
      return await Subject.findAll({
        where: { departmentId },
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Department,
            as: "department",
          },
          {
            model: Subject,
            as: "prerequisiteSubject",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding subjects by department:", error);
      throw new DatabaseError(
        "Database error while finding subjects by department",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, departmentId },
        }
      );
    }
  }

  /**
   * Find subject by code
   */
  public async findSubjectByCode(
    code: string,
    schoolId?: string
  ): Promise<SubjectInterface | null> {
    try {
      const whereClause: any = { code };
      if (schoolId) {
        whereClause.schoolId = schoolId;
      }

      return await Subject.findOne({
        where: whereClause,
        include: [
          {
            model: School,
            as: "school",
          },
          {
            model: Category,
            as: "category",
          },
          {
            model: Department,
            as: "department",
          },
          {
            model: Subject,
            as: "prerequisiteSubject",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding subject by code:", error);
      throw new DatabaseError("Database error while finding subject by code", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          subjectCode: code,
          schoolId,
        },
      });
    }
  }

  /**
   * Get subject statistics
   */
  public async getSubjectStatistics(): Promise<SubjectStatistics> {
    try {
      // Get total subjects count
      const totalSubjects = await Subject.count();

      // Get subjects per school
      const subjectsPerSchoolResult = await Subject.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const subjectsPerSchool: { [schoolId: string]: number } = {};
      subjectsPerSchoolResult.forEach((result: any) => {
        subjectsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get subjects per category
      const subjectsPerCategoryResult = await Subject.findAll({
        attributes: [
          "categoryId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          categoryId: {
            [Op.ne]: null,
          },
        },
        group: ["categoryId"],
        raw: true,
      });

      const subjectsPerCategory: { [categoryId: string]: number } = {};
      subjectsPerCategoryResult.forEach((result: any) => {
        if (result.categoryId) {
          subjectsPerCategory[result.categoryId] = parseInt(result.count, 10);
        }
      });

      // Get subjects per department
      const subjectsPerDepartmentResult = await Subject.findAll({
        attributes: [
          "departmentId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          departmentId: {
            [Op.ne]: null,
          },
        },
        group: ["departmentId"],
        raw: true,
      });

      const subjectsPerDepartment: { [departmentId: string]: number } = {};
      subjectsPerDepartmentResult.forEach((result: any) => {
        if (result.departmentId) {
          subjectsPerDepartment[result.departmentId] = parseInt(
            result.count,
            10
          );
        }
      });

      // Get subjects by level
      const subjectsByLevelResult = await Subject.findAll({
        attributes: [
          "level",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["level"],
        raw: true,
      });

      const subjectsByLevel: { [level: string]: number } = {};
      subjectsByLevelResult.forEach((result: any) => {
        subjectsByLevel[result.level] = parseInt(result.count, 10);
      });

      // Get compulsory subjects count
      const compulsorySubjectsCount = await Subject.count({
        where: {
          compulsory: true,
        },
      });

      // Get average credits
      const creditsResult = (await Subject.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("credits")), "avgCredits"],
        ],
        where: {
          credits: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { avgCredits: string | null };

      return {
        totalSubjects,
        subjectsPerSchool,
        subjectsPerCategory,
        subjectsPerDepartment,
        subjectsByLevel,
        compulsorySubjectsCount,
        averageCredits:
          creditsResult && creditsResult.avgCredits
            ? parseFloat(creditsResult.avgCredits) || 0
            : 0,
      };
    } catch (error) {
      logger.error("Error getting subject statistics:", error);
      throw new DatabaseError(
        "Database error while getting subject statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple subjects at once
   */
  public async createSubjectsBulk(
    subjectsData: CreateSubjectDTO[],
    transaction?: Transaction
  ): Promise<SubjectInterface[]> {
    try {
      // Create all subjects
      const createdSubjects = await Subject.bulkCreate(subjectsData as any, {
        transaction,
      });

      // Return the created subjects
      return createdSubjects;
    } catch (error) {
      logger.error("Error bulk creating subjects:", error);
      throw new DatabaseError("Database error while bulk creating subjects", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple subjects at once
   */
  public async deleteSubjectsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Subject.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting subjects:", error);
      throw new DatabaseError("Database error while bulk deleting subjects", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          subjectIds: ids,
        },
      });
    }
  }
}

// Create and export repository instance
export default new SubjectRepository();
