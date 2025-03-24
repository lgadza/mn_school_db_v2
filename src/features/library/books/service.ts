import { IBookService, IBookRepository } from "../interfaces/services";
import {
  BookDetailDTO,
  CreateBookDTO,
  UpdateBookDTO,
  PaginatedBookListDTO,
  BookListQueryParams,
  BookDTOMapper,
  BookLoanDTO,
} from "./dto";
import bookRepository from "./repository";
import BookLoan from "../loans/model";
import Book from "./model";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import { BookStatus } from "../interfaces/interfaces";
import db from "@/config/database";
import School from "../../schools/model";
import User from "../../users/model";

export class BookService implements IBookService {
  private repository: IBookRepository;
  private readonly CACHE_PREFIX = "book:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  /**
   * Get book by ID
   */
  public async getBookById(id: string): Promise<BookDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedBook = await cache.get(cacheKey);

      if (cachedBook) {
        return JSON.parse(cachedBook);
      }

      // Get from database if not in cache
      const book = await this.repository.findBookById(id);
      if (!book) {
        throw new NotFoundError(`Book with ID ${id} not found`);
      }

      // Map to DTO
      const bookDTO = BookDTOMapper.toDetailDTO(book);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(bookDTO), this.CACHE_TTL);

      return bookDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBookById service:", error);
      throw new AppError("Failed to get book");
    }
  }

  /**
   * Get book by ISBN
   */
  public async getBookByISBN(
    isbn: string,
    schoolId: string
  ): Promise<BookDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}isbn:${isbn}:${schoolId}`;
      const cachedBook = await cache.get(cacheKey);

      if (cachedBook) {
        return JSON.parse(cachedBook);
      }

      // Get from database if not in cache
      const book = await this.repository.findBookByISBN(isbn, schoolId);
      if (!book) {
        throw new NotFoundError(
          `Book with ISBN ${isbn} not found in school ${schoolId}`
        );
      }

      // Map to DTO
      const bookDTO = BookDTOMapper.toDetailDTO(book);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(bookDTO), this.CACHE_TTL);

      return bookDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBookByISBN service:", error);
      throw new AppError("Failed to get book by ISBN");
    }
  }

  /**
   * Create a new book
   */
  public async createBook(bookData: CreateBookDTO): Promise<BookDetailDTO> {
    try {
      // Validate data
      await this.validateBookData(bookData);

      // Check if ISBN is already taken (if provided)
      if (bookData.isbn) {
        const isIsbnTaken = await this.repository.isISBNTaken(
          bookData.isbn,
          bookData.schoolId
        );
        if (isIsbnTaken) {
          throw new ConflictError(
            `Book with ISBN ${bookData.isbn} already exists in school ${bookData.schoolId}`
          );
        }
      }

      // Verify that school exists
      const school = await School.findByPk(bookData.schoolId);
      if (!school) {
        throw new BadRequestError(
          `School with ID ${bookData.schoolId} not found`
        );
      }

      // Set default values if not provided
      const processedData: CreateBookDTO = {
        ...bookData,
        available: bookData.available !== undefined ? bookData.available : true,
        copiesAvailable: bookData.copiesAvailable || 1,
        copiesTotal: bookData.copiesTotal || 1,
        language: bookData.language || "English",
        status: bookData.status || BookStatus.ACTIVE,
      };

      // Generate tags if not provided
      if (!processedData.tags) {
        processedData.tags = this.generateTags(processedData);
      }

      // Create the book
      const newBook = await this.repository.createBook(processedData);

      // Get the complete book
      const book = await this.repository.findBookById(newBook.id);
      if (!book) {
        throw new AppError("Failed to retrieve created book");
      }

      // Map to DTO
      return BookDTOMapper.toDetailDTO(book);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createBook service:", error);
      throw new AppError("Failed to create book");
    }
  }

  /**
   * Update a book
   */
  public async updateBook(
    id: string,
    bookData: UpdateBookDTO
  ): Promise<BookDetailDTO> {
    try {
      // Check if book exists
      const existingBook = await this.repository.findBookById(id);
      if (!existingBook) {
        throw new NotFoundError(`Book with ID ${id} not found`);
      }

      // Validate data
      await this.validateBookData(bookData);

      // Check if ISBN is already taken if changing
      if (bookData.isbn && bookData.isbn !== existingBook.isbn) {
        const isIsbnTaken = await this.repository.isISBNTaken(
          bookData.isbn,
          existingBook.schoolId,
          id
        );
        if (isIsbnTaken) {
          throw new ConflictError(
            `Book with ISBN ${bookData.isbn} already exists in school ${existingBook.schoolId}`
          );
        }
      }

      // Update book
      await this.repository.updateBook(id, bookData);

      // Clear cache
      await this.clearBookCache(id);
      if (existingBook.isbn) {
        await cache.del(
          `${this.CACHE_PREFIX}isbn:${existingBook.isbn}:${existingBook.schoolId}`
        );
      }
      if (bookData.isbn && bookData.isbn !== existingBook.isbn) {
        await cache.del(
          `${this.CACHE_PREFIX}isbn:${bookData.isbn}:${existingBook.schoolId}`
        );
      }

      // Get the updated book
      return this.getBookById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateBook service:", error);
      throw new AppError("Failed to update book");
    }
  }

  /**
   * Delete a book
   */
  public async deleteBook(id: string): Promise<boolean> {
    try {
      // Check if book exists
      const existingBook = await this.repository.findBookById(id);
      if (!existingBook) {
        throw new NotFoundError(`Book with ID ${id} not found`);
      }

      // Delete the book
      const result = await this.repository.deleteBook(id);

      // Clear cache
      await this.clearBookCache(id);
      if (existingBook.isbn) {
        await cache.del(
          `${this.CACHE_PREFIX}isbn:${existingBook.isbn}:${existingBook.schoolId}`
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteBook service:", error);
      throw new AppError("Failed to delete book");
    }
  }

  /**
   * Change book status
   */
  public async changeBookStatus(
    id: string,
    status: BookStatus
  ): Promise<BookDetailDTO> {
    try {
      // Check if book exists
      const existingBook = await this.repository.findBookById(id);
      if (!existingBook) {
        throw new NotFoundError(`Book with ID ${id} not found`);
      }

      // Change status
      await this.repository.changeBookStatus(id, status);

      // Clear cache
      await this.clearBookCache(id);

      // Get the updated book
      return this.getBookById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in changeBookStatus service:", error);
      throw new AppError("Failed to change book status");
    }
  }

  /**
   * Get paginated book list
   */
  public async getBookList(
    params: BookListQueryParams
  ): Promise<PaginatedBookListDTO> {
    try {
      const { books, total } = await this.repository.getBookList(params);

      // Map to DTOs
      const bookDTOs = books.map((book) => BookDTOMapper.toDetailDTO(book));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        books: bookDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBookList service:", error);
      throw new AppError("Failed to get book list");
    }
  }

  /**
   * Get books by school
   */
  public async getBooksBySchool(
    schoolId: string,
    params: BookListQueryParams = {}
  ): Promise<PaginatedBookListDTO> {
    try {
      // Check if school exists
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError(`School with ID ${schoolId} not found`);
      }

      const { books, total } = await this.repository.findBooksBySchool(
        schoolId,
        params
      );

      // Map to DTOs
      const bookDTOs = books.map((book) => BookDTOMapper.toDetailDTO(book));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        books: bookDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBooksBySchool service:", error);
      throw new AppError("Failed to get books by school");
    }
  }

  /**
   * Get books by genre
   */
  public async getBooksByGenre(
    genre: string,
    schoolId: string,
    params: BookListQueryParams = {}
  ): Promise<PaginatedBookListDTO> {
    try {
      // Check if school exists
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError(`School with ID ${schoolId} not found`);
      }

      const { books, total } = await this.repository.findBooksByGenre(
        genre,
        schoolId,
        params
      );

      // Map to DTOs
      const bookDTOs = books.map((book) => BookDTOMapper.toDetailDTO(book));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        books: bookDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getBooksByGenre service:", error);
      throw new AppError("Failed to get books by genre");
    }
  }

  /**
   * Search books
   */
  public async searchBooks(
    query: string,
    schoolId: string,
    params: BookListQueryParams = {}
  ): Promise<PaginatedBookListDTO> {
    try {
      // Check if school exists
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError(`School with ID ${schoolId} not found`);
      }

      const { books, total } = await this.repository.searchBooks(
        query,
        schoolId,
        params
      );

      // Map to DTOs
      const bookDTOs = books.map((book) => BookDTOMapper.toDetailDTO(book));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        books: bookDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in searchBooks service:", error);
      throw new AppError("Failed to search books");
    }
  }

  /**
   * Validate book data
   */
  public async validateBookData(
    bookData: CreateBookDTO | UpdateBookDTO
  ): Promise<boolean> {
    // Validate title if provided
    if ("title" in bookData && bookData.title) {
      if (bookData.title.length < 1 || bookData.title.length > 200) {
        throw new BadRequestError("Title must be between 1 and 200 characters");
      }
    }

    // Validate genre if provided
    if ("genre" in bookData && bookData.genre) {
      if (bookData.genre.length < 1 || bookData.genre.length > 100) {
        throw new BadRequestError("Genre must be between 1 and 100 characters");
      }
    }

    // Validate publish year if provided
    if ("publishYear" in bookData && bookData.publishYear) {
      const year = parseInt(bookData.publishYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1 || year > currentYear) {
        throw new BadRequestError(
          `Publish year must be between 1 and ${currentYear}`
        );
      }
    }

    // Validate copies available and total
    if (
      "copiesAvailable" in bookData &&
      bookData.copiesAvailable !== undefined
    ) {
      if (bookData.copiesAvailable < 0) {
        throw new BadRequestError("Copies available must be non-negative");
      }

      if ("copiesTotal" in bookData && bookData.copiesTotal !== undefined) {
        if (bookData.copiesTotal < bookData.copiesAvailable) {
          throw new BadRequestError(
            "Total copies must be greater than or equal to available copies"
          );
        }
      } else if ("copiesTotal" in bookData === false && "title" in bookData) {
        // For new books, set copiesTotal to match copiesAvailable if not provided
        (bookData as CreateBookDTO).copiesTotal = bookData.copiesAvailable;
      }
    }

    // Validate copiesTotal if provided without copiesAvailable
    if ("copiesTotal" in bookData && bookData.copiesTotal !== undefined) {
      if (bookData.copiesTotal < 0) {
        throw new BadRequestError("Total copies must be non-negative");
      }
    }

    // Validate ISBN if provided
    if ("isbn" in bookData && bookData.isbn) {
      // Basic ISBN-10 or ISBN-13 validation
      const isbnRegex = /^(?:\d[- ]?){9}[\dXx]$|^(?:\d[- ]?){13}$/;
      if (!isbnRegex.test(bookData.isbn.replace(/\s+/g, ""))) {
        throw new BadRequestError(
          "Invalid ISBN format. Must be ISBN-10 or ISBN-13"
        );
      }
    }

    // Validate page count if provided
    if (
      "pageCount" in bookData &&
      bookData.pageCount !== undefined &&
      bookData.pageCount !== null
    ) {
      if (bookData.pageCount < 1) {
        throw new BadRequestError("Page count must be at least 1");
      }
    }

    return true;
  }

  /**
   * Generate tags from book metadata
   */
  public generateTags(bookData: CreateBookDTO | UpdateBookDTO): string[] {
    const tags: string[] = [];

    // Add genre as a tag
    if (bookData.genre) {
      tags.push(bookData.genre.toLowerCase());
    }

    // Add author as a tag if provided
    if (bookData.author) {
      tags.push(`author:${bookData.author.toLowerCase()}`);
    }

    // Add publish year as a tag if provided
    if (bookData.publishYear) {
      tags.push(`year:${bookData.publishYear}`);
    }

    // Add language as a tag if provided
    if (bookData.language) {
      tags.push(`language:${bookData.language.toLowerCase()}`);
    }

    // Add publisher as a tag if provided
    if (bookData.publisher) {
      tags.push(`publisher:${bookData.publisher.toLowerCase()}`);
    }

    return tags;
  }

  /**
   * Clear book cache
   */
  private async clearBookCache(bookId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${bookId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new BookService(bookRepository);
