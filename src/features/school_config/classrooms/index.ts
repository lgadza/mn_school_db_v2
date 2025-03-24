import Classroom from "./model";
import classroomService from "./service";
import classroomController from "./controller";
import classroomRepository from "./repository";
import classroomValidationSchemas from "./validation";
import classroomRoutes from "./routes";
import {
  ClassroomInterface,
  ClassroomStatistics,
} from "./interfaces/interfaces";
import {
  ClassroomBaseDTO,
  ClassroomDetailDTO,
  ClassroomSimpleDTO,
  CreateClassroomDTO,
  UpdateClassroomDTO,
  ClassroomListQueryParams,
  PaginatedClassroomListDTO,
  ClassroomDTOMapper,
  ClassroomStatisticsDTO,
} from "./dto";
import { IClassroomRepository, IClassroomService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Classroom,
  classroomService,
  classroomController,
  classroomRepository,
  classroomValidationSchemas,
  classroomRoutes,
  ClassroomInterface,
  ClassroomStatistics,
  ClassroomBaseDTO,
  ClassroomDetailDTO,
  ClassroomSimpleDTO,
  CreateClassroomDTO,
  UpdateClassroomDTO,
  ClassroomListQueryParams,
  PaginatedClassroomListDTO,
  ClassroomStatisticsDTO,
  ClassroomDTOMapper,
  IClassroomRepository,
  IClassroomService,
};

export default Classroom;
