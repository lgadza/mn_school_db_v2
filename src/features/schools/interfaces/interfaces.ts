/**
 * School level types
 */
export type SchoolLevel =
  | "primary"
  | "secondary"
  | "high"
  | "tertiary"
  | "quaternary";

/**
 * School type options
 */
export type SchoolType = "day" | "boarding" | "both";

/**
 * Base School interface
 */
export interface SchoolInterface {
  id: string;
  name: string;
  level: SchoolLevel;
  isPublic: boolean;
  motto: string | null;
  principalId: string;
  adminId: string | null;
  addressId: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  shortName: string;
  capacity: string | null;
  yearOpened: number;
  schoolCode: string;
  schoolType: SchoolType;
  contactNumber: string;
  email: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Add optional address property for Sequelize associations
  address?: any; // This will hold the related Address model
  addresses?: any[]; // This will hold the related SchoolAddress models
}
