import Module from "./model";
import moduleService from "./service";
import moduleController from "./controller";
import moduleRepository from "./repository";
import moduleValidationSchemas from "./validation";
import moduleRoutes from "./routes";
import { ModuleInterface, ModuleDeletionResult } from "./interfaces/interfaces";
import {
  ModuleBaseDTO,
  ModuleDetailDTO,
  ModuleSimpleDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  ModuleListQueryParams,
  PaginatedModuleListDTO,
  BulkCreateModuleDTO,
  BulkDeleteModuleDTO,
  ModuleDTOMapper,
} from "./dto";
import { IModuleRepository, IModuleService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Module,
  moduleService,
  moduleController,
  moduleRepository,
  moduleValidationSchemas,
  moduleRoutes,
  ModuleInterface,
  ModuleDeletionResult,
  ModuleBaseDTO,
  ModuleDetailDTO,
  ModuleSimpleDTO,
  CreateModuleDTO,
  UpdateModuleDTO,
  ModuleListQueryParams,
  PaginatedModuleListDTO,
  BulkCreateModuleDTO,
  BulkDeleteModuleDTO,
  ModuleDTOMapper,
  IModuleRepository,
  IModuleService,
};

export default Module;
