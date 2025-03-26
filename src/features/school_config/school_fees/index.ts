import SchoolFee from "./model";
import schoolFeeService from "./service";
import schoolFeeController from "./controller";
import schoolFeeRepository from "./repository";
import schoolFeeValidationSchemas from "./validation";
import schoolFeeRoutes from "./routes";
import {
  SchoolFeeInterface,
  SchoolFeeStatistics,
} from "./interfaces/interfaces";
import {
  SchoolFeeBaseDTO,
  SchoolFeeDetailDTO,
  SchoolFeeSimpleDTO,
  CreateSchoolFeeDTO,
  UpdateSchoolFeeDTO,
  SchoolFeeListQueryParams,
  PaginatedSchoolFeeListDTO,
  SchoolFeeDTOMapper,
  SchoolFeeStatisticsDTO,
} from "./dto";
import { ISchoolFeeRepository, ISchoolFeeService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  SchoolFee,
  schoolFeeService,
  schoolFeeController,
  schoolFeeRepository,
  schoolFeeValidationSchemas,
  schoolFeeRoutes,
  SchoolFeeInterface,
  SchoolFeeStatistics,
  SchoolFeeBaseDTO,
  SchoolFeeDetailDTO,
  SchoolFeeSimpleDTO,
  CreateSchoolFeeDTO,
  UpdateSchoolFeeDTO,
  SchoolFeeListQueryParams,
  PaginatedSchoolFeeListDTO,
  SchoolFeeDTOMapper,
  SchoolFeeStatisticsDTO,
  ISchoolFeeRepository,
  ISchoolFeeService,
};

export default SchoolFee;
