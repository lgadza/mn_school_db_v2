import { ITeacherRepository } from "./interfaces/services";
import { TeacherInterface, TeacherStatistics } from "./interfaces/interfaces";
import Teacher from "./model";
import User from "../users/model";
import School from "../schools/model";
import Department from "../departments/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  TeacherListQueryParams,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherDTOMapper,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class TeacherRepository implements ITeacherRepository {
  /**
   * Find a teacher by ID
   */
  public async findTeacherById(id: string): Promise<TeacherInterface | null> {
    try {
      return await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Department,
            as: "department",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding teacher by ID:", error);
      throw new DatabaseError("Database error while finding teacher", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId: id },
      });
    }
  }

  /**
   * Find a teacher by user ID
   */
  public async findTeacherByUserId(
    userId: string
  ): Promise<TeacherInterface | null> {
    try {
      return await Teacher.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Department,
            as: "department",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding teacher by user ID:", error);
      throw new DatabaseError(
        "Database error while finding teacher by user ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId },
        }
      );
    }
  }

  /**
   * Find a teacher by employee ID
   */
  public async findTeacherByEmployeeId(
    employeeId: string
  ): Promise<TeacherInterface | null> {
    try {
      return await Teacher.findOne({
        where: { employeeId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Department,
            as: "department",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding teacher by employee ID:", error);
      throw new DatabaseError(
        "Database error while finding teacher by employee ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, employeeId },
        }
      );
    }
  }

  /**
   * Create a new teacher
   */
  public async createTeacher(
    teacherData: CreateTeacherDTO,
    transaction?: Transaction
  ): Promise<TeacherInterface> {
    try {
      // Handle array fields that need to be stringified
      const dataToSave = { ...teacherData };

      // Handle sensitive data
      const sensitiveData = TeacherDTOMapper.prepareSensitiveData(teacherData);
      delete (dataToSave as any).salary;
      delete (dataToSave as any).emergencyContact;

      // Add encrypted data
      if (sensitiveData.encryptedSalary !== undefined) {
        (dataToSave as any).encryptedSalary = sensitiveData.encryptedSalary;
      }
      if (sensitiveData.encryptedEmergencyContact !== undefined) {
        (dataToSave as any).encryptedEmergencyContact =
          sensitiveData.encryptedEmergencyContact;
      }

      // Stringify array/object fields
      if (dataToSave.previousInstitutions) {
        if (Array.isArray(dataToSave.previousInstitutions)) {
          (dataToSave as any).previousInstitutions = JSON.stringify(
            dataToSave.previousInstitutions
          );
        }
      }

      if (dataToSave.certifications) {
        if (Array.isArray(dataToSave.certifications)) {
          (dataToSave as any).certifications = JSON.stringify(
            dataToSave.certifications
          );
        }
      }

      if (dataToSave.achievements) {
        if (Array.isArray(dataToSave.achievements)) {
          (dataToSave as any).achievements = JSON.stringify(
            dataToSave.achievements
          );
        }
      }

      if (dataToSave.publications) {
        if (Array.isArray(dataToSave.publications)) {
          (dataToSave as any).publications = JSON.stringify(
            dataToSave.publications
          );
        }
      }

      if (dataToSave.primarySubjects) {
        if (Array.isArray(dataToSave.primarySubjects)) {
          (dataToSave as any).primarySubjects = JSON.stringify(
            dataToSave.primarySubjects
          );
        }
      }

      return await Teacher.create(dataToSave as any, { transaction });
    } catch (error) {
      logger.error("Error creating teacher:", error);
      throw new DatabaseError("Database error while creating teacher", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a teacher
   */
  public async updateTeacher(
    id: string,
    teacherData: UpdateTeacherDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Handle array fields that need to be stringified
      const dataToSave = { ...teacherData };

      // Handle sensitive data
      const sensitiveData = TeacherDTOMapper.prepareSensitiveData(teacherData);
      delete (dataToSave as any).salary;
      delete (dataToSave as any).emergencyContact;

      // Add encrypted data
      if (sensitiveData.encryptedSalary !== undefined) {
        (dataToSave as any).encryptedSalary = sensitiveData.encryptedSalary;
      }
      if (sensitiveData.encryptedEmergencyContact !== undefined) {
        (dataToSave as any).encryptedEmergencyContact =
          sensitiveData.encryptedEmergencyContact;
      }

      // Stringify array/object fields
      if (dataToSave.previousInstitutions) {
        if (Array.isArray(dataToSave.previousInstitutions)) {
          (dataToSave as any).previousInstitutions = JSON.stringify(
            dataToSave.previousInstitutions
          );
        }
      }

      if (dataToSave.certifications) {
        if (Array.isArray(dataToSave.certifications)) {
          (dataToSave as any).certifications = JSON.stringify(
            dataToSave.certifications
          );
        }
      }

      if (dataToSave.achievements) {
        if (Array.isArray(dataToSave.achievements)) {
          (dataToSave as any).achievements = JSON.stringify(
            dataToSave.achievements
          );
        }
      }

      if (dataToSave.publications) {
        if (Array.isArray(dataToSave.publications)) {
          (dataToSave as any).publications = JSON.stringify(
            dataToSave.publications
          );
        }
      }

      if (dataToSave.primarySubjects) {
        if (Array.isArray(dataToSave.primarySubjects)) {
          (dataToSave as any).primarySubjects = JSON.stringify(
            dataToSave.primarySubjects
          );
        }
      }

      const [updated] = await Teacher.update(dataToSave as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating teacher:", error);
      throw new DatabaseError("Database error while updating teacher", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId: id },
      });
    }
  }

  /**
   * Delete a teacher
   */
  public async deleteTeacher(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Teacher.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting teacher:", error);
      throw new DatabaseError("Database error while deleting teacher", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId: id },
      });
    }
  }

  /**
   * Get teacher list with filtering and pagination
   */
  public async getTeacherList(params: TeacherListQueryParams): Promise<{
    teachers: TeacherInterface[];
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
        departmentId,
        activeStatus,
        currentStatus,
        contractType,
        minYearsOfExperience,
        maxYearsOfExperience,
        minTeachingLoad,
        maxTeachingLoad,
        hireDateFrom,
        hireDateTo,
        title,
        specialization,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (activeStatus !== undefined) {
        where.activeStatus = activeStatus;
      }

      if (currentStatus) {
        where.currentStatus = currentStatus;
      }

      if (contractType) {
        where.contractType = contractType;
      }

      if (title) {
        where.title = { [Op.iLike]: `%${title}%` };
      }

      if (specialization) {
        where.specialization = { [Op.iLike]: `%${specialization}%` };
      }

      // Years of experience range
      if (
        minYearsOfExperience !== undefined ||
        maxYearsOfExperience !== undefined
      ) {
        where.yearsOfExperience = {};
        if (minYearsOfExperience !== undefined) {
          where.yearsOfExperience[Op.gte] = minYearsOfExperience;
        }
        if (maxYearsOfExperience !== undefined) {
          where.yearsOfExperience[Op.lte] = maxYearsOfExperience;
        }
      }

      // Teaching load range
      if (minTeachingLoad !== undefined || maxTeachingLoad !== undefined) {
        where.teachingLoad = {};
        if (minTeachingLoad !== undefined) {
          where.teachingLoad[Op.gte] = minTeachingLoad;
        }
        if (maxTeachingLoad !== undefined) {
          where.teachingLoad[Op.lte] = maxTeachingLoad;
        }
      }

      // Hire date range
      if (hireDateFrom || hireDateTo) {
        where.hireDate = {};
        if (hireDateFrom) {
          where.hireDate[Op.gte] = hireDateFrom;
        }
        if (hireDateTo) {
          where.hireDate[Op.lte] = hireDateTo;
        }
      }

      // Search across multiple fields
      if (search) {
        // Add join condition for user's name
        const userWhere = {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
          ],
        };

        // We have to include the User model with a where condition
        // This is handled separately below in the includes
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Prepare include models
      const includes = [
        {
          model: User,
          as: "user",
          where: search
            ? {
                [Op.or]: [
                  { firstName: { [Op.iLike]: `%${search}%` } },
                  { lastName: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : undefined,
        },
        {
          model: School,
          as: "school",
        },
        {
          model: Department,
          as: "department",
        },
      ];

      // Get teachers and total count
      const { count, rows } = await Teacher.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: includes,
        distinct: true, // Important for correct count with associations
      });

      return {
        teachers: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting teacher list:", error);
      throw new DatabaseError("Database error while getting teacher list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find teachers by school ID
   */
  public async findTeachersBySchool(
    schoolId: string
  ): Promise<TeacherInterface[]> {
    try {
      return await Teacher.findAll({
        where: { schoolId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Department,
            as: "department",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding teachers by school:", error);
      throw new DatabaseError(
        "Database error while finding teachers by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find teachers by department ID
   */
  public async findTeachersByDepartment(
    departmentId: string
  ): Promise<TeacherInterface[]> {
    try {
      return await Teacher.findAll({
        where: { departmentId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Department,
            as: "department",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding teachers by department:", error);
      throw new DatabaseError(
        "Database error while finding teachers by department",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, departmentId },
        }
      );
    }
  }

  /**
   * Check if a teacher's employee ID exists
   */
  public async isEmployeeIdTaken(
    employeeId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      if (!employeeId) return false;

      const whereClause: any = { employeeId };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Teacher.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if employee ID is taken:", error);
      throw new DatabaseError("Database error while checking employee ID", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          employeeId,
        },
      });
    }
  }

  /**
   * Get teacher statistics
   */
  public async getTeacherStatistics(): Promise<TeacherStatistics> {
    try {
      // Get total teachers count
      const totalTeachers = await Teacher.count();

      // Get teachers per school
      const teachersPerSchoolResult = await Teacher.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const teachersPerSchool: { [schoolId: string]: number } = {};
      teachersPerSchoolResult.forEach((result: any) => {
        teachersPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get teachers per department
      const teachersPerDepartmentResult = await Teacher.findAll({
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

      const teachersPerDepartment: { [departmentId: string]: number } = {};
      teachersPerDepartmentResult.forEach((result: any) => {
        teachersPerDepartment[result.departmentId] = parseInt(result.count, 10);
      });

      // Get teachers by status
      const teachersByStatusResult = await Teacher.findAll({
        attributes: [
          "currentStatus",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          currentStatus: {
            [Op.ne]: null,
          },
        },
        group: ["currentStatus"],
        raw: true,
      });

      const teachersByStatus: { [status: string]: number } = {};
      teachersByStatusResult.forEach((result: any) => {
        teachersByStatus[result.currentStatus] = parseInt(result.count, 10);
      });

      // Get teachers by contract type
      const teachersByContractTypeResult = await Teacher.findAll({
        attributes: [
          "contractType",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          contractType: {
            [Op.ne]: null,
          },
        },
        group: ["contractType"],
        raw: true,
      });

      const teachersByContractType: { [contractType: string]: number } = {};
      teachersByContractTypeResult.forEach((result: any) => {
        teachersByContractType[result.contractType] = parseInt(
          result.count,
          10
        );
      });

      // Get average years of experience
      const yearsOfExperienceResult = (await Teacher.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("yearsOfExperience")), "avgYears"],
        ],
        where: {
          yearsOfExperience: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { avgYears: string | null };

      // Get average teaching load
      const teachingLoadResult = (await Teacher.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("teachingLoad")), "avgLoad"],
        ],
        where: {
          teachingLoad: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { avgLoad: string | null };

      return {
        totalTeachers,
        teachersPerSchool,
        teachersPerDepartment,
        teachersByStatus,
        teachersByContractType,
        averageYearsOfExperience:
          yearsOfExperienceResult && yearsOfExperienceResult.avgYears
            ? parseFloat(yearsOfExperienceResult.avgYears) || 0
            : 0,
        averageTeachingLoad:
          teachingLoadResult && teachingLoadResult.avgLoad
            ? parseFloat(teachingLoadResult.avgLoad) || 0
            : 0,
      };
    } catch (error) {
      logger.error("Error getting teacher statistics:", error);
      throw new DatabaseError(
        "Database error while getting teacher statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }
}

// Create and export repository instance
export default new TeacherRepository();
