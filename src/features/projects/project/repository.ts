import { IProjectRepository } from "./interfaces/services";
import {
  ProjectInterface,
  ProjectDeletionResult,
} from "./interfaces/interfaces";
import Project from "./model";
import Subject from "../../school_config/subjects/model";
import Class from "../../school_config/classes/model";
import Teacher from "../../teachers/model";
import School from "../../schools/model";
import User from "../../users/model";
import { Transaction, Op, WhereOptions, Includeable } from "sequelize";
import {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectListQueryParams,
  BulkCreateProjectDTO,
  BulkDeleteProjectDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import ProjectFile from "../files/model";
import ProjectGrade from "../grades/model";
import ProjectFeedback from "../feedback/model";

export class ProjectRepository implements IProjectRepository {
  // Common include options for associations
  private readonly includeOptions: Includeable[] = [
    {
      model: Subject,
      as: "subject",
      attributes: ["id", "name", "code"],
    },
    {
      model: Class,
      as: "class",
      attributes: ["id", "name"],
    },
    {
      model: Teacher,
      as: "teacher",
      attributes: ["id", "firstName", "lastName"],
    },
    {
      model: School,
      as: "school",
      attributes: ["id", "name", "shortName"],
    },
    {
      model: User,
      as: "createdBy",
      attributes: ["id", "firstName", "lastName"],
    },
    {
      model: User,
      as: "modifiedBy",
      attributes: ["id", "firstName", "lastName"],
    },
    {
      model: ProjectFile,
      as: "files",
      attributes: ["id", "filename", "fileType", "fileSize"],
      separate: true,
    },
    {
      model: ProjectGrade,
      as: "grades",
      separate: true,
    },
    {
      model: ProjectFeedback,
      as: "feedback",
      separate: true,
    },
  ];

  /**
   * Find a project by ID
   */
  public async findProjectById(id: string): Promise<ProjectInterface | null> {
    try {
      return await Project.findByPk(id, {
        include: this.includeOptions,
      });
    } catch (error) {
      logger.error("Error finding project by ID:", error);
      throw new DatabaseError("Database error while finding project", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId: id },
      });
    }
  }

  /**
   * Find projects by class ID
   */
  public async findProjectsByClassId(
    classId: string
  ): Promise<ProjectInterface[]> {
    try {
      return await Project.findAll({
        where: { classId },
        include: this.includeOptions,
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding projects by class ID:", error);
      throw new DatabaseError(
        "Database error while finding projects by class",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId },
        }
      );
    }
  }

  /**
   * Find projects by subject ID
   */
  public async findProjectsBySubjectId(
    subjectId: string
  ): Promise<ProjectInterface[]> {
    try {
      return await Project.findAll({
        where: { subjectId },
        include: this.includeOptions,
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding projects by subject ID:", error);
      throw new DatabaseError(
        "Database error while finding projects by subject",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, subjectId },
        }
      );
    }
  }

  /**
   * Find projects by teacher ID
   */
  public async findProjectsByTeacherId(
    teacherId: string
  ): Promise<ProjectInterface[]> {
    try {
      return await Project.findAll({
        where: { teacherId },
        include: this.includeOptions,
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding projects by teacher ID:", error);
      throw new DatabaseError(
        "Database error while finding projects by teacher",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId },
        }
      );
    }
  }

  /**
   * Find projects by school ID
   */
  public async findProjectsBySchoolId(
    schoolId: string
  ): Promise<ProjectInterface[]> {
    try {
      return await Project.findAll({
        where: { schoolId },
        include: this.includeOptions,
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error finding projects by school ID:", error);
      throw new DatabaseError(
        "Database error while finding projects by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Create a new project
   */
  public async createProject(
    projectData: CreateProjectDTO,
    transaction?: Transaction
  ): Promise<ProjectInterface> {
    try {
      return await Project.create(projectData as any, { transaction });
    } catch (error) {
      logger.error("Error creating project:", error);
      throw new DatabaseError("Database error while creating project", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Bulk create projects
   */
  public async bulkCreateProjects(
    projectsData: BulkCreateProjectDTO[],
    transaction?: Transaction
  ): Promise<ProjectInterface[]> {
    try {
      return await Project.bulkCreate(projectsData as any, {
        transaction,
        validate: true,
      });
    } catch (error) {
      logger.error("Error bulk creating projects:", error);
      throw new DatabaseError("Database error while bulk creating projects", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a project
   */
  public async updateProject(
    id: string,
    projectData: UpdateProjectDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Project.update(projectData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating project:", error);
      throw new DatabaseError("Database error while updating project", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId: id },
      });
    }
  }

  /**
   * Delete a project
   */
  public async deleteProject(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Project.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting project:", error);
      throw new DatabaseError("Database error while deleting project", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, projectId: id },
      });
    }
  }

  /**
   * Bulk delete projects
   */
  public async bulkDeleteProjects(
    criteria: BulkDeleteProjectDTO,
    transaction?: Transaction
  ): Promise<ProjectDeletionResult> {
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

      // Ensure at least one criteria is provided
      if (Object.keys(whereClause).length === 0) {
        return {
          success: false,
          count: 0,
          message: "No deletion criteria specified",
        };
      }

      const count = await Project.destroy({
        where: whereClause,
        transaction,
      });

      return {
        success: count > 0,
        count,
        message:
          count > 0 ? `Deleted ${count} projects` : "No projects deleted",
      };
    } catch (error) {
      logger.error("Error bulk deleting projects:", error);
      throw new DatabaseError("Database error while bulk deleting projects", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, criteria },
      });
    }
  }

  /**
   * Get project list with filtering and pagination
   */
  public async getProjectList(params: ProjectListQueryParams): Promise<{
    projects: ProjectInterface[];
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
        schoolId,
        status,
        difficulty,
        isGroupProject,
        fromDueDate,
        toDueDate,
      } = params;

      // Build where clause
      let where: WhereOptions<any> = {};

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
      if (schoolId) {
        where.schoolId = schoolId;
      }
      if (status) {
        where.status = status;
      }
      if (difficulty) {
        where.difficulty = difficulty;
      }
      if (isGroupProject !== undefined) {
        where.isGroupProject = isGroupProject;
      }

      // Date range filters
      if (fromDueDate && toDueDate) {
        where.dueDate = { [Op.between]: [fromDueDate, toDueDate] };
      } else if (fromDueDate) {
        where.dueDate = { [Op.gte]: fromDueDate };
      } else if (toDueDate) {
        where.dueDate = { [Op.lte]: toDueDate };
      }

      // Search across multiple fields
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
            { instructions: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get projects and total count
      const { count, rows } = await Project.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: this.includeOptions,
      });

      return {
        projects: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting project list:", error);
      throw new DatabaseError("Database error while getting project list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Check if a project title exists for the same class/teacher
   */
  public async isProjectTitleTaken(
    title: string,
    teacherId: string,
    classId?: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const whereClause: any = {
        title,
        teacherId,
      };

      if (classId) {
        whereClause.classId = classId;
      }

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Project.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if project title is taken:", error);
      throw new DatabaseError(
        "Database error while checking project title availability",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            title,
            teacherId,
            classId,
          },
        }
      );
    }
  }
}

// Create and export repository instance
export default new ProjectRepository();
