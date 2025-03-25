import BehaviorType from "./model";
import behaviorTypeService from "./service";
import behaviorTypeController from "./controller";
import behaviorTypeRepository from "./repository";
import behaviorTypeValidationSchemas from "./validation";
import behaviorTypeRoutes from "./routes";
import {
  BehaviorTypeInterface,
  BehaviorTypeStatistics,
} from "./interfaces/interfaces";
import {
  BehaviorTypeBaseDTO,
  BehaviorTypeDetailDTO,
  BehaviorTypeSimpleDTO,
  CreateBehaviorTypeDTO,
  UpdateBehaviorTypeDTO,
  BehaviorTypeListQueryParams,
  PaginatedBehaviorTypeListDTO,
  BehaviorTypeDTOMapper,
  BehaviorTypeStatisticsDTO,
} from "./dto";
import {
  IBehaviorTypeRepository,
  IBehaviorTypeService,
} from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  BehaviorType,
  behaviorTypeService,
  behaviorTypeController,
  behaviorTypeRepository,
  behaviorTypeValidationSchemas,
  behaviorTypeRoutes,
  BehaviorTypeInterface,
  BehaviorTypeStatistics,
  BehaviorTypeBaseDTO,
  BehaviorTypeDetailDTO,
  BehaviorTypeSimpleDTO,
  CreateBehaviorTypeDTO,
  UpdateBehaviorTypeDTO,
  BehaviorTypeListQueryParams,
  PaginatedBehaviorTypeListDTO,
  BehaviorTypeStatisticsDTO,
  BehaviorTypeDTOMapper,
  IBehaviorTypeRepository,
  IBehaviorTypeService,
};

export default BehaviorType;
