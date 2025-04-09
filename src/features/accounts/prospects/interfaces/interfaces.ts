import { Model } from "sequelize";
import User from "../../../users/model";
import School from "../../../schools/model";
import Role from "../../../rbac/models/roles.model";
import Address from "../../../address/model";

/**
 * Interface for the Prospect entity
 */
export interface ProspectInterface {
  id: string;
  userId: string;
  schoolId: string;
  roleId: string;
  addressId: string;
  interestLevel: string;
  contactDate: Date;
  notes: string | null;
  activeStatus: boolean;
  hasApplied: boolean; // Added hasApplied field
  createdAt: Date;
  updatedAt: Date;

  // Optional relations
  user?: User;
  school?: School;
  role?: Role;
  address?: Address;
}

/**
 * Interest level enumeration
 */
export enum InterestLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/**
 * Prospect statistics interface
 */
export interface ProspectStatistics {
  totalProspects: number;
  prospectsPerSchool: { [schoolId: string]: number };
  prospectsPerRole: { [roleId: string]: number };
  activeProspects: number;
  inactiveProspects: number;
  prospectsPerInterestLevel: { [level: string]: number };
  contactsByMonth: { [month: string]: number };
  contactsByYear: { [year: string]: number };
  appliedProspects?: number; // New field to track applied prospects
  notAppliedProspects?: number; // New field to track not applied prospects
}
