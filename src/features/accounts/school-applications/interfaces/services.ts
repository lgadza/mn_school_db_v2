import { Transaction } from "sequelize";
import {
  SchoolApplicationInterface,
  SchoolApplicationStatistics,
  ProspectApplicationsDetail,
  SchoolApplicantsStatistics,
} from "./interfaces";
import {
  SchoolApplicationDetailDTO,
  CreateSchoolApplicationDTO,
  UpdateSchoolApplicationDTO,
  PaginatedSchoolApplicationListDTO,
  SchoolApplicationListQueryParams,
} from "../dto";

/**
 * Interface for SchoolApplication Repository
 */
export interface ISchoolApplicationRepository {
  findApplicationById(id: string): Promise<SchoolApplicationInterface | null>;
  findApplicationsByProspectId(
    prospectId: string
  ): Promise<SchoolApplicationInterface[]>;
  findApplicationsBySchoolId(
    schoolId: string
  ): Promise<SchoolApplicationInterface[]>;
  createApplication(
    applicationData: CreateSchoolApplicationDTO,
    transaction?: Transaction
  ): Promise<SchoolApplicationInterface>;
  updateApplication(
    id: string,
    applicationData: UpdateSchoolApplicationDTO,
    transaction?: Transaction
  ): Promise<boolean>;
  deleteApplication(id: string, transaction?: Transaction): Promise<boolean>;
  getApplicationList(params: SchoolApplicationListQueryParams): Promise<{
    applications: SchoolApplicationInterface[];
    total: number;
  }>;
  getApplicationsByStatus(
    status: string
  ): Promise<SchoolApplicationInterface[]>;
  getApplicationStatistics(): Promise<SchoolApplicationStatistics>;
  getProspectApplications(
    prospectId: string
  ): Promise<ProspectApplicationsDetail | null>;
  getSchoolApplicantsStatistics(
    schoolId: string
  ): Promise<SchoolApplicantsStatistics>;
  getProspectsWithMultipleApplications(): Promise<ProspectApplicationsDetail[]>;
}

/**
 * Interface for SchoolApplication Service
 */
export interface ISchoolApplicationService {
  getApplicationById(id: string): Promise<SchoolApplicationDetailDTO>;
  getApplicationsByProspectId(
    prospectId: string
  ): Promise<SchoolApplicationDetailDTO[]>;
  getApplicationsBySchoolId(
    schoolId: string
  ): Promise<SchoolApplicationDetailDTO[]>;
  createApplication(
    applicationData: CreateSchoolApplicationDTO
  ): Promise<SchoolApplicationDetailDTO>;
  updateApplication(
    id: string,
    applicationData: UpdateSchoolApplicationDTO
  ): Promise<SchoolApplicationDetailDTO>;
  deleteApplication(id: string): Promise<boolean>;
  getApplicationList(
    params: SchoolApplicationListQueryParams
  ): Promise<PaginatedSchoolApplicationListDTO>;
  getApplicationsByStatus(
    status: string
  ): Promise<SchoolApplicationDetailDTO[]>;
  getApplicationStatistics(): Promise<SchoolApplicationStatistics>;
  getProspectApplications(
    prospectId: string
  ): Promise<ProspectApplicationsDetail>;
  getSchoolApplicantsStatistics(
    schoolId: string
  ): Promise<SchoolApplicantsStatistics>;
  getProspectsWithMultipleApplications(): Promise<ProspectApplicationsDetail[]>;
  updateProspectHasAppliedStatus(prospectId: string): Promise<boolean>;
}
