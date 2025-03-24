import Department from "./model";
import departmentService from "./service";
import departmentController from "./controller";
import departmentRepository from "./repository";
import departmentValidationSchemas from "./validation";
import departmentRoutes from "./routes";
import {
  DepartmentInterface,
  DepartmentStatistics,
} from "./interfaces/interfaces";
import {
  DepartmentBaseDTO,
  DepartmentDetailDTO,
  DepartmentSimpleDTO,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentListQueryParams,
  PaginatedDepartmentListDTO,
  DepartmentDTOMapper,
  DepartmentStatisticsDTO,
} from "./dto";
import {
  IDepartmentRepository,
  IDepartmentService,
} from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Department,
  departmentService,
  departmentController,
  departmentRepository,
  departmentValidationSchemas,
  departmentRoutes,
  DepartmentInterface,
  DepartmentStatistics,
  DepartmentBaseDTO,
  DepartmentDetailDTO,
  DepartmentSimpleDTO,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentListQueryParams,
  PaginatedDepartmentListDTO,
  DepartmentStatisticsDTO,
  DepartmentDTOMapper,
  IDepartmentRepository,
  IDepartmentService,
};

export default Department;
