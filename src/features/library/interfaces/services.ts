import { BookInterface, BookStatus } from "./interfaces";
import {
  BookDetailDTO,
  CreateBookDTO,
  UpdateBookDTO,
  BookListQueryParams,
  PaginatedBookListDTO,
} from "../books/dto";
import {
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookLoanDTO,
  RenewBookLoanDTO,
  BookLoanListQueryParams,
  PaginatedBookLoanListDTO,
  BookLoanStatsDTO,
} from "../loans/dto"; // Import from loans/dto instead of books/dto
import { Transaction } from "sequelize";

export interface IBookRepository {
  /**
   * Find a book by ID
   */
  findBookById(id: string): Promise<BookInterface | null>;

  /**
   * Find a book by ISBN
   */
  findBookByISBN(isbn: string, schoolId: string): Promise<BookInterface | null>;

  /**
   * Create a new book
   */
  createBook(
    bookData: CreateBookDTO,
    transaction?: Transaction
  ): Promise<BookInterface>;

  /**
   * Update a book
   */
  updateBook(
    id: string,
    bookData: UpdateBookDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a book
   */
  deleteBook(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Change book status
   */
  changeBookStatus(
    id: string,
    status: BookStatus,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Get book list with filtering and pagination
   */
  getBookList(params: BookListQueryParams): Promise<{
    books: BookInterface[];
    total: number;
  }>;

  /**
   * Find books by school ID
   */
  findBooksBySchool(
    schoolId: string,
    params?: BookListQueryParams
  ): Promise<{
    books: BookInterface[];
    total: number;
  }>;

  /**
   * Find books by genre
   */
  findBooksByGenre(
    genre: string,
    schoolId: string,
    params?: BookListQueryParams
  ): Promise<{
    books: BookInterface[];
    total: number;
  }>;

  /**
   * Search books
   */
  searchBooks(
    query: string,
    schoolId: string,
    params?: BookListQueryParams
  ): Promise<{
    books: BookInterface[];
    total: number;
  }>;

  /**
   * Check out a book (decrease available copies)
   */
  checkoutBook(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Check in a book (increase available copies)
   */
  checkinBook(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Check if ISBN exists
   */
  isISBNTaken(
    isbn: string,
    schoolId: string,
    excludeId?: string
  ): Promise<boolean>;
}

export interface IBookService {
  /**
   * Get book by ID
   */
  getBookById(id: string): Promise<BookDetailDTO>;

  /**
   * Get book by ISBN
   */
  getBookByISBN(isbn: string, schoolId: string): Promise<BookDetailDTO>;

  /**
   * Create a new book
   */
  createBook(bookData: CreateBookDTO): Promise<BookDetailDTO>;

  /**
   * Update a book
   */
  updateBook(id: string, bookData: UpdateBookDTO): Promise<BookDetailDTO>;

  /**
   * Delete a book
   */
  deleteBook(id: string): Promise<boolean>;

  /**
   * Change book status
   */
  changeBookStatus(id: string, status: BookStatus): Promise<BookDetailDTO>;

  /**
   * Get paginated book list
   */
  getBookList(params: BookListQueryParams): Promise<PaginatedBookListDTO>;

  /**
   * Get books by school
   */
  getBooksBySchool(
    schoolId: string,
    params?: BookListQueryParams
  ): Promise<PaginatedBookListDTO>;

  /**
   * Get books by genre
   */
  getBooksByGenre(
    genre: string,
    schoolId: string,
    params?: BookListQueryParams
  ): Promise<PaginatedBookListDTO>;

  /**
   * Search books
   */
  searchBooks(
    query: string,
    schoolId: string,
    params?: BookListQueryParams
  ): Promise<PaginatedBookListDTO>;

  /**
   * Validate book data
   */
  validateBookData(bookData: CreateBookDTO | UpdateBookDTO): Promise<boolean>;

  /**
   * Generate tags from book metadata
   */
  generateTags(bookData: CreateBookDTO | UpdateBookDTO): string[];
}

/**
 * Book Loan Service Interface
 */
export interface IBookLoanService {
  /**
   * Get loan by ID
   */
  getLoanById(id: string): Promise<BookLoanDTO>;

  /**
   * Create a new loan
   */
  createLoan(loanData: CreateBookLoanDTO): Promise<BookLoanDTO>;

  /**
   * Return a loan
   */
  returnLoan(id: string, returnData: ReturnBookLoanDTO): Promise<BookLoanDTO>;

  /**
   * Renew a loan
   */
  renewLoan(id: string, renewData: RenewBookLoanDTO): Promise<BookLoanDTO>;

  /**
   * Get user's active loans
   */
  getUserActiveLoans(
    userId: string,
    params?: BookLoanListQueryParams
  ): Promise<PaginatedBookLoanListDTO>;

  /**
   * Get user's loan history
   */
  getUserLoanHistory(
    userId: string,
    params?: BookLoanListQueryParams
  ): Promise<PaginatedBookLoanListDTO>;

  /**
   * Get book's loan history
   */
  getBookLoanHistory(
    bookId: string,
    params?: BookLoanListQueryParams
  ): Promise<PaginatedBookLoanListDTO>;

  /**
   * Get all loans
   */
  getAllLoans(
    params?: BookLoanListQueryParams
  ): Promise<PaginatedBookLoanListDTO>;

  /**
   * Get loan statistics
   */
  getLoanStatistics(
    schoolId?: string,
    fromDate?: string,
    toDate?: string,
    limit?: number
  ): Promise<BookLoanStatsDTO>;

  /**
   * Check out a book
   */
  checkoutBook(loanData: CreateBookLoanDTO): Promise<BookLoanDTO>;

  /**
   * Check in a book
   */
  checkinBook(id: string, returnData: ReturnBookLoanDTO): Promise<BookLoanDTO>;

  /**
   * Renew a book loan
   */
  renewBookLoan(id: string, renewData: RenewBookLoanDTO): Promise<BookLoanDTO>;
}
