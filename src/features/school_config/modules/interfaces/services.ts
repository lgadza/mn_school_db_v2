import { Transaction } from "sequelize";
import { ModuleInterface, ModuleDeletionResult } from "./interfaces";
import {
  CreateModuleDTO,
  UpdateModuleDTO,
  ModuleDetailDTO,
  ModuleListQueryParams,
  PaginatedModuleListDTO,
  BulkCreateModuleDTO,
  BulkDeleteModuleDTO,
} from "../dto";

export interface IModuleRepository {
  /**
   * Find a module by ID
   */
  findModuleById(id: string): Promise<ModuleInterface | null>;

  /**
   * Find modules by class ID
   */
  findModulesByClassId(classId: string): Promise<ModuleInterface[]>;

  /**
   * Find modules by subject ID
   */
  findModulesBySubjectId(subjectId: string): Promise<ModuleInterface[]>;

  /**
   * Find modules by teacher ID
   */
  findModulesByTeacherId(teacherId: string): Promise<ModuleInterface[]>;

  /**
   * Find modules by school ID
   */
  findModulesBySchoolId(schoolId: string): Promise<ModuleInterface[]>;

  /**
   * Create a new module
   */
  createModule(
    moduleData: CreateModuleDTO,
    transaction?: Transaction
  ): Promise<ModuleInterface>;

  /**
   * Bulk create modules
   */
  bulkCreateModules(
    modulesData: BulkCreateModuleDTO[],
    transaction?: Transaction
  ): Promise<ModuleInterface[]>;

  /**
   * Update a module
   */
  updateModule(
    id: string,
    moduleData: UpdateModuleDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a module
   */
  deleteModule(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Bulk delete modules
   */
  bulkDeleteModules(
    criteria: BulkDeleteModuleDTO,
    transaction?: Transaction
  ): Promise<ModuleDeletionResult>;

  /**
   * Get module list with filtering and pagination
   */
  getModuleList(params: ModuleListQueryParams): Promise<{
    modules: ModuleInterface[];
    total: number;
  }>;

  /**
   * Check if a module name exists for a class
   */
  isModuleNameTakenInClass(
    name: string,
    classId: string,
    excludeId?: string
  ): Promise<boolean>;
}

export interface IModuleService {
  /**
   * Get module by ID
   */
  getModuleById(id: string): Promise<ModuleDetailDTO>;

  /**
   * Get modules by class ID
   */
  getModulesByClassId(classId: string): Promise<ModuleDetailDTO[]>;

  /**
   * Get modules by subject ID
   */
  getModulesBySubjectId(subjectId: string): Promise<ModuleDetailDTO[]>;

  /**
   * Get modules by teacher ID
   */
  getModulesByTeacherId(teacherId: string): Promise<ModuleDetailDTO[]>;

  /**
   * Create a new module
   */
  createModule(moduleData: CreateModuleDTO): Promise<ModuleDetailDTO>;

  /**
   * Bulk create modules
   */
  bulkCreateModules(
    modulesData: BulkCreateModuleDTO[]
  ): Promise<ModuleDetailDTO[]>;

  /**
   * Update a module
   */
  updateModule(
    id: string,
    moduleData: UpdateModuleDTO
  ): Promise<ModuleDetailDTO>;

  /**
   * Delete a module
   */
  deleteModule(id: string): Promise<boolean>;

  /**
   * Bulk delete modules
   */
  bulkDeleteModules(
    criteria: BulkDeleteModuleDTO
  ): Promise<ModuleDeletionResult>;

  /**
   * Get paginated module list
   */
  getModuleList(params: ModuleListQueryParams): Promise<PaginatedModuleListDTO>;

  /**
   * Validate module data
   */
  validateModuleData(
    moduleData: CreateModuleDTO | UpdateModuleDTO,
    moduleId?: string
  ): Promise<boolean>;
}
