import Student from "./model";
import studentService from "./service";
import studentController from "./controller";
import studentRepository from "./repository";
import studentValidationSchemas from "./validation";
import studentRoutes from "./routes";
import {
  StudentInterface,
  StudentStatistics,
  GuardianInfo,
  HealthInfo,
  PreviousSchoolInfo,
  AcademicRecord,
} from "./interfaces/interfaces";
import {
  StudentBaseDTO,
  StudentDetailDTO,
  StudentSimpleDTO,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentListQueryParams,
  PaginatedStudentListDTO,
  StudentDTOMapper,
  StudentStatisticsDTO,
} from "./dto";
import { IStudentRepository, IStudentService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Student,
  studentService,
  studentController,
  studentRepository,
  studentValidationSchemas,
  studentRoutes,
  StudentInterface,
  StudentStatistics,
  GuardianInfo,
  HealthInfo,
  PreviousSchoolInfo,
  AcademicRecord,
  StudentBaseDTO,
  StudentDetailDTO,
  StudentSimpleDTO,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentListQueryParams,
  PaginatedStudentListDTO,
  StudentStatisticsDTO,
  StudentDTOMapper,
  IStudentRepository,
  IStudentService,
};

export default Student;
