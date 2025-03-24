import { BookLoanInterface } from "../interfaces/interfaces";
import BookLoan from "./model";
import Book from "../books/model";
import User from "../../users/model";
import RentalRule from "../rules/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import { BookLoanListQueryParams, CreateBookLoanDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import School from "../../schools/model";

export class BookLoanRepository {
  /**
   * Find a loan by ID
   */
  public async findLoanById(id: string): Promise<BookLoanInterface | null> {
    try {
      return await BookLoan.findByPk(id, {
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "schoolId"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding loan by ID:", error);
      throw new DatabaseError("Database error while finding loan", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, loanId: id },
      });
    }
  }

  /**
   * Create a new loan
   */
  public async createLoan(
    loanData: CreateBookLoanDTO & { rentalDate?: Date; status?: string },
    transaction?: Transaction
  ): Promise<BookLoanInterface> {
    try {
      // Validate the status is one of the allowed values
      const validStatus =
        loanData.status &&
        ["active", "returned", "overdue"].includes(loanData.status)
          ? (loanData.status as "active" | "returned" | "overdue")
          : "active";

      return await BookLoan.create(
        {
          bookId: loanData.bookId,
          userId: loanData.userId,
          dueDate:
            loanData.dueDate ||
            (() => {
              const date = new Date(loanData.rentalDate || new Date());
              date.setDate(date.getDate() + 14); // Default 14-day loan period
              return date;
            })(),
          rentalDate: loanData.rentalDate || new Date(),
          status: validStatus,
          notes: loanData.notes,
        },
        { transaction }
      );
    } catch (error) {
      logger.error("Error creating loan:", error);
      throw new DatabaseError("Database error while creating loan", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a loan
   */
  public async updateLoan(
    id: string,
    loanData: Partial<BookLoanInterface>,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await BookLoan.update(loanData, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating loan:", error);
      throw new DatabaseError("Database error while updating loan", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, loanId: id },
      });
    }
  }

  /**
   * Delete a loan
   */
  public async deleteLoan(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await BookLoan.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting loan:", error);
      throw new DatabaseError("Database error while deleting loan", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, loanId: id },
      });
    }
  }

  /**
   * Get user's active loans
   */
  public async getUserActiveLoans(
    userId: string,
    params: BookLoanListQueryParams = {}
  ): Promise<{
    loans: BookLoanInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "dueDate",
        sortOrder = "asc",
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get loans and total count
      const { count, rows } = await BookLoan.findAndCountAll({
        where: {
          userId,
          status: "active",
        },
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "schoolId"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });

      return {
        loans: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting user's active loans:", error);
      throw new DatabaseError(
        "Database error while getting user's active loans",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            userId,
            params,
          },
        }
      );
    }
  }

  /**
   * Get user's loan history
   */
  public async getUserLoanHistory(
    userId: string,
    params: BookLoanListQueryParams = {}
  ): Promise<{
    loans: BookLoanInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "rentalDate",
        sortOrder = "desc",
        fromDate,
        toDate,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = { userId };

      // Apply status filter
      if (status) {
        where.status = status;
      }

      // Apply date filters
      if (fromDate) {
        where.rentalDate = {
          ...where.rentalDate,
          [Op.gte]: new Date(fromDate),
        };
      }
      if (toDate) {
        where.rentalDate = {
          ...where.rentalDate,
          [Op.lte]: new Date(toDate),
        };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get loans and total count
      const { count, rows } = await BookLoan.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "schoolId"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });

      return {
        loans: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting user's loan history:", error);
      throw new DatabaseError(
        "Database error while getting user's loan history",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            userId,
            params,
          },
        }
      );
    }
  }

  /**
   * Get book's loan history
   */
  public async getBookLoanHistory(
    bookId: string,
    params: BookLoanListQueryParams = {}
  ): Promise<{
    loans: BookLoanInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "rentalDate",
        sortOrder = "desc",
        fromDate,
        toDate,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = { bookId };

      // Apply status filter
      if (status) {
        where.status = status;
      }

      // Apply date filters
      if (fromDate) {
        where.rentalDate = {
          ...where.rentalDate,
          [Op.gte]: new Date(fromDate),
        };
      }
      if (toDate) {
        where.rentalDate = {
          ...where.rentalDate,
          [Op.lte]: new Date(toDate),
        };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get loans and total count
      const { count, rows } = await BookLoan.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "schoolId"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });

      return {
        loans: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting book's loan history:", error);
      throw new DatabaseError(
        "Database error while getting book's loan history",
        {
          additionalInfo: {
            code: ErrorCode.DB_QUERY_FAILED,
            bookId,
            params,
          },
        }
      );
    }
  }

  /**
   * Get all loans with filtering
   */
  public async getAllLoans(params: BookLoanListQueryParams = {}): Promise<{
    loans: BookLoanInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        sortBy = "rentalDate",
        sortOrder = "desc",
        userId,
        bookId,
        schoolId,
        fromDate,
        toDate,
        overdue,
      } = params;

      // Build where clause
      let where: WhereOptions<any> = {};

      // Apply filters
      if (status) {
        where.status = status;
      }

      if (userId) {
        where.userId = userId;
      }

      if (bookId) {
        where.bookId = bookId;
      }

      // Apply date filters
      if (fromDate) {
        where.rentalDate = {
          ...where.rentalDate,
          [Op.gte]: new Date(fromDate),
        };
      }
      if (toDate) {
        where.rentalDate = {
          ...where.rentalDate,
          [Op.lte]: new Date(toDate),
        };
      }

      // Check for overdue loans
      if (overdue) {
        where.dueDate = {
          [Op.lt]: new Date(),
        };
        where.status = "active";
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Include book with school filter
      const bookInclude: any = {
        model: Book,
        as: "book",
        attributes: ["id", "title", "schoolId"],
      };

      if (schoolId) {
        bookInclude.where = { schoolId };
      }

      // Search across multiple fields
      if (search) {
        // Note: This approach depends on your database supporting array operations
        // For a more general solution, you might need multiple OR conditions
        where = {
          ...where,
          [Op.or]: [
            { "$book.title$": { [Op.iLike]: `%${search}%` } },
            { "$user.firstName$": { [Op.iLike]: `%${search}%` } },
            { "$user.lastName$": { [Op.iLike]: `%${search}%` } },
            { "$user.email$": { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      // Get loans and total count
      const { count, rows } = await BookLoan.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          bookInclude,
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        distinct: true,
      });

      return {
        loans: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting loans:", error);
      throw new DatabaseError("Database error while getting loans", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          params,
        },
      });
    }
  }

  /**
   * Check if a user has reached their maximum allowed loans
   */
  public async hasUserReachedLoanLimit(
    userId: string,
    maxLoans: number
  ): Promise<boolean> {
    try {
      const activeLoans = await BookLoan.count({
        where: {
          userId,
          status: "active",
        },
      });

      return activeLoans >= maxLoans;
    } catch (error) {
      logger.error("Error checking user loan limit:", error);
      throw new DatabaseError("Database error while checking user loan limit", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          userId,
          maxLoans,
        },
      });
    }
  }

  /**
   * Get active loan for a book by a user (if exists)
   */
  public async getActiveBookLoanForUser(
    bookId: string,
    userId: string
  ): Promise<BookLoanInterface | null> {
    try {
      return await BookLoan.findOne({
        where: {
          bookId,
          userId,
          status: "active",
        },
      });
    } catch (error) {
      logger.error("Error finding active book loan for user:", error);
      throw new DatabaseError("Database error while finding active book loan", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          bookId,
          userId,
        },
      });
    }
  }

  /**
   * Update overdue loans status
   */
  public async updateOverdueLoansStatus(): Promise<number> {
    try {
      const now = new Date();
      const [count] = await BookLoan.update(
        { status: "overdue" },
        {
          where: {
            status: "active",
            dueDate: {
              [Op.lt]: now,
            },
          },
        }
      );
      return count;
    } catch (error) {
      logger.error("Error updating overdue loans:", error);
      throw new DatabaseError("Database error while updating overdue loans", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
        },
      });
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
  ): Promise<{
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
  }> {
    try {
      // Build base where clause
      const baseWhere: any = {};

      // Apply date filters
      if (fromDate) {
        baseWhere.rentalDate = {
          ...baseWhere.rentalDate,
          [Op.gte]: new Date(fromDate),
        };
      }
      if (toDate) {
        baseWhere.rentalDate = {
          ...baseWhere.rentalDate,
          [Op.lte]: new Date(toDate),
        };
      }

      // If schoolId is provided, we need to join with books table
      let schoolFilter = {};
      if (schoolId) {
        schoolFilter = {
          include: [
            {
              model: Book,
              as: "book",
              attributes: [],
              where: { schoolId },
            },
          ],
        };
      }

      // Get total counts
      const totalLoans = await BookLoan.count({
        where: baseWhere,
        ...schoolFilter,
      });

      const activeLoans = await BookLoan.count({
        where: { ...baseWhere, status: "active" },
        ...schoolFilter,
      });

      const overdueLoans = await BookLoan.count({
        where: {
          ...baseWhere,
          status: "overdue",
        },
        ...schoolFilter,
      });

      const returnedLoans = await BookLoan.count({
        where: { ...baseWhere, status: "returned" },
        ...schoolFilter,
      });

      // Get top borrowers
      const topBorrowers = await BookLoan.findAll({
        attributes: [
          "userId",
          [
            BookLoan.sequelize!.literal(
              'CONCAT("user"."firstName", \' \', "user"."lastName")'
            ),
            "userName",
          ],
          [BookLoan.sequelize!.fn("COUNT", "*"), "loanCount"],
        ],
        where: baseWhere,
        include: [
          {
            model: User,
            as: "user",
            attributes: [],
          },
          ...(schoolId
            ? [
                {
                  model: Book,
                  as: "book",
                  attributes: [],
                  where: { schoolId },
                },
              ]
            : []),
        ],
        group: ["userId", "user.firstName", "user.lastName"],
        order: [[BookLoan.sequelize!.literal("loanCount"), "DESC"]],
        limit,
        subQuery: false,
      });

      // Get most popular books
      const mostPopularBooks = await BookLoan.findAll({
        attributes: [
          "bookId",
          ["book.title", "bookTitle"],
          [BookLoan.sequelize!.fn("COUNT", "*"), "loanCount"],
        ],
        where: baseWhere,
        include: [
          {
            model: Book,
            as: "book",
            attributes: [],
            ...(schoolId ? { where: { schoolId } } : {}),
          },
        ],
        group: ["bookId", "book.title"],
        order: [[BookLoan.sequelize!.literal("loanCount"), "DESC"]],
        limit,
        subQuery: false,
      });

      return {
        totalLoans,
        activeLoans,
        overdueLoans,
        returnedLoans,
        topBorrowers: topBorrowers.map((item: any) => ({
          userId: item.userId,
          userName: item.getDataValue("userName"),
          loanCount: parseInt(item.getDataValue("loanCount")),
        })),
        mostPopularBooks: mostPopularBooks.map((item: any) => ({
          bookId: item.bookId,
          bookTitle: item.getDataValue("bookTitle"),
          loanCount: parseInt(item.getDataValue("loanCount")),
        })),
      };
    } catch (error) {
      logger.error("Error getting loan statistics:", error);
      throw new DatabaseError("Database error while getting loan statistics", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          schoolId,
          fromDate,
          toDate,
        },
      });
    }
  }
}

// Create and export repository instance
export default new BookLoanRepository();
