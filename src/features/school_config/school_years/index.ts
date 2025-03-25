import SchoolYear from "./model";
import schoolYearService from "./service";
import schoolYearController from "./controller";
import schoolYearRepository from "./repository";
import schoolYearValidationSchemas from "./validation";
import schoolYearRoutes from "./routes";
import {
  SchoolYearInterface,
  SchoolYearStatus,
  SchoolYearStatistics,
} from "./interfaces/interfaces";
import {
  SchoolYearBaseDTO,
  SchoolYearDetailDTO,
  SchoolYearSimpleDTO,
  CreateSchoolYearDTO,
  UpdateSchoolYearDTO,
  SchoolYearListQueryParams,
  PaginatedSchoolYearListDTO,
  SchoolYearDTOMapper,
  SchoolYearStatisticsDTO,
} from "./dto";
import {
  ISchoolYearRepository,
  ISchoolYearService,
} from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  SchoolYear,
  schoolYearService,
  schoolYearController,
  schoolYearRepository,
  schoolYearValidationSchemas,
  schoolYearRoutes,
  SchoolYearInterface,
  SchoolYearStatus,
  SchoolYearStatistics,
  SchoolYearBaseDTO,
  SchoolYearDetailDTO,
  SchoolYearSimpleDTO,
  CreateSchoolYearDTO,
  UpdateSchoolYearDTO,
  SchoolYearListQueryParams,
  PaginatedSchoolYearListDTO,
  SchoolYearStatisticsDTO,
  SchoolYearDTOMapper,
  ISchoolYearRepository,
  ISchoolYearService,
};

export default SchoolYear;
