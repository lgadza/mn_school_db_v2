import { IStudentService, IStudentRepository } from "./interfaces/services";
import {
  StudentDetailDTO,
  CreateStudentDTO,
  UpdateStudentDTO,
  PaginatedStudentListDTO,
  StudentListQueryParams,
  StudentDTOMapper,
} from "./dto";
import { StudentStatistics } from "./interfaces/interfaces";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { UserDTOMapper } from "../../users/dto";
import { SchoolDTOMapper } from "../../schools/dto";
import { GradeDTOMapper } from "../../school_config/grades/dto";
import { ClassDTOMapper } from "../../school_config/classes/dto";
import userService from "../../users/service";
import schoolService from "../../schools/service";
import gradeService from "../../school_config/grades/service";
import classService from "../../school_config/classes/service";
import db from "@/config/database";
import DateTimeUtil from "@/common/utils/date/dateTimeUtil";

export class StudentService implements IStudentService {
  private repository: IStudentRepository;
  private readonly CACHE_PREFIX = "student:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IStudentRepository) {
    this.repository = repository;
  }

  /**
   * Get student by ID
   */
  public async getStudentById(id: string): Promise<StudentDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedStudent = await cache.get(cacheKey);

      if (cachedStudent) {
        return JSON.parse(cachedStudent);
      }

      // Get from database if not in cache
      const student = await this.repository.findStudentById(id);
      if (!student) {
        throw new NotFoundError(`Student with ID ${id} not found`);
      }

      // Map to DTO with related entities
      const studentDTO = StudentDTOMapper.toDetailDTO(student);

      // If the student has related entities, map them to DTOs
      if (student.user) {
        studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
      }

      if (student.school) {
        studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
      }

      if (student.grade) {
        studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
      }

      if (student.class) {
        studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(studentDTO), this.CACHE_TTL);

      return studentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentById service:", error);
      throw new AppError("Failed to get student");
    }
  }

  /**
   * Get student by user ID
   */
  public async getStudentByUserId(userId: string): Promise<StudentDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}user:${userId}`;
      const cachedStudent = await cache.get(cacheKey);

      if (cachedStudent) {
        return JSON.parse(cachedStudent);
      }

      // Get from database if not in cache
      const student = await this.repository.findStudentByUserId(userId);
      if (!student) {
        throw new NotFoundError(`Student with user ID ${userId} not found`);
      }

      // Map to DTO with related entities
      const studentDTO = StudentDTOMapper.toDetailDTO(student);

      // If the student has related entities, map them to DTOs
      if (student.user) {
        studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
      }

      if (student.school) {
        studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
      }

      if (student.grade) {
        studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
      }

      if (student.class) {
        studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(studentDTO), this.CACHE_TTL);

      return studentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentByUserId service:", error);
      throw new AppError("Failed to get student by user ID");
    }
  }

  /**
   * Get student by student number
   */
  public async getStudentByStudentNumber(
    studentNumber: string
  ): Promise<StudentDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}number:${studentNumber}`;
      const cachedStudent = await cache.get(cacheKey);

      if (cachedStudent) {
        return JSON.parse(cachedStudent);
      }

      // Get from database if not in cache
      const student = await this.repository.findStudentByStudentNumber(
        studentNumber
      );
      if (!student) {
        throw new NotFoundError(
          `Student with student number ${studentNumber} not found`
        );
      }

      // Map to DTO with related entities
      const studentDTO = StudentDTOMapper.toDetailDTO(student);

      // If the student has related entities, map them to DTOs
      if (student.user) {
        studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
      }

      if (student.school) {
        studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
      }

      if (student.grade) {
        studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
      }

      if (student.class) {
        studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
      }

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(studentDTO), this.CACHE_TTL);

      return studentDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentByStudentNumber service:", error);
      throw new AppError("Failed to get student by student number");
    }
  }

  /**
   * Create a new student
   */
  public async createStudent(
    studentData: CreateStudentDTO
  ): Promise<StudentDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Validate data
      await this.validateStudentData(studentData);

      // Check if user exists
      try {
        await userService.getUserById(studentData.userId);
      } catch (error) {
        throw new BadRequestError(
          `User with ID ${studentData.userId} not found`
        );
      }

      // Check if school exists
      try {
        await schoolService.getSchoolById(studentData.schoolId);
      } catch (error) {
        throw new BadRequestError(
          `School with ID ${studentData.schoolId} not found`
        );
      }

      // Check if grade exists
      try {
        await gradeService.getGradeById(studentData.gradeId);
      } catch (error) {
        throw new BadRequestError(
          `Grade with ID ${studentData.gradeId} not found`
        );
      }

      // Check if class exists if provided
      if (studentData.classId) {
        try {
          await classService.getClassById(studentData.classId);
        } catch (error) {
          throw new BadRequestError(
            `Class with ID ${studentData.classId} not found`
          );
        }
      }

      // Check if user is already a student
      const existingStudent = await this.repository.findStudentByUserId(
        studentData.userId
      );
      if (existingStudent) {
        throw new ConflictError(
          `User with ID ${studentData.userId} is already a student`
        );
      }

      // Generate student number if not provided
      if (!studentData.studentNumber) {
        studentData.studentNumber = await this.generateStudentNumber(
          studentData.schoolId,
          studentData.gradeId
        );
      } else {
        // Check if student number is already taken
        const isStudentNumberTaken = await this.repository.isStudentNumberTaken(
          studentData.studentNumber
        );
        if (isStudentNumberTaken) {
          throw new ConflictError(
            `Student number ${studentData.studentNumber} is already taken`
          );
        }
      }

      // Create the student
      const newStudent = await this.repository.createStudent(
        studentData,
        transaction
      );

      await transaction.commit();

      // Get the complete student with associations
      return this.getStudentById(newStudent.id);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createStudent service:", error);
      throw new AppError("Failed to create student");
    }
  }

  /**
   * Update a student
   */
  public async updateStudent(
    id: string,
    studentData: UpdateStudentDTO
  ): Promise<StudentDetailDTO> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if student exists
      const existingStudent = await this.repository.findStudentById(id);
      if (!existingStudent) {
        throw new NotFoundError(`Student with ID ${id} not found`);
      }

      // Validate data
      await this.validateStudentData(studentData);

      // Check if school exists if provided
      if (studentData.schoolId) {
        try {
          await schoolService.getSchoolById(studentData.schoolId);
        } catch (error) {
          throw new BadRequestError(
            `School with ID ${studentData.schoolId} not found`
          );
        }
      }

      // Check if grade exists if provided
      if (studentData.gradeId) {
        try {
          await gradeService.getGradeById(studentData.gradeId);
        } catch (error) {
          throw new BadRequestError(
            `Grade with ID ${studentData.gradeId} not found`
          );
        }
      }

      // Check if class exists if provided
      if (studentData.classId) {
        try {
          await classService.getClassById(studentData.classId);
        } catch (error) {
          throw new BadRequestError(
            `Class with ID ${studentData.classId} not found`
          );
        }
      }

      // Check if student number is already taken if changing
      if (
        studentData.studentNumber &&
        studentData.studentNumber !== existingStudent.studentNumber
      ) {
        const isStudentNumberTaken = await this.repository.isStudentNumberTaken(
          studentData.studentNumber,
          id
        );
        if (isStudentNumberTaken) {
          throw new ConflictError(
            `Student number ${studentData.studentNumber} is already taken`
          );
        }
      }

      // Update student
      await this.repository.updateStudent(id, studentData, transaction);

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${id}`,
        `${this.CACHE_PREFIX}user:${existingStudent.userId}`,
      ];

      if (existingStudent.studentNumber) {
        cacheKeys.push(
          `${this.CACHE_PREFIX}number:${existingStudent.studentNumber}`
        );
      }

      if (
        studentData.studentNumber &&
        studentData.studentNumber !== existingStudent.studentNumber
      ) {
        cacheKeys.push(
          `${this.CACHE_PREFIX}number:${studentData.studentNumber}`
        );
      }

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      // Get the updated student
      return this.getStudentById(id);
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateStudent service:", error);
      throw new AppError("Failed to update student");
    }
  }

  /**
   * Delete a student
   */
  public async deleteStudent(id: string): Promise<boolean> {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if student exists
      const existingStudent = await this.repository.findStudentById(id);
      if (!existingStudent) {
        throw new NotFoundError(`Student with ID ${id} not found`);
      }

      // Delete the student
      const result = await this.repository.deleteStudent(id, transaction);

      await transaction.commit();

      // Clear cache
      const cacheKeys = [
        `${this.CACHE_PREFIX}${id}`,
        `${this.CACHE_PREFIX}user:${existingStudent.userId}`,
      ];

      if (existingStudent.studentNumber) {
        cacheKeys.push(
          `${this.CACHE_PREFIX}number:${existingStudent.studentNumber}`
        );
      }

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      return result;
    } catch (error) {
      await transaction.rollback();

      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteStudent service:", error);
      throw new AppError("Failed to delete student");
    }
  }

  /**
   * Get paginated student list
   */
  public async getStudentList(
    params: StudentListQueryParams
  ): Promise<PaginatedStudentListDTO> {
    try {
      const { students, total } = await this.repository.getStudentList(params);

      // Map to DTOs with related entities
      const studentDTOs = students.map((student) => {
        const studentDTO = StudentDTOMapper.toDetailDTO(student);

        if (student.user) {
          studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
        }

        if (student.school) {
          studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
        }

        if (student.grade) {
          studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
        }

        if (student.class) {
          studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
        }

        return studentDTO;
      });

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        students: studentDTOs,
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
      logger.error("Error in getStudentList service:", error);
      throw new AppError("Failed to get student list");
    }
  }

  /**
   * Get students by school
   */
  public async getStudentsBySchool(
    schoolId: string
  ): Promise<StudentDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}school:${schoolId}`;
      const cachedStudents = await cache.get(cacheKey);

      if (cachedStudents) {
        return JSON.parse(cachedStudents);
      }

      // Check if school exists
      try {
        await schoolService.getSchoolById(schoolId);
      } catch (error) {
        throw new BadRequestError(`School with ID ${schoolId} not found`);
      }

      const students = await this.repository.findStudentsBySchool(schoolId);

      // Map to DTOs with related entities
      const studentDTOs = students.map((student) => {
        const studentDTO = StudentDTOMapper.toDetailDTO(student);

        if (student.user) {
          studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
        }

        if (student.school) {
          studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
        }

        if (student.grade) {
          studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
        }

        if (student.class) {
          studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
        }

        return studentDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(studentDTOs), this.CACHE_TTL);

      return studentDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentsBySchool service:", error);
      throw new AppError("Failed to get students by school");
    }
  }

  /**
   * Get students by grade
   */
  public async getStudentsByGrade(
    gradeId: string
  ): Promise<StudentDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}grade:${gradeId}`;
      const cachedStudents = await cache.get(cacheKey);

      if (cachedStudents) {
        return JSON.parse(cachedStudents);
      }

      // Check if grade exists
      try {
        await gradeService.getGradeById(gradeId);
      } catch (error) {
        throw new BadRequestError(`Grade with ID ${gradeId} not found`);
      }

      const students = await this.repository.findStudentsByGrade(gradeId);

      // Map to DTOs with related entities
      const studentDTOs = students.map((student) => {
        const studentDTO = StudentDTOMapper.toDetailDTO(student);

        if (student.user) {
          studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
        }

        if (student.school) {
          studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
        }

        if (student.grade) {
          studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
        }

        if (student.class) {
          studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
        }

        return studentDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(studentDTOs), this.CACHE_TTL);

      return studentDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentsByGrade service:", error);
      throw new AppError("Failed to get students by grade");
    }
  }

  /**
   * Get students by class
   */
  public async getStudentsByClass(
    classId: string
  ): Promise<StudentDetailDTO[]> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}class:${classId}`;
      const cachedStudents = await cache.get(cacheKey);

      if (cachedStudents) {
        return JSON.parse(cachedStudents);
      }

      // Check if class exists
      try {
        await classService.getClassById(classId);
      } catch (error) {
        throw new BadRequestError(`Class with ID ${classId} not found`);
      }

      const students = await this.repository.findStudentsByClass(classId);

      // Map to DTOs with related entities
      const studentDTOs = students.map((student) => {
        const studentDTO = StudentDTOMapper.toDetailDTO(student);

        if (student.user) {
          studentDTO.user = UserDTOMapper.toDetailDTO(student.user);
        }

        if (student.school) {
          studentDTO.school = SchoolDTOMapper.toDetailDTO(student.school);
        }

        if (student.grade) {
          studentDTO.grade = GradeDTOMapper.toDetailDTO(student.grade);
        }

        if (student.class) {
          studentDTO.class = ClassDTOMapper.toDetailDTO(student.class);
        }

        return studentDTO;
      });

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(studentDTOs), this.CACHE_TTL);

      return studentDTOs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentsByClass service:", error);
      throw new AppError("Failed to get students by class");
    }
  }

  /**
   * Generate a unique student number
   */
  public async generateStudentNumber(
    schoolId: string,
    gradeId: string
  ): Promise<string> {
    try {
      // Check if school exists
      const schoolDetail = await schoolService.getSchoolById(schoolId);

      // Check if grade exists
      const gradeDetail = await gradeService.getGradeById(gradeId);

      // Get school short name or first 2 chars of school name
      const schoolPrefix = schoolDetail.shortName
        ? schoolDetail.shortName.substring(0, 2).toUpperCase()
        : schoolDetail.name.substring(0, 2).toUpperCase();

      // Get grade identifier (e.g., G1, G2, etc.) but the name is like this Grade 1 or Form 1
    const gradeType = gradeDetail.name.startsWith('Grade') ? 'G' : (gradeDetail.name.startsWith('Form') ? 'F' : 'G');
    const gradeNumber = gradeDetail.name.match(/\d+/)?.[0] || '';
    const gradePrefix = `${gradeType}${gradeNumber}`; 

      // Get current year
      const currentYear = new Date().getFullYear().toString().substring(2);

      // Get sequential number (count of students in the school and grade + 1)
      const students = await this.repository.findStudentsByGrade(gradeId);
      const schoolStudents = students.filter((s) => s.schoolId === schoolId);
      const sequentialNumber = (schoolStudents.length + 1)
        .toString()
        .padStart(3, "0");

      // Combine to create a unique ID: SS-GX-YY-NNN (e.g., GH-G1-23-001)
      const proposedNumber = `${schoolPrefix}-${gradePrefix}-${currentYear}-${sequentialNumber}`;

      // Check if this number is already taken
      const isNumberTaken = await this.repository.isStudentNumberTaken(
        proposedNumber
      );

      // If number is taken, append a random number
      if (isNumberTaken) {
        const randomDigit = Math.floor(Math.random() * 10);
        return `${proposedNumber}-${randomDigit}`;
      }

      return proposedNumber;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in generateStudentNumber service:", error);
      throw new AppError("Failed to generate student number");
    }
  }

  /**
   * Validate student data
   */
  public async validateStudentData(
    studentData: CreateStudentDTO | UpdateStudentDTO
  ): Promise<boolean> {
    // Validate enrollment date if provided
    if (
      "enrollmentDate" in studentData &&
      studentData.enrollmentDate !== null &&
      studentData.enrollmentDate !== undefined
    ) {
      const enrollmentDate = new Date(studentData.enrollmentDate);
      if (!DateTimeUtil.isValidDate(enrollmentDate)) {
        throw new BadRequestError(
          `Invalid enrollment date: ${studentData.enrollmentDate}`
        );
      }

      // Enrollment date should not be in the future
      const today = new Date();
      if (enrollmentDate > today) {
        throw new BadRequestError("Enrollment date cannot be in the future");
      }
    }

    // Validate structured JSON data if provided
    if (
      "guardianInfo" in studentData &&
      typeof studentData.guardianInfo === "object" &&
      studentData.guardianInfo !== null
    ) {
      // Validate guardianInfo structure if provided as an array
      if (Array.isArray(studentData.guardianInfo)) {
        for (const guardian of studentData.guardianInfo) {
          if (!guardian.relationship || !guardian.name || !guardian.contact) {
            throw new BadRequestError(
              "Each guardian must have relationship, name, and contact information"
            );
          }
        }
      }
    }

    // Validate health info if provided as an object
    if (
      "healthInfo" in studentData &&
      typeof studentData.healthInfo === "object" &&
      studentData.healthInfo !== null &&
      !Array.isArray(studentData.healthInfo)
    ) {
      // Additional validations could be added here based on health info structure
    }

    // Validate previous school info if provided as an object
    if (
      "previousSchool" in studentData &&
      typeof studentData.previousSchool === "object" &&
      studentData.previousSchool !== null &&
      !Array.isArray(studentData.previousSchool)
    ) {
      // Additional validations could be added here
    }

    return true;
  }

  /**
   * Get student statistics
   */
  public async getStudentStatistics(): Promise<StudentStatistics> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}statistics`;
      const cachedStats = await cache.get(cacheKey);

      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const statistics = await this.repository.getStudentStatistics();

      // Store in cache (with shorter TTL since statistics change)
      await cache.set(cacheKey, JSON.stringify(statistics), 300); // 5 minutes TTL

      return statistics;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getStudentStatistics service:", error);
      throw new AppError("Failed to get student statistics");
    }
  }
}

// Create and export service instance
export default new StudentService(repository);
