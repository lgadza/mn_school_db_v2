import { IStudentRepository } from "./interfaces/services";
import { StudentInterface, StudentStatistics } from "./interfaces/interfaces";
import Student from "./model";
import User from "../../users/model";
import School from "../../schools/model";
import Grade from "../../school_config/grades/model";
import Class from "../../school_config/classes/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  StudentListQueryParams,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentDTOMapper,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class StudentRepository implements IStudentRepository {
  /**
   * Find a student by ID
   */
  public async findStudentById(id: string): Promise<StudentInterface | null> {
    try {
      return await Student.findByPk(id, {
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
            model: Grade,
            as: "grade",
          },
          {
            model: Class,
            as: "class",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding student by ID:", error);
      throw new DatabaseError("Database error while finding student", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, studentId: id },
      });
    }
  }

  /**
   * Find a student by user ID
   */
  public async findStudentByUserId(
    userId: string
  ): Promise<StudentInterface | null> {
    try {
      return await Student.findOne({
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
            model: Grade,
            as: "grade",
          },
          {
            model: Class,
            as: "class",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding student by user ID:", error);
      throw new DatabaseError(
        "Database error while finding student by user ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId },
        }
      );
    }
  }

  /**
   * Find a student by student number
   */
  public async findStudentByStudentNumber(
    studentNumber: string
  ): Promise<StudentInterface | null> {
    try {
      return await Student.findOne({
        where: { studentNumber },
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
            model: Grade,
            as: "grade",
          },
          {
            model: Class,
            as: "class",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding student by student number:", error);
      throw new DatabaseError(
        "Database error while finding student by student number",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, studentNumber },
        }
      );
    }
  }

  /**
   * Create a new student
   */
  public async createStudent(
    studentData: CreateStudentDTO,
    transaction?: Transaction
  ): Promise<StudentInterface> {
    try {
      // Process data before saving
      const dataToSave = StudentDTOMapper.prepareForStorage(studentData);

      return await Student.create(dataToSave as any, { transaction });
    } catch (error) {
      logger.error("Error creating student:", error);
      throw new DatabaseError("Database error while creating student", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a student
   */
  public async updateStudent(
    id: string,
    studentData: UpdateStudentDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Process data before saving
      const dataToSave = StudentDTOMapper.prepareForStorage(studentData);

      const [updated] = await Student.update(dataToSave as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating student:", error);
      throw new DatabaseError("Database error while updating student", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, studentId: id },
      });
    }
  }

  /**
   * Delete a student
   */
  public async deleteStudent(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Student.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting student:", error);
      throw new DatabaseError("Database error while deleting student", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, studentId: id },
      });
    }
  }

  /**
   * Get student list with filtering and pagination
   */
  public async getStudentList(params: StudentListQueryParams): Promise<{
    students: StudentInterface[];
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
        gradeId,
        classId,
        activeStatus,
        enrollmentDateFrom,
        enrollmentDateTo,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (gradeId) {
        where.gradeId = gradeId;
      }

      if (classId) {
        where.classId = classId;
      }

      if (activeStatus !== undefined) {
        where.activeStatus = activeStatus;
      }

      // Enrollment date range
      if (enrollmentDateFrom || enrollmentDateTo) {
        where.enrollmentDate = {};
        if (enrollmentDateFrom) {
          where.enrollmentDate[Op.gte] = enrollmentDateFrom;
        }
        if (enrollmentDateTo) {
          where.enrollmentDate[Op.lte] = enrollmentDateTo;
        }
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
          model: Grade,
          as: "grade",
        },
        {
          model: Class,
          as: "class",
        },
      ];

      // Get students and total count
      const { count, rows } = await Student.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: includes,
        distinct: true, // Important for correct count with associations
      });

      return {
        students: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting student list:", error);
      throw new DatabaseError("Database error while getting student list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find students by school ID
   */
  public async findStudentsBySchool(
    schoolId: string
  ): Promise<StudentInterface[]> {
    try {
      return await Student.findAll({
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
            model: Grade,
            as: "grade",
          },
          {
            model: Class,
            as: "class",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding students by school:", error);
      throw new DatabaseError(
        "Database error while finding students by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find students by grade ID
   */
  public async findStudentsByGrade(
    gradeId: string
  ): Promise<StudentInterface[]> {
    try {
      return await Student.findAll({
        where: { gradeId },
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
            model: Grade,
            as: "grade",
          },
          {
            model: Class,
            as: "class",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding students by grade:", error);
      throw new DatabaseError(
        "Database error while finding students by grade",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId },
        }
      );
    }
  }

  /**
   * Find students by class ID
   */
  public async findStudentsByClass(
    classId: string
  ): Promise<StudentInterface[]> {
    try {
      return await Student.findAll({
        where: { classId },
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
            model: Grade,
            as: "grade",
          },
          {
            model: Class,
            as: "class",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding students by class:", error);
      throw new DatabaseError(
        "Database error while finding students by class",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId },
        }
      );
    }
  }

  /**
   * Check if a student number is already taken
   */
  public async isStudentNumberTaken(
    studentNumber: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      if (!studentNumber) return false;

      const whereClause: any = { studentNumber };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Student.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if student number is taken:", error);
      throw new DatabaseError("Database error while checking student number", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          studentNumber,
        },
      });
    }
  }

  /**
   * Get student statistics
   */
  public async getStudentStatistics(): Promise<StudentStatistics> {
    try {
      // Get total students count
      const totalStudents = await Student.count();

      // Get active/inactive counts
      const activeStudents = await Student.count({
        where: { activeStatus: true },
      });
      const inactiveStudents = totalStudents - activeStudents;

      // Get students per school
      const studentsPerSchoolResult = await Student.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const studentsPerSchool: { [schoolId: string]: number } = {};
      studentsPerSchoolResult.forEach((result: any) => {
        studentsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get students per grade
      const studentsPerGradeResult = await Student.findAll({
        attributes: [
          "gradeId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["gradeId"],
        raw: true,
      });

      const studentsPerGrade: { [gradeId: string]: number } = {};
      studentsPerGradeResult.forEach((result: any) => {
        studentsPerGrade[result.gradeId] = parseInt(result.count, 10);
      });

      // Get students per class
      const studentsPerClassResult = await Student.findAll({
        attributes: [
          "classId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          classId: {
            [Op.ne]: null,
          },
        },
        group: ["classId"],
        raw: true,
      });

      const studentsPerClass: { [classId: string]: number } = {};
      studentsPerClassResult.forEach((result: any) => {
        studentsPerClass[result.classId] = parseInt(result.count, 10);
      });

      // Get enrollments by year
      const enrollmentsByYearResult = await Student.findAll({
        attributes: [
          [
            Sequelize.fn("date_trunc", "year", Sequelize.col("enrollmentDate")),
            "year",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [
          Sequelize.fn("date_trunc", "year", Sequelize.col("enrollmentDate")),
        ],
        raw: true,
      });

      const enrollmentsByYear: { [year: string]: number } = {};
      enrollmentsByYearResult.forEach((result: any) => {
        const year = new Date(result.year).getFullYear().toString();
        enrollmentsByYear[year] = parseInt(result.count, 10);
      });

      // Get enrollments by month
      const enrollmentsByMonthResult = await Student.findAll({
        attributes: [
          [
            Sequelize.fn(
              "date_trunc",
              "month",
              Sequelize.col("enrollmentDate")
            ),
            "month",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [
          Sequelize.fn("date_trunc", "month", Sequelize.col("enrollmentDate")),
        ],
        raw: true,
      });

      const enrollmentsByMonth: { [month: string]: number } = {};
      enrollmentsByMonthResult.forEach((result: any) => {
        const date = new Date(result.month);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        enrollmentsByMonth[monthYear] = parseInt(result.count, 10);
      });

      return {
        totalStudents,
        studentsPerSchool,
        studentsPerGrade,
        studentsPerClass,
        activeStudents,
        inactiveStudents,
        enrollmentsByYear,
        enrollmentsByMonth,
      };
    } catch (error) {
      logger.error("Error getting student statistics:", error);
      throw new DatabaseError(
        "Database error while getting student statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }
}

// Create and export repository instance
export default new StudentRepository();
