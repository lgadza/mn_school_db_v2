import { SchoolInterface } from "./interfaces";
import {
  SchoolDetailDTO,
  CreateSchoolDTO,
  UpdateSchoolDTO,
  SchoolListQueryParams,
  PaginatedSchoolListDTO,
} from "../dto";
import { Transaction } from "sequelize";
import { CreateAddressDTO } from "../../address/dto";

export interface ISchoolRepository {
  /**
   * Find a school by ID
   */
  findSchoolById(id: string): Promise<SchoolInterface | null>;

  /**
   * Find a school by code
   */
  findSchoolByCode(code: string): Promise<SchoolInterface | null>;

  /**
   * Create a new school
   */
  createSchool(
    schoolData: CreateSchoolDTO,
    transaction?: Transaction
  ): Promise<SchoolInterface>;

  /**
   * Update a school
   */
  updateSchool(
    id: string,
    schoolData: UpdateSchoolDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a school
   */
  deleteSchool(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get school list with filtering and pagination
   */
  getSchoolList(params: SchoolListQueryParams): Promise<{
    schools: SchoolInterface[];
    total: number;
  }>;

  /**
   * Find schools by principal ID
   */
  findSchoolsByPrincipal(principalId: string): Promise<SchoolInterface[]>;

  /**
   * Find schools by administrator ID
   */
  findSchoolsByAdmin(adminId: string): Promise<SchoolInterface[]>;

  /**
   * Find schools by type
   */
  findSchoolsByType(schoolType: string): Promise<SchoolInterface[]>;

  /**
   * Find schools by level
   */
  findSchoolsByLevel(level: string): Promise<SchoolInterface[]>;

  /**
   * Check if a school code exists
   */
  isSchoolCodeTaken(code: string, excludeId?: string): Promise<boolean>;
}

export interface ISchoolService {
  /**
   * Get school by ID
   */
  getSchoolById(id: string): Promise<SchoolDetailDTO>;

  /**
   * Get school by code
   */
  getSchoolByCode(code: string): Promise<SchoolDetailDTO>;

  /**
   * Create a new school
   */
  createSchool(schoolData: CreateSchoolDTO): Promise<SchoolDetailDTO>;

  /**
   * Create a new school with an address
   */
  createSchoolWithAddress(
    schoolData: CreateSchoolDTO,
    addressData: CreateAddressDTO
  ): Promise<SchoolDetailDTO>;

  /**
   * Update a school
   */
  updateSchool(
    id: string,
    schoolData: UpdateSchoolDTO
  ): Promise<SchoolDetailDTO>;

  /**
   * Delete a school
   */
  deleteSchool(id: string): Promise<boolean>;

  /**
   * Get paginated school list
   */
  getSchoolList(params: SchoolListQueryParams): Promise<PaginatedSchoolListDTO>;

  /**
   * Get schools by principal
   */
  getSchoolsByPrincipal(principalId: string): Promise<SchoolDetailDTO[]>;

  /**
   * Get schools by administrator
   */
  getSchoolsByAdmin(adminId: string): Promise<SchoolDetailDTO[]>;

  /**
   * Generate a unique school code
   */
  generateSchoolCode(name: string, level: string): Promise<string>;

  /**
   * Validate school data
   */
  validateSchoolData(
    schoolData: CreateSchoolDTO | UpdateSchoolDTO
  ): Promise<boolean>;
}
