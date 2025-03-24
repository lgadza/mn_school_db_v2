import {
  BookInterface,
  BookStatus,
  AvailabilityStatus,
} from "../interfaces/interfaces";
import {
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookLoanDTO as ReturnBookDTO,
} from "../loans/dto"; // Import loan DTOs from loans/dto

/**
 * Base DTO for book information
 */
export interface BookBaseDTO {
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
  availabilityStatus: AvailabilityStatus;
}

/**
 * Detailed book DTO with timestamps
 */
export interface BookDetailDTO extends BookBaseDTO {
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple book DTO without timestamps
 */
export interface BookSimpleDTO extends BookBaseDTO {}

/**
 * DTO for creating a new book
 */
export interface CreateBookDTO {
  title: string;
  genre: string;
  available?: boolean;
  publishYear?: string | null;
  author?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  copiesAvailable?: number;
  copiesTotal?: number;
  isbn?: string | null;
  schoolId: string;
  publisher?: string | null;
  language?: string;
  pageCount?: number | null;
  deweyDecimal?: string | null;
  tags?: string[] | null;
  status?: BookStatus;
}

/**
 * DTO for updating a book
 */
export interface UpdateBookDTO {
  title?: string;
  genre?: string;
  available?: boolean;
  publishYear?: string | null;
  author?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  copiesAvailable?: number;
  copiesTotal?: number;
  isbn?: string | null;
  publisher?: string | null;
  language?: string;
  pageCount?: number | null;
  deweyDecimal?: string | null;
  tags?: string[] | null;
  status?: BookStatus;
}

/**
 * Query parameters for book list
 */
export interface BookListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  genre?: string;
  author?: string;
  publishYear?: string;
  available?: boolean;
  schoolId?: string;
  status?: BookStatus;
  language?: string;
}

/**
 * Paginated book list response
 */
export interface PaginatedBookListDTO {
  books: BookDetailDTO[];
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
 * Book review DTO
 */
export interface BookReviewDTO {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a book review
 */
export interface CreateBookReviewDTO {
  bookId: string;
  userId: string;
  rating: number;
  review?: string | null;
}

/**
 * Mapper class for converting between Book entities and DTOs
 */
export class BookDTOMapper {
  /**
   * Map Book entity to BaseDTO
   */
  public static toBaseDTO(book: BookInterface): BookBaseDTO {
    // Calculate availability status
    let availabilityStatus = AvailabilityStatus.AVAILABLE;
    if (!book.available) {
      availabilityStatus = AvailabilityStatus.CHECKED_OUT;
    } else if (book.copiesAvailable === 0 && book.copiesTotal > 0) {
      availabilityStatus = AvailabilityStatus.CHECKED_OUT;
    } else if (book.status === BookStatus.ACTIVE && book.copiesAvailable > 0) {
      availabilityStatus = AvailabilityStatus.AVAILABLE;
    } else if (book.status !== BookStatus.ACTIVE) {
      availabilityStatus = AvailabilityStatus.PROCESSING;
    }

    return {
      id: book.id,
      title: book.title,
      genre: book.genre,
      available: book.available,
      publishYear: book.publishYear,
      author: book.author,
      coverUrl: book.coverUrl,
      description: book.description,
      copiesAvailable: book.copiesAvailable,
      copiesTotal: book.copiesTotal,
      isbn: book.isbn,
      schoolId: book.schoolId,
      publisher: book.publisher,
      language: book.language,
      pageCount: book.pageCount,
      deweyDecimal: book.deweyDecimal,
      tags: book.tags,
      status: book.status,
      availabilityStatus,
    };
  }

  /**
   * Map Book entity to DetailDTO
   */
  public static toDetailDTO(book: BookInterface): BookDetailDTO {
    return {
      ...this.toBaseDTO(book),
      createdAt: book.createdAt
        ? book.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: book.updatedAt
        ? book.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }

  /**
   * Map Book entity to SimpleDTO
   */
  public static toSimpleDTO(book: BookInterface): BookSimpleDTO {
    return this.toBaseDTO(book);
  }
}

// Export the imported types for backwards compatibility
export { BookLoanDTO, CreateBookLoanDTO, ReturnBookDTO };
