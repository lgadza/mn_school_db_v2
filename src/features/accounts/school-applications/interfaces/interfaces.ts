import { Model } from "sequelize";
import Prospect from "../../prospects/model";
import School from "../../../schools/model";
import User from "../../../users/model";

/**
 * Interface for the SchoolApplication entity
 */
export interface SchoolApplicationInterface {
  id: string;
  prospectId: string;
  schoolId: string;
  applicationDate: Date;
  status: string;
  applicationDocumentIds: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Optional relations
  prospect?: Prospect;
  school?: School;
}

/**
 * Application status enumeration
 */
export enum ApplicationStatus {
  SUBMITTED = "submitted",
  REVIEWING = "reviewing",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WAITLISTED = "waitlisted",
}

/**
 * School application statistics interface
 */
export interface SchoolApplicationStatistics {
  totalApplications: number;
  applicationsBySchool: { [schoolId: string]: number };
  applicationsByStatus: { [status: string]: number };
  applicationsPerMonth: { [month: string]: number };
  applicationsPerYear: { [year: string]: number };
  applicationsPerInterestLevel: { [level: string]: number };
  averageApplicationsPerProspect: number;
  multipleApplicationsCount: number; // Number of prospects who applied to multiple schools
  schoolsWithMostApplications: Array<{ schoolId: string; count: number }>;
}

/**
 * Prospect application details interface
 */
export interface ProspectApplicationsDetail {
  prospectId: string;
  userId: string;
  userName: string;
  schoolCount: number;
  applications: (SchoolApplicationInterface & { applicationDate: Date })[];
}

/**
 * School applicants statistics interface
 */
export interface SchoolApplicantsStatistics {
  schoolId: string;
  schoolName: string;
  totalApplicants: number;
  applicantsByStatus: { [status: string]: number };
  applicantsByInterestLevel: { [level: string]: number };
  applicantsPerMonth: { [month: string]: number };
  applicantsPerYear: { [year: string]: number };
  acceptanceRate: number;
}
