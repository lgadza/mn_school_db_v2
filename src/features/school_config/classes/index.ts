import Class from "./model";
import classService from "./service";
import classController from "./controller";
import classRepository from "./repository";
import classValidationSchemas from "./validation";
import classRoutes from "./routes";
import { ClassInterface, ClassStatistics } from "./interfaces/interfaces";
import {
  ClassBaseDTO,
  ClassDetailDTO,
  ClassSimpleDTO,
  CreateClassDTO,
  UpdateClassDTO,
  ClassListQueryParams,
  PaginatedClassListDTO,
  ClassDTOMapper,
  ClassStatisticsDTO,
} from "./dto";
import { IClassRepository, IClassService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Class,
  classService,
  classController,
  classRepository,
  classValidationSchemas,
  classRoutes,
  ClassInterface,
  ClassStatistics,
  ClassBaseDTO,
  ClassDetailDTO,
  ClassSimpleDTO,
  CreateClassDTO,
  UpdateClassDTO,
  ClassListQueryParams,
  PaginatedClassListDTO,
  ClassStatisticsDTO,
  ClassDTOMapper,
  IClassRepository,
  IClassService,
};

export default Class;
