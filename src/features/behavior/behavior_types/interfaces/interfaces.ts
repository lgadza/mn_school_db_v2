/**
 * BehaviorType interface
 * Defines the core structure of a behavior type
 */
export interface BehaviorTypeInterface {
  id: string;
  description: string;
  category: "POSITIVE" | "NEGATIVE";
  schoolId: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
}

/**
 * BehaviorType statistics interface
 */
export interface BehaviorTypeStatistics {
  totalBehaviorTypes: number;
  behaviorTypesPerSchool: { [schoolId: string]: number };
  behaviorTypesByCategory: { POSITIVE: number; NEGATIVE: number };
  mostCommonBehaviorTypes: Array<{
    id: string;
    description: string;
    category: string;
    count: number;
  }>;
}
