import { BookLoanInterface } from "../interfaces/interfaces";

/**
 * Book loan DTO
 */
export interface BookLoanDTO {
  id: string;
  bookId: string;
  userId: string;
  rentalDate: string;
  checkoutDate: string; // Added missing property
  dueDate: string;
  returnDate: string | null;
  status: "active" | "returned" | "overdue";
  notes: string | null;
  lateFee: number | null;
  bookTitle?: string;
  userName?: string;
  rentalRuleId?: string;
  rentalRuleName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a book loan
 */
export interface CreateBookLoanDTO {
  bookId: string;
  userId: string;
  dueDate?: Date;
  notes?: string | null;
  rentalRuleId?: string;
}

/**
 * DTO for returning a book
 */
export interface ReturnBookLoanDTO {
  notes?: string | null;
  condition?: string;
  applyLateFee?: boolean;
}

/**
 * DTO for renewing a book loan
 */
export interface RenewBookLoanDTO {
  notes?: string | null;
  newDueDate?: Date;
}

/**
 * Query parameters for book loan list
 */
export interface BookLoanListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "active" | "returned" | "overdue";
  userId?: string;
  bookId?: string;
  schoolId?: string;
  fromDate?: string;
  toDate?: string;
  overdue?: boolean;
}

/**
 * Paginated book loan list response
 */
export interface PaginatedBookLoanListDTO {
  loans: BookLoanDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Book loan statistics DTO
 */
export interface BookLoanStatsDTO {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  topBorrowers: Array<{
    userId: string;
    userName: string;
    loanCount: number;
  }>;
  mostPopularBooks: Array<{
    bookId: string;
    bookTitle: string;
    loanCount: number;
  }>;
}

/**
 * Mapper class for book loan DTOs
 */
export class BookLoanDTOMapper {
  /**
   * Map BookLoan entity to DTO
   */
  public static toDTO(
    loan: BookLoanInterface & {
      bookTitle?: string;
      userName?: string;
      rentalRuleId?: string;
      rentalRuleName?: string;
    }
  ): BookLoanDTO {
    return {
      id: loan.id,
      bookId: loan.bookId,
      userId: loan.userId,
      rentalDate: loan.rentalDate.toISOString(),
      checkoutDate: loan.rentalDate.toISOString(), // Map rentalDate to checkoutDate
      dueDate: loan.dueDate.toISOString(),
      returnDate: loan.returnDate ? loan.returnDate.toISOString() : null,
      status: loan.status,
      notes: loan.notes,
      lateFee: loan.lateFee || null,
      bookTitle: loan.bookTitle,
      userName: loan.userName,
      rentalRuleId: loan.rentalRuleId,
      rentalRuleName: loan.rentalRuleName,
      createdAt: loan.createdAt
        ? loan.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: loan.updatedAt
        ? loan.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
