import Behavior from "./model";
import behaviorService from "./service";
import behaviorController from "./controller";
import behaviorRepository from "./repository";
import behaviorValidationSchemas from "./validation";
import behaviorRoutes from "./routes";
import { BehaviorInterface, BehaviorStatistics } from "./interfaces/interfaces";
import {
  BehaviorBaseDTO,
  BehaviorDetailDTO,
  BehaviorSimpleDTO,
  CreateBehaviorDTO,
  UpdateBehaviorDTO,
  BehaviorListQueryParams,
  PaginatedBehaviorListDTO,
  BehaviorDTOMapper,
  BehaviorStatisticsDTO,
} from "./dto";
import { IBehaviorRepository, IBehaviorService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Behavior,
  behaviorService,
  behaviorController,
  behaviorRepository,
  behaviorValidationSchemas,
  behaviorRoutes,
  BehaviorInterface,
  BehaviorStatistics,
  BehaviorBaseDTO,
  BehaviorDetailDTO,
  BehaviorSimpleDTO,
  CreateBehaviorDTO,
  UpdateBehaviorDTO,
  BehaviorListQueryParams,
  PaginatedBehaviorListDTO,
  BehaviorStatisticsDTO,
  BehaviorDTOMapper,
  IBehaviorRepository,
  IBehaviorService,
};

export default Behavior;
