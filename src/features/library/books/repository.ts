import { IBookRepository } from "../interfaces/services";
import { BookInterface, BookStatus } from "../interfaces/interfaces";
import Book from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions } from "sequelize";
import { BookListQueryParams, CreateBookDTO, UpdateBookDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BookRepository implements IBookRepository {
  /**
   * Find a book by ID
   */
  public async findBookById(id: string): Promise<BookInterface | null> {
    try {
      return await Book.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding book by ID:", error);
      throw new DatabaseError("Database error while finding book", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, bookId: id },
      });
    }
  }

  /**
   * Find a book by ISBN
   */
  public async findBookByISBN(
    isbn: string,
    schoolId: string
  ): Promise<BookInterface | null> {
    try {
      return await Book.findOne({
        where: {
          isbn,
          schoolId,
        },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding book by ISBN:", error);
      throw new DatabaseError("Database error while finding book by ISBN", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, isbn, schoolId },
      });
    }
  }

  /**
   * Create a new book
   */
  public async createBook(
    bookData: CreateBookDTO,
    transaction?: Transaction
  ): Promise<BookInterface> {
    try {
      return await Book.create(bookData as any, { transaction });
    } catch (error) {
      logger.error("Error creating book:", error);
      throw new DatabaseError("Database error while creating book", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a book
   */
  public async updateBook(
    id: string,
    bookData: UpdateBookDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Book.update(bookData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating book:", error);
      throw new DatabaseError("Database error while updating book", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, bookId: id },
      });
    }
  }

  /**
   * Delete a book
   */
  public async deleteBook(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Book.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting book:", error);
      throw new DatabaseError("Database error while deleting book", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, bookId: id },
      });
    }
  }

  /**
   * Change book status
   */
  public async changeBookStatus(
    id: string,
    status: BookStatus,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Book.update(
        { status },
        {
          where: { id },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error changing book status:", error);
      throw new DatabaseError("Database error while changing book status", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, bookId: id, status },
      });
    }
  }

  /**
   * Get book list with filtering and pagination
   */
  public async getBookList(params: BookListQueryParams): Promise<{
    books: BookInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "title",
        sortOrder = "asc",
        genre,
        author,
        publishYear,
        available,
        schoolId,
        status,
        language,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (genre) {
        where.genre = genre;
      }

      if (author) {
        where.author = { [Op.iLike]: `%${author}%` };
      }

      if (publishYear) {
        where.publishYear = publishYear;
      }

      if (available !== undefined) {
        where.available = available;
      }

      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (status) {
        where.status = status;
      }

      if (language) {
        where.language = language;
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { author: { [Op.iLike]: `%${search}%` } },
            { isbn: { [Op.iLike]: `%${search}%` } },
            { publisher: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get books and total count
      const { count, rows } = await Book.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });

      return {
        books: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting book list:", error);
      throw new DatabaseError("Database error while getting book list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find books by school ID
   */
  public async findBooksBySchool(
    schoolId: string,
    params: BookListQueryParams = {}
  ): Promise<{
    books: BookInterface[];
    total: number;
  }> {
    try {
      return await this.getBookList({
        ...params,
        schoolId,
      });
    } catch (error) {
      logger.error("Error finding books by school:", error);
      throw new DatabaseError("Database error while finding books by school", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
      });
    }
  }

  /**
   * Find books by genre
   */
  public async findBooksByGenre(
    genre: string,
    schoolId: string,
    params: BookListQueryParams = {}
  ): Promise<{
    books: BookInterface[];
    total: number;
  }> {
    try {
      return await this.getBookList({
        ...params,
        genre,
        schoolId,
      });
    } catch (error) {
      logger.error("Error finding books by genre:", error);
      throw new DatabaseError("Database error while finding books by genre", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, genre, schoolId },
      });
    }
  }

  /**
   * Search books
   */
  public async searchBooks(
    query: string,
    schoolId: string,
    params: BookListQueryParams = {}
  ): Promise<{
    books: BookInterface[];
    total: number;
  }> {
    try {
      return await this.getBookList({
        ...params,
        search: query,
        schoolId,
      });
    } catch (error) {
      logger.error("Error searching books:", error);
      throw new DatabaseError("Database error while searching books", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query, schoolId },
      });
    }
  }

  /**
   * Check out a book (decrease available copies)
   */
  public async checkoutBook(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const book = await Book.findByPk(id, { transaction });
      if (!book || book.copiesAvailable <= 0) {
        return false;
      }

      const [updated] = await Book.update(
        {
          copiesAvailable: book.copiesAvailable - 1,
          available: book.copiesAvailable - 1 > 0,
        },
        {
          where: { id },
          transaction,
        }
      );

      return updated > 0;
    } catch (error) {
      logger.error("Error checking out book:", error);
      throw new DatabaseError("Database error while checking out book", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, bookId: id },
      });
    }
  }

  /**
   * Check in a book (increase available copies)
   */
  public async checkinBook(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const book = await Book.findByPk(id, { transaction });
      if (!book) {
        return false;
      }

      const [updated] = await Book.update(
        {
          copiesAvailable: Math.min(book.copiesAvailable + 1, book.copiesTotal),
          available: true,
        },
        {
          where: { id },
          transaction,
        }
      );

      return updated > 0;
    } catch (error) {
      logger.error("Error checking in book:", error);
      throw new DatabaseError("Database error while checking in book", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, bookId: id },
      });
    }
  }

  /**
   * Check if ISBN exists
   */
  public async isISBNTaken(
    isbn: string,
    schoolId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      if (!isbn) return false; // If ISBN is null or empty, it's not taken

      const whereClause: any = {
        isbn,
        schoolId,
      };

      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await Book.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if ISBN is taken:", error);
      throw new DatabaseError("Database error while checking ISBN", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, isbn, schoolId },
      });
    }
  }
}

// Create and export repository instance
export default new BookRepository();
