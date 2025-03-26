/**
 * SchoolFee interface
 * Defines the core structure of a school fee
 */
export interface SchoolFeeInterface {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: string;
  dueDate: Date | null;
  isOptional: boolean;
  appliesTo: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  category: string;
  lateFee: number | null;
  discountEligible: boolean;
  taxable: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Related entities from associations
  school?: any;
}

/**
 * School fee statistics interface
 */
export interface SchoolFeeStatistics {
  totalFees: number;
  feesPerSchool: { [schoolId: string]: number };
  feesByCategory: { [category: string]: number };
  feesByFrequency: { [frequency: string]: number };
  feesByStatus: { [status: string]: number };
  averageAmount: number;
  highestFee: {
    name: string;
    amount: number;
    currency: string;
    schoolId: string;
  };
  lowestFee: {
    name: string;
    amount: number;
    currency: string;
    schoolId: string;
  };
}
