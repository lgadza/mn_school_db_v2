import { IProjectGradeRepository } from "./interfaces/services";
import {
  ProjectGradeInterface,
  ProjectGradeDeletionResult,
} from "./interfaces/interfaces";
import ProjectGrade from "./model";
import Project from "../project/model";
import Student from "../../accounts/students/model";
import User from "../../users/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import { CreateGradeDTO, UpdateGradeDTO, GradeListQueryParams } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ProjectGradeRepository implements IProjectGradeRepository {
  /**
   * Find a grade by ID
   */
  public async findGradeById(
    id: string
  ): Promise<ProjectGradeInterface | null> {
    try {
      return await ProjectGrade.findByPk(id, {
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: Student,
            as: "student",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
          },
          {
            model: User,
            as: "grader",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding grade by ID:", error);
      throw new DatabaseError("Database error while finding grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId: id },
      });
    }
  }

  /**
   * Find grades by project ID
   */
  public async findGradesByProjectId(
    projectId: string
  ): Promise<ProjectGradeInterface[]> {
    try {
      return await ProjectGrade.findAll({
        where: { projectId },
        include: [
          {
            model: Student,
            as: "student",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
          },
          {
            model: User,
            as: "grader",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["gradedDate", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding grades by project ID:", error);
      throw new DatabaseError("Database error while finding project grades", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId },
      });
    }
  }

  /**
   * Find grades by student ID
   */
  public async findGradesByStudentId(
    studentId: string
  ): Promise<ProjectGradeInterface[]> {
    try {
      return await ProjectGrade.findAll({
        where: { studentId },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: User,
            as: "grader",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["gradedDate", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding grades by student ID:", error);
      throw new DatabaseError("Database error while finding student grades", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, studentId },
      });
    }
  }

  /**
   * Find grade by project and student
   */
  public async findGradeByProjectAndStudent(
    projectId: string,
    studentId: string
  ): Promise<ProjectGradeInterface | null> {
    try {
      return await ProjectGrade.findOne({
        where: { projectId, studentId },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: Student,
            as: "student",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
          },
          {
            model: User,
            as: "grader",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding grade by project and student:", error);
      throw new DatabaseError(
        "Database error while finding grade by project and student",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            projectId,
            studentId,
          },
        }
      );
    }
  }

  /**
   * Create a new grade
   */
  public async createGrade(
    gradeData: CreateGradeDTO,
    transaction?: Transaction
  ): Promise<ProjectGradeInterface> {
    try {
      return await ProjectGrade.create(gradeData as any, { transaction });
    } catch (error) {
      logger.error("Error creating grade:", error);
      throw new DatabaseError("Database error while creating grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a grade
   */
  public async updateGrade(
    id: string,
    gradeData: UpdateGradeDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await ProjectGrade.update(gradeData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating grade:", error);
      throw new DatabaseError("Database error while updating grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId: id },
      });
    }
  }

  /**
   * Delete a grade
   */
  public async deleteGrade(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await ProjectGrade.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting grade:", error);
      throw new DatabaseError("Database error while deleting grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId: id },
      });
    }
  }

  /**
   * Bulk delete grades for a project
   */
  public async bulkDeleteGrades(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectGradeDeletionResult> {
    try {
      const count = await ProjectGrade.destroy({
        where: { projectId },
        transaction,
      });

      return {
        success: count > 0,
        count,
        message: count > 0 ? `Deleted ${count} grades` : "No grades deleted",
      };
    } catch (error) {
      logger.error("Error bulk deleting grades:", error);
      throw new DatabaseError(
        "Database error while bulk deleting project grades",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId },
        }
      );
    }
  }

  /**
   * Get paginated grade list
   */
  public async getGradeList(params: GradeListQueryParams): Promise<{
    grades: ProjectGradeInterface[];
    total: number;
  }> {
    try {
      const {
        projectId,
        studentId,
        graderId,
        status,
        page = 1,
        limit = 20,
        sortBy = "gradedDate",
        sortOrder = "desc",
        minScore,
        maxScore,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      if (projectId) {
        where.projectId = projectId;
      }

      if (studentId) {
        where.studentId = studentId;
      }

      if (graderId) {
        where.graderId = graderId;
      }

      if (status) {
        where.status = status;
      }

      // Add score filters if provided
      if (minScore !== undefined) {
        where.score = { ...where.score, [Op.gte]: minScore };
      }

      if (maxScore !== undefined) {
        where.score = { ...where.score, [Op.lte]: maxScore };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get grades and total count
      const { count, rows } = await ProjectGrade.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: Student,
            as: "student",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ],
          },
          {
            model: User,
            as: "grader",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });

      return {
        grades: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting grade list:", error);
      throw new DatabaseError(
        "Database error while getting project grade list",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
        }
      );
    }
  }
}

// Create and export repository instance
export default new ProjectGradeRepository();
