import School from "./model";
import SchoolAddress from "./address-link.model";
import schoolService from "./service";
import schoolController from "./controller";
import schoolRepository from "./repository";
import schoolValidationSchemas from "./validation";
import schoolRoutes from "./routes";
import {
  SchoolInterface,
  SchoolLevel,
  SchoolType,
} from "./interfaces/interfaces";
import {
  SchoolBaseDTO,
  SchoolDetailDTO,
  SchoolSimpleDTO,
  CreateSchoolDTO,
  UpdateSchoolDTO,
  SchoolListQueryParams,
  PaginatedSchoolListDTO,
  SchoolDTOMapper,
} from "./dto";
import { ISchoolRepository, ISchoolService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  School,
  SchoolAddress,
  schoolService,
  schoolController,
  schoolRepository,
  schoolValidationSchemas,
  schoolRoutes,
  SchoolInterface,
  SchoolLevel,
  SchoolType,
  SchoolBaseDTO,
  SchoolDetailDTO,
  SchoolSimpleDTO,
  CreateSchoolDTO,
  UpdateSchoolDTO,
  SchoolListQueryParams,
  PaginatedSchoolListDTO,
  SchoolDTOMapper,
  ISchoolRepository,
  ISchoolService,
};

export default School;
