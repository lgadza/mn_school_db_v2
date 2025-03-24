import { SectionInterface, SectionStatistics } from "./interfaces";
import {
  CreateSectionDTO,
  SectionDetailDTO,
  SectionListQueryParams,
  PaginatedSectionListDTO,
  UpdateSectionDTO,
} from "../dto";
import { Transaction } from "sequelize";

/**
 * Section repository interface
 * Defines data access methods for sections
 */
export interface ISectionRepository {
  /**
   * Find a section by ID
   */
  findSectionById(id: string): Promise<SectionInterface | null>;

  /**
   * Create a new section
   */
  createSection(
    sectionData: CreateSectionDTO,
    transaction?: Transaction
  ): Promise<SectionInterface>;

  /**
   * Update a section
   */
  updateSection(
    id: string,
    sectionData: UpdateSectionDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a section
   */
  deleteSection(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get section list with filtering and pagination
   */
  getSectionList(params: SectionListQueryParams): Promise<{
    sections: SectionInterface[];
    total: number;
  }>;

  /**
   * Find sections by school ID
   */
  findSectionsBySchool(schoolId: string): Promise<SectionInterface[]>;

  /**
   * Get section statistics
   */
  getSectionStatistics(): Promise<SectionStatistics>;

  /**
   * Create multiple sections at once
   */
  createSectionsBulk(
    sectionsData: CreateSectionDTO[],
    transaction?: Transaction
  ): Promise<SectionInterface[]>;

  /**
   * Delete multiple sections at once
   */
  deleteSectionsBulk(ids: string[], transaction?: Transaction): Promise<number>;
}

/**
 * Section service interface
 * Defines business logic methods for sections
 */
export interface ISectionService {
  /**
   * Get section by ID
   */
  getSectionById(id: string): Promise<SectionDetailDTO>;

  /**
   * Create a new section
   */
  createSection(sectionData: CreateSectionDTO): Promise<SectionDetailDTO>;

  /**
   * Update a section
   */
  updateSection(
    id: string,
    sectionData: UpdateSectionDTO
  ): Promise<SectionDetailDTO>;

  /**
   * Delete a section
   */
  deleteSection(id: string): Promise<boolean>;

  /**
   * Get paginated section list
   */
  getSectionList(
    params: SectionListQueryParams
  ): Promise<PaginatedSectionListDTO>;

  /**
   * Get sections by school
   */
  getSectionsBySchool(schoolId: string): Promise<SectionDetailDTO[]>;

  /**
   * Validate section data
   */
  validateSectionData(
    sectionData: CreateSectionDTO | UpdateSectionDTO
  ): Promise<boolean>;

  /**
   * Get section statistics
   */
  getSectionStatistics(): Promise<SectionStatistics>;

  /**
   * Create multiple sections at once
   */
  createSectionsBulk(
    sectionsData: CreateSectionDTO[]
  ): Promise<SectionDetailDTO[]>;

  /**
   * Delete multiple sections at once
   */
  deleteSectionsBulk(ids: string[]): Promise<{
    success: boolean;
    count: number;
  }>;
}
