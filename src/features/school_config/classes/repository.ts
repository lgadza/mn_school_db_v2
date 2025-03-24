import { IClassRepository } from "./interfaces/services";
import { ClassInterface, ClassStatistics } from "./interfaces/interfaces";
import Class from "./model";
import School from "../../schools/model";
import Teacher from "../../teachers/model";
import Grade from "../grades/model";
import Section from "../sections/model";
import Department from "../departments/model";
import Classroom from "../classrooms/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import { ClassListQueryParams, CreateClassDTO, UpdateClassDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ClassRepository implements IClassRepository {
  /**
   * Find a class by ID
   */
  public async findClassById(id: string): Promise<ClassInterface | null> {
    try {
      return await Class.findByPk(id, {
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding class by ID:", error);
      throw new DatabaseError("Database error while finding class", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId: id },
      });
    }
  }

  /**
   * Create a new class
   */
  public async createClass(
    classData: CreateClassDTO,
    transaction?: Transaction
  ): Promise<ClassInterface> {
    try {
      // Generate combination if not provided
      if (
        !classData.combination &&
        classData.gradeId &&
        classData.schoolYearId
      ) {
        classData.combination = Class.generateCombination({
          gradeId: classData.gradeId,
          sectionId: classData.sectionId,
          schoolYearId: classData.schoolYearId,
        });
      }

      const newClass = await Class.create(classData as any, { transaction });

      // If a classroom was assigned, update its capacity usage
      if (classData.classroomId) {
        await this.updateClassroomCapacityUsage(
          classData.classroomId,
          transaction
        );
      }

      return newClass;
    } catch (error) {
      logger.error("Error creating class:", error);
      throw new DatabaseError("Database error while creating class", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a class
   */
  public async updateClass(
    id: string,
    classData: UpdateClassDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Get current class data for checking if classroom changed
      const currentClass = await Class.findByPk(id);
      if (!currentClass) {
        return false;
      }

      // Generate combination if needed fields have changed
      if (
        (classData.gradeId || classData.sectionId || classData.schoolYearId) &&
        !classData.combination
      ) {
        classData.combination = Class.generateCombination({
          gradeId: classData.gradeId || currentClass.gradeId,
          sectionId:
            classData.sectionId !== undefined
              ? classData.sectionId
              : currentClass.sectionId,
          schoolYearId: classData.schoolYearId || currentClass.schoolYearId,
        });
      }

      const [updated] = await Class.update(classData as any, {
        where: { id },
        transaction,
      });

      // Update classroom capacity usage if classroom changed or student count changed
      const classroomChanged =
        classData.classroomId &&
        classData.classroomId !== currentClass.classroomId;
      const studentCountChanged =
        classData.studentCount !== undefined &&
        classData.studentCount !== currentClass.studentCount;

      if (classroomChanged) {
        // Update both old and new classroom
        if (currentClass.classroomId) {
          await this.updateClassroomCapacityUsage(
            currentClass.classroomId,
            transaction
          );
        }
        if (classData.classroomId) {
          await this.updateClassroomCapacityUsage(
            classData.classroomId,
            transaction
          );
        }
      } else if (studentCountChanged && currentClass.classroomId) {
        // Only student count changed, update current classroom
        await this.updateClassroomCapacityUsage(
          currentClass.classroomId,
          transaction
        );
      }

      return updated > 0;
    } catch (error) {
      logger.error("Error updating class:", error);
      throw new DatabaseError("Database error while updating class", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId: id },
      });
    }
  }

  /**
   * Delete a class
   */
  public async deleteClass(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Get the class first to capture the classroom ID if present
      const classToDelete = await Class.findByPk(id);
      if (!classToDelete) {
        return false;
      }

      const deleted = await Class.destroy({
        where: { id },
        transaction,
      });

      // Update classroom capacity usage if this class was assigned to a classroom
      if (deleted > 0 && classToDelete.classroomId) {
        await this.updateClassroomCapacityUsage(
          classToDelete.classroomId,
          transaction
        );
      }

      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting class:", error);
      throw new DatabaseError("Database error while deleting class", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classId: id },
      });
    }
  }

  /**
   * Get class list with filtering and pagination
   */
  public async getClassList(params: ClassListQueryParams): Promise<{
    classes: ClassInterface[];
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
        teacherId,
        gradeId,
        sectionId,
        departmentId,
        classroomId,
        schoolYearId,
        classType,
        status,
        capacityFrom,
        capacityTo,
        studentCountFrom,
        studentCountTo,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (teacherId) {
        where.teacherId = teacherId;
      }

      if (gradeId) {
        where.gradeId = gradeId;
      }

      if (sectionId) {
        where.sectionId = sectionId;
      }

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (classroomId) {
        where.classroomId = classroomId;
      }

      if (schoolYearId) {
        where.schoolYearId = schoolYearId;
      }

      if (classType) {
        where.classType = classType;
      }

      if (status) {
        where.status = status;
      }

      // Capacity range
      if (capacityFrom !== undefined || capacityTo !== undefined) {
        where.capacity = {};
        if (capacityFrom !== undefined) {
          where.capacity[Op.gte] = capacityFrom;
        }
        if (capacityTo !== undefined) {
          where.capacity[Op.lte] = capacityTo;
        }
      }

      // Student count range
      if (studentCountFrom !== undefined || studentCountTo !== undefined) {
        where.studentCount = {};
        if (studentCountFrom !== undefined) {
          where.studentCount[Op.gte] = studentCountFrom;
        }
        if (studentCountTo !== undefined) {
          where.studentCount[Op.lte] = studentCountTo;
        }
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { details: { [Op.iLike]: `%${search}%` } },
            { classType: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get classes and total count
      const { count, rows } = await Class.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });

      return {
        classes: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting class list:", error);
      throw new DatabaseError("Database error while getting class list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find classes by school ID
   */
  public async findClassesBySchool(
    schoolId: string
  ): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { schoolId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by school:", error);
      throw new DatabaseError(
        "Database error while finding classes by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find classes by teacher ID
   */
  public async findClassesByTeacher(
    teacherId: string
  ): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { teacherId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by teacher:", error);
      throw new DatabaseError(
        "Database error while finding classes by teacher",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, teacherId },
        }
      );
    }
  }

  /**
   * Find classes by grade ID
   */
  public async findClassesByGrade(gradeId: string): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { gradeId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by grade:", error);
      throw new DatabaseError("Database error while finding classes by grade", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, gradeId },
      });
    }
  }

  /**
   * Find classes by section ID
   */
  public async findClassesBySection(
    sectionId: string
  ): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { sectionId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by section:", error);
      throw new DatabaseError(
        "Database error while finding classes by section",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, sectionId },
        }
      );
    }
  }

  /**
   * Find classes by department ID
   */
  public async findClassesByDepartment(
    departmentId: string
  ): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { departmentId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by department:", error);
      throw new DatabaseError(
        "Database error while finding classes by department",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, departmentId },
        }
      );
    }
  }

  /**
   * Find classes by classroom ID
   */
  public async findClassesByClassroom(
    classroomId: string
  ): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { classroomId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by classroom:", error);
      throw new DatabaseError(
        "Database error while finding classes by classroom",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, classroomId },
        }
      );
    }
  }

  /**
   * Find classes by school year ID
   */
  public async findClassesBySchoolYear(
    schoolYearId: string
  ): Promise<ClassInterface[]> {
    try {
      return await Class.findAll({
        where: { schoolYearId },
        include: [
          { model: School, as: "school" },
          { model: Teacher, as: "teacher" },
          { model: Grade, as: "grade" },
          { model: Section, as: "section" },
          { model: Department, as: "department" },
          { model: Classroom, as: "classroom" },
        ],
      });
    } catch (error) {
      logger.error("Error finding classes by school year:", error);
      throw new DatabaseError(
        "Database error while finding classes by school year",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolYearId },
        }
      );
    }
  }

  /**
   * Get class statistics
   */
  public async getClassStatistics(): Promise<ClassStatistics> {
    try {
      // Get total classes count
      const totalClasses = await Class.count();

      // Get active/archived counts
      const activeClassesCount = await Class.count({
        where: { status: "active" },
      });
      const archivedClassesCount = await Class.count({
        where: { status: "archived" },
      });

      // Get classes per school
      const classesPerSchoolResult = await Class.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const classesPerSchool: { [schoolId: string]: number } = {};
      classesPerSchoolResult.forEach((result: any) => {
        classesPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get classes per grade
      const classesPerGradeResult = await Class.findAll({
        attributes: [
          "gradeId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["gradeId"],
        raw: true,
      });

      const classesPerGrade: { [gradeId: string]: number } = {};
      classesPerGradeResult.forEach((result: any) => {
        classesPerGrade[result.gradeId] = parseInt(result.count, 10);
      });

      // Get classes per teacher
      const classesPerTeacherResult = await Class.findAll({
        attributes: [
          "teacherId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          teacherId: {
            [Op.ne]: null,
          },
        },
        group: ["teacherId"],
        raw: true,
      });

      const classesPerTeacher: { [teacherId: string]: number } = {};
      classesPerTeacherResult.forEach((result: any) => {
        classesPerTeacher[result.teacherId] = parseInt(result.count, 10);
      });

      // Get average capacity
      const capacityResult = (await Class.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("capacity")), "avgCapacity"],
        ],
        where: {
          capacity: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { avgCapacity: string | null };

      const averageCapacity =
        capacityResult && capacityResult.avgCapacity
          ? parseFloat(capacityResult.avgCapacity) || 0
          : 0;

      // Get average student count
      const studentCountResult = (await Class.findOne({
        attributes: [
          [
            Sequelize.fn("AVG", Sequelize.col("studentCount")),
            "avgStudentCount",
          ],
        ],
        where: {
          studentCount: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { avgStudentCount: string | null };

      const averageStudentCount =
        studentCountResult && studentCountResult.avgStudentCount
          ? parseFloat(studentCountResult.avgStudentCount) || 0
          : 0;

      // Get classes by type
      const classesByTypeResult = await Class.findAll({
        attributes: [
          "classType",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          classType: {
            [Op.ne]: null,
          },
        },
        group: ["classType"],
        raw: true,
      });

      const classesByType: { [type: string]: number } = {};
      classesByTypeResult.forEach((result: any) => {
        classesByType[result.classType] = parseInt(result.count, 10);
      });

      // Calculate capacity utilization (as a percentage)
      // This is the ratio of total student count to total capacity
      let capacityUtilization = 0;
      const totalCapacityResult = (await Class.findOne({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("capacity")), "totalCapacity"],
        ],
        where: {
          capacity: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { totalCapacity: string | null };

      const totalStudentCountResult = (await Class.findOne({
        attributes: [
          [
            Sequelize.fn("SUM", Sequelize.col("studentCount")),
            "totalStudentCount",
          ],
        ],
        where: {
          studentCount: {
            [Op.ne]: null,
          },
        },
        raw: true,
      })) as unknown as { totalStudentCount: string | null };

      const totalCapacity =
        totalCapacityResult && totalCapacityResult.totalCapacity
          ? parseFloat(totalCapacityResult.totalCapacity)
          : 0;

      const totalStudentCount =
        totalStudentCountResult && totalStudentCountResult.totalStudentCount
          ? parseFloat(totalStudentCountResult.totalStudentCount)
          : 0;

      if (totalCapacity > 0) {
        capacityUtilization = (totalStudentCount / totalCapacity) * 100;
      }

      return {
        totalClasses,
        classesPerSchool,
        classesPerGrade,
        classesPerTeacher,
        activeClassesCount,
        archivedClassesCount,
        averageCapacity,
        averageStudentCount,
        classesByType,
        capacityUtilization,
      };
    } catch (error) {
      logger.error("Error getting class statistics:", error);
      throw new DatabaseError("Database error while getting class statistics", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Create multiple classes at once
   */
  public async createClassesBulk(
    classesData: CreateClassDTO[],
    transaction?: Transaction
  ): Promise<ClassInterface[]> {
    try {
      // Prepare data with combinations
      const preparedData = classesData.map((classData) => {
        // Generate combination if not provided
        if (
          !classData.combination &&
          classData.gradeId &&
          classData.schoolYearId
        ) {
          classData.combination = Class.generateCombination({
            gradeId: classData.gradeId,
            sectionId: classData.sectionId,
            schoolYearId: classData.schoolYearId,
          });
        }
        return classData;
      });

      // Create all classes
      const createdClasses = await Class.bulkCreate(preparedData as any, {
        transaction,
      });

      // Update classroom capacity usage for all affected classrooms
      const classroomIds = new Set<string>();
      createdClasses.forEach((cls) => {
        if (cls.classroomId) {
          classroomIds.add(cls.classroomId);
        }
      });

      for (const classroomId of classroomIds) {
        await this.updateClassroomCapacityUsage(classroomId, transaction);
      }

      return createdClasses;
    } catch (error) {
      logger.error("Error bulk creating classes:", error);
      throw new DatabaseError("Database error while bulk creating classes", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple classes at once
   */
  public async deleteClassesBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      // Get classes to delete to capture classroom IDs
      const classesToDelete = await Class.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ["id", "classroomId"],
      });

      // Collect classroom IDs to update after deletion
      const classroomIds = new Set<string>();
      classesToDelete.forEach((cls) => {
        if (cls.classroomId) {
          classroomIds.add(cls.classroomId);
        }
      });

      // Delete classes
      const deleted = await Class.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });

      // Update classroom capacity usage for all affected classrooms
      for (const classroomId of classroomIds) {
        await this.updateClassroomCapacityUsage(classroomId, transaction);
      }

      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting classes:", error);
      throw new DatabaseError("Database error while bulk deleting classes", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          classIds: ids,
        },
      });
    }
  }

  /**
   * Update classroom capacity usage
   * This recalculates and updates a classroom's capacity usage
   * based on all classes assigned to it
   */
  public async updateClassroomCapacityUsage(
    classroomId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Get the classroom
      const classroom = await Classroom.findByPk(classroomId, { transaction });
      if (!classroom) {
        return false;
      }

      // Get all classes assigned to this classroom
      const classes = await Class.findAll({
        where: { classroomId },
        attributes: ["studentCount"],
        transaction,
      });

      // Calculate total student count
      let totalStudents = 0;
      classes.forEach((cls) => {
        if (cls.studentCount) {
          totalStudents += cls.studentCount;
        }
      });

      // Update classroom with current usage
      await Classroom.update({ currentOccupancy: totalStudents } as any, {
        where: { id: classroomId },
        transaction,
      });

      return true;
    } catch (error) {
      logger.error("Error updating classroom capacity usage:", error);
      throw new DatabaseError(
        "Database error while updating classroom capacity",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            classroomId,
          },
        }
      );
    }
  }
}

// Create and export repository instance
export default new ClassRepository();
