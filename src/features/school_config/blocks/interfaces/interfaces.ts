/**
 * Block interface
 * Defines the core structure of a block (building/wing)
 */
export interface BlockInterface {
  id: string;
  schoolId: string;
  name: string; // e.g., "A Block", "Science Wing", "Main Building"
  numberOfClassrooms: number;
  details: string | null;
  location: string | null; // e.g., "North Campus", "East Wing"
  yearBuilt: number | null;
  status: string | null; // 'active', 'inactive', 'maintenance', 'planned', 'demolished'
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
}

/**
 * Block statistics interface
 */
export interface BlockStatistics {
  totalBlocks: number;
  blocksPerSchool: { [schoolId: string]: number };
  totalClassrooms: number;
  averageClassroomsPerBlock: number;
  blocksByStatus: { [status: string]: number };
  oldestBlock: {
    id: string;
    name: string;
    yearBuilt: number;
  } | null;
  newestBlock: {
    id: string;
    name: string;
    yearBuilt: number;
  } | null;
}
