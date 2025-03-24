import { IBookLoanService } from "../interfaces/services";
import {
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookLoanDTO,
  RenewBookLoanDTO,
  BookLoanListQueryParams,
  PaginatedBookLoanListDTO,
  BookLoanStatsDTO,
  BookLoanDTOMapper,
} from "./dto";
import bookLoanRepository from "./repository";
import bookRepository from "../books/repository";
import BookLoan from "./model";
import Book from "../books/model";
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
import RentalRule from "../rules/model";

export class BookLoanService implements IBookLoanService {
  private readonly CACHE_PREFIX = "loan:";
  private readonly CACHE_TTL = 600; // 10 minutes

  /**
   * Get loan by ID
   */
  public async getLoanById(id: string): Promise<BookLoanDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedLoan = await cache.get(cacheKey);

      if (cachedLoan) {
        return JSON.parse(cachedLoan);
      }

      // Get from database if not in cache
      const loan = await bookLoanRepository.findLoanById(id);
      if (!loan) {
        throw new NotFoundError(`Loan with ID ${id} not found`);
      }

      // Map to DTO
      const loanDTO = BookLoanDTOMapper.toDTO(loan);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(loanDTO), this.CACHE_TTL);

      return loanDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getLoanById service:", error);
      throw new AppError("Failed to get loan");
    }
  }

  /**
   * Create a new loan
   */
  public async createLoan(loanData: CreateBookLoanDTO): Promise<BookLoanDTO> {
    return db.transaction(async (transaction) => {
      try {
        // Check if book exists
        const book = await bookRepository.findBookById(loanData.bookId);
        if (!book) {
          throw new NotFoundError(`Book with ID ${loanData.bookId} not found`);
        }

        // Check if user exists
        const user = await User.findByPk(loanData.userId);
        if (!user) {
          throw new NotFoundError(`User with ID ${loanData.userId} not found`);
        }

        // Check if user has reached loan limit
        const rentalRule = await RentalRule.findByPk(loanData.rentalRuleId);
        if (rentalRule) {
          const hasReachedLimit =
            await bookLoanRepository.hasUserReachedLoanLimit(
              loanData.userId,
              rentalRule.maxBooksPerStudent
            );
          if (hasReachedLimit) {
            throw new ConflictError(
              `User has reached the maximum allowed loans (${rentalRule.maxBooksPerStudent})`
            );
          }
        }

        // Check if book is available
        if (!book.isAvailable()) {
          throw new ConflictError(
            `Book with ID ${loanData.bookId} is not available for loan`
          );
        }

        // Create the loan
        const newLoan = await bookLoanRepository.createLoan(
          loanData,
          transaction
        );

        // Update book availability
        await bookRepository.checkoutBook(loanData.bookId, transaction);

        // Get the complete loan
        const loan = await bookLoanRepository.findLoanById(newLoan.id);
        if (!loan) {
          throw new AppError("Failed to retrieve created loan");
        }

        // Map to DTO
        return BookLoanDTOMapper.toDTO(loan);
      } catch (error) {
        // Transaction will automatically be rolled back on error
        if (error instanceof AppError) {
          throw error;
        }
        logger.error("Error in createLoan service:", error);
        throw new AppError("Failed to create loan");
      }
    });
  }

  /**
   * Return a loan
   */
  public async returnLoan(
    id: string,
    returnData: ReturnBookLoanDTO
  ): Promise<BookLoanDTO> {
    return db.transaction(async (transaction) => {
      try {
        // Check if loan exists
        const loan = await bookLoanRepository.findLoanById(id);
        if (!loan) {
          throw new NotFoundError(`Loan with ID ${id} not found`);
        }

        // Check if loan is active
        if (loan.status !== "active") {
          throw new ConflictError(`Loan with ID ${id} is not active`);
        }

        // Update loan status and return date
        await bookLoanRepository.updateLoan(
          id,
          {
            status: "returned",
            returnDate: new Date(),
            notes: returnData.notes,
          },
          transaction
        );

        // Update book availability
        await bookRepository.checkinBook(loan.bookId, transaction);

        // Clear cache
        await this.clearLoanCache(id);

        // Get the updated loan
        return this.getLoanById(id);
      } catch (error) {
        // Transaction will automatically be rolled back on error
        if (error instanceof AppError) {
          throw error;
        }
        logger.error("Error in returnLoan service:", error);
        throw new AppError("Failed to return loan");
      }
    });
  }

  /**
   * Renew a loan
   */
  public async renewLoan(
    id: string,
    renewData: RenewBookLoanDTO
  ): Promise<BookLoanDTO> {
    return db.transaction(async (transaction) => {
      try {
        // Check if loan exists
        const loan = await bookLoanRepository.findLoanById(id);
        if (!loan) {
          throw new NotFoundError(`Loan with ID ${id} not found`);
        }

        // Check if loan is active
        if (loan.status !== "active") {
          throw new ConflictError(`Loan with ID ${id} is not active`);
        }

        // Check if renewal is allowed
        const rentalRule = await RentalRule.findByPk(loan.rentalRuleId);
        if (rentalRule && !rentalRule.renewalAllowed) {
          throw new ConflictError(`Renewal is not allowed for this loan`);
        }

        // Update loan due date and notes
        await bookLoanRepository.updateLoan(
          id,
          {
            dueDate: renewData.newDueDate,
            notes: renewData.notes,
          },
          transaction
        );

        // Clear cache
        await this.clearLoanCache(id);

        // Get the updated loan
        return this.getLoanById(id);
      } catch (error) {
        // Transaction will automatically be rolled back on error
        if (error instanceof AppError) {
          throw error;
        }
        logger.error("Error in renewLoan service:", error);
        throw new AppError("Failed to renew loan");
      }
    });
  }

  /**
   * Check out a book (alias for createLoan for interface compliance)
   */
  public async checkoutBook(loanData: CreateBookLoanDTO): Promise<BookLoanDTO> {
    return this.createLoan(loanData);
  }

  /**
   * Check in a book (alias for returnLoan for interface compliance)
   */
  public async checkinBook(
    id: string,
    returnData: ReturnBookLoanDTO
  ): Promise<BookLoanDTO> {
    return this.returnLoan(id, returnData);
  }

  /**
   * Renew a book loan (alias for renewLoan for interface compliance)
   */
  public async renewBookLoan(
    id: string,
    renewData: RenewBookLoanDTO
  ): Promise<BookLoanDTO> {
    return this.renewLoan(id, renewData);
  }

  /**
   * Get user's active loans
   */
  public async getUserActiveLoans(
    userId: string,
    params: BookLoanListQueryParams = {}
  ): Promise<PaginatedBookLoanListDTO> {
    try {
      const { loans, total } = await bookLoanRepository.getUserActiveLoans(
        userId,
        params
      );

      // Map to DTOs
      const loanDTOs = loans.map((loan) => BookLoanDTOMapper.toDTO(loan));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        loans: loanDTOs,
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
      logger.error("Error in getUserActiveLoans service:", error);
      throw new AppError("Failed to get user's active loans");
    }
  }

  /**
   * Get user's loan history
   */
  public async getUserLoanHistory(
    userId: string,
    params: BookLoanListQueryParams = {}
  ): Promise<PaginatedBookLoanListDTO> {
    try {
      const { loans, total } = await bookLoanRepository.getUserLoanHistory(
        userId,
        params
      );

      // Map to DTOs
      const loanDTOs = loans.map((loan) => BookLoanDTOMapper.toDTO(loan));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        loans: loanDTOs,
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
      logger.error("Error in getUserLoanHistory service:", error);
      throw new AppError("Failed to get user's loan history");
    }
  }

  /**
   * Get book's loan history
   */
  public async getBookLoanHistory(
    bookId: string,
    params: BookLoanListQueryParams = {}
  ): Promise<PaginatedBookLoanListDTO> {
    try {
      const { loans, total } = await bookLoanRepository.getBookLoanHistory(
        bookId,
        params
      );

      // Map to DTOs
      const loanDTOs = loans.map((loan) => BookLoanDTOMapper.toDTO(loan));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        loans: loanDTOs,
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
      logger.error("Error in getBookLoanHistory service:", error);
      throw new AppError("Failed to get book's loan history");
    }
  }

  /**
   * Get all loans
   */
  public async getAllLoans(
    params: BookLoanListQueryParams = {}
  ): Promise<PaginatedBookLoanListDTO> {
    try {
      const { loans, total } = await bookLoanRepository.getAllLoans(params);

      // Map to DTOs
      const loanDTOs = loans.map((loan) => BookLoanDTOMapper.toDTO(loan));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        loans: loanDTOs,
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
      logger.error("Error in getAllLoans service:", error);
      throw new AppError("Failed to get loans");
    }
  }

  /**
   * Get loan statistics
   */
  public async getLoanStatistics(
    schoolId?: string,
    fromDate?: string,
    toDate?: string,
    limit: number = 5
  ): Promise<BookLoanStatsDTO> {
    try {
      const stats = await bookLoanRepository.getLoanStatistics(
        schoolId,
        fromDate,
        toDate,
        limit
      );

      return stats;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getLoanStatistics service:", error);
      throw new AppError("Failed to get loan statistics");
    }
  }

  /**
   * Clear loan cache
   */
  private async clearLoanCache(loanId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${loanId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new BookLoanService();
