/**
 * Book status enum
 */
export enum BookStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  LOST = "lost",
  DAMAGED = "damaged",
}

/**
 * Book availability status
 */
export enum AvailabilityStatus {
  AVAILABLE = "available",
  CHECKED_OUT = "checked_out",
  ON_HOLD = "on_hold",
  PROCESSING = "processing",
}

/**
 * Base Book interface
 */
export interface BookInterface {
  id: string;
  title: string;
  genre: string;
  available: boolean;
  publishYear: string | null;
  author: string | null;
  coverUrl: string | null;
  description: string | null;
  copiesAvailable: number;
  copiesTotal: number;
  isbn: string | null;
  schoolId: string;
  publisher: string | null;
  language: string;
  pageCount: number | null;
  deweyDecimal: string | null;
  tags: string[] | null;
  status: BookStatus;
  createdAt?: Date;
  updatedAt?: Date;

  // Helper methods
  isAvailable(): boolean;
  getAvailabilitySummary?(): string;
}

/**
 * Book loan history interface
 */
export interface BookLoanInterface {
  id: string;
  bookId: string;
  userId: string;
  rentalDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: "active" | "returned" | "overdue";
  notes: string | null;
  lateFee?: number | null;
  rentalRuleId?: string; // Added missing property
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Book review interface
 */
export interface BookReviewInterface {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  review: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
