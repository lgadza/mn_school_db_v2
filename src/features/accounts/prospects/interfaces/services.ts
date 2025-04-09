import { Transaction } from "sequelize";
import { ProspectInterface, ProspectStatistics } from "./interfaces";
import {
  ProspectDetailDTO,
  CreateProspectDTO,
  UpdateProspectDTO,
  PaginatedProspectListDTO,
  ProspectListQueryParams,
} from "../dto";
import {
  SchoolApplicationStatistics,
  ProspectApplicationsDetail,
} from "../../school-applications/interfaces/interfaces";

/**
 * Interface for Prospect Repository
 */
export interface IProspectRepository {
  findProspectById(id: string): Promise<ProspectInterface | null>;
  findProspectByUserId(userId: string): Promise<ProspectInterface | null>;
  createProspect(
    prospectData: CreateProspectDTO,
    transaction?: Transaction
  ): Promise<ProspectInterface>;
  updateProspect(
    id: string,
    prospectData: UpdateProspectDTO,
    transaction?: Transaction
  ): Promise<boolean>;
  deleteProspect(id: string, transaction?: Transaction): Promise<boolean>;
  getProspectList(params: ProspectListQueryParams): Promise<{
    prospects: ProspectInterface[];
    total: number;
  }>;
  findProspectsBySchool(schoolId: string): Promise<ProspectInterface[]>;
  findProspectsByRole(roleId: string): Promise<ProspectInterface[]>;
  findProspectsByInterestLevel(
    interestLevel: string
  ): Promise<ProspectInterface[]>;
  getProspectStatistics(): Promise<ProspectStatistics>;
  getProspectApplicationStatistics(): Promise<SchoolApplicationStatistics>;
  getProspectsWithMultipleApplications(): Promise<ProspectInterface[]>;
  updateHasAppliedStatus(
    prospectId: string,
    hasApplied: boolean,
    transaction?: Transaction
  ): Promise<boolean>;
}

/**
 * Interface for Prospect Service
 */
export interface IProspectService {
  getProspectById(id: string): Promise<ProspectDetailDTO>;
  getProspectByUserId(userId: string): Promise<ProspectDetailDTO>;
  createProspect(prospectData: CreateProspectDTO): Promise<ProspectDetailDTO>;
  updateProspect(
    id: string,
    prospectData: UpdateProspectDTO
  ): Promise<ProspectDetailDTO>;
  deleteProspect(id: string): Promise<boolean>;
  getProspectList(
    params: ProspectListQueryParams
  ): Promise<PaginatedProspectListDTO>;
  getProspectsBySchool(schoolId: string): Promise<ProspectDetailDTO[]>;
  getProspectsByRole(roleId: string): Promise<ProspectDetailDTO[]>;
  getProspectsByInterestLevel(
    interestLevel: string
  ): Promise<ProspectDetailDTO[]>;
  getProspectStatistics(): Promise<ProspectStatistics>;
  validateProspectData(
    prospectData: CreateProspectDTO | UpdateProspectDTO
  ): Promise<boolean>;
  getProspectApplicationStatistics(): Promise<SchoolApplicationStatistics>;
  getProspectsWithMultipleApplications(): Promise<ProspectApplicationsDetail[]>;
  updateHasAppliedStatus(
    prospectId: string,
    hasApplied: boolean
  ): Promise<boolean>;
}
