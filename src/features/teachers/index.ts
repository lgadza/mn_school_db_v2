import Teacher from "./model";
import teacherService from "./service";
import teacherController from "./controller";
import teacherRepository from "./repository";
import teacherValidationSchemas from "./validation";
import teacherRoutes from "./routes";
import {
  TeacherInterface,
  TeacherSensitiveData,
  TeacherStatistics,
} from "./interfaces/interfaces";
import {
  TeacherBaseDTO,
  TeacherDetailDTO,
  TeacherSimpleDTO,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherListQueryParams,
  PaginatedTeacherListDTO,
  TeacherDTOMapper,
  TeacherStatisticsDTO,
} from "./dto";
import { ITeacherRepository, ITeacherService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Teacher,
  teacherService,
  teacherController,
  teacherRepository,
  teacherValidationSchemas,
  teacherRoutes,
  TeacherInterface,
  TeacherSensitiveData,
  TeacherStatistics,
  TeacherBaseDTO,
  TeacherDetailDTO,
  TeacherSimpleDTO,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherListQueryParams,
  PaginatedTeacherListDTO,
  TeacherStatisticsDTO,
  TeacherDTOMapper,
  ITeacherRepository,
  ITeacherService,
};

export default Teacher;
