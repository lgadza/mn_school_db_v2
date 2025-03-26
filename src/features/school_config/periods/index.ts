import Period from "./model";
import periodService from "./service";
import periodController from "./controller";
import periodRepository from "./repository";
import periodValidationSchemas from "./validation";
import periodRoutes from "./routes";
import { PeriodInterface, PeriodStatistics } from "./interfaces/interfaces";
import {
  PeriodBaseDTO,
  PeriodDetailDTO,
  PeriodSimpleDTO,
  CreatePeriodDTO,
  UpdatePeriodDTO,
  PeriodListQueryParams,
  PaginatedPeriodListDTO,
  PeriodDTOMapper,
  PeriodStatisticsDTO,
} from "./dto";
import { IPeriodRepository, IPeriodService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Period,
  periodService,
  periodController,
  periodRepository,
  periodValidationSchemas,
  periodRoutes,
  PeriodInterface,
  PeriodStatistics,
  PeriodBaseDTO,
  PeriodDetailDTO,
  PeriodSimpleDTO,
  CreatePeriodDTO,
  UpdatePeriodDTO,
  PeriodListQueryParams,
  PaginatedPeriodListDTO,
  PeriodStatisticsDTO,
  PeriodDTOMapper,
  IPeriodRepository,
  IPeriodService,
};

export default Period;
