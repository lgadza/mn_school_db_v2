import { Request, Response } from "express";
import { IBookService } from "../interfaces/services";
import bookService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import { BookStatus } from "../interfaces/interfaces";

export class BookController {
  private service: IBookService;

  constructor(service: IBookService) {
    this.service = service;
  }

  /**
   * Get book by ID
   */
  public getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getBookById(id);

      ResponseUtil.sendSuccess(res, result, "Book retrieved successfully");
    } catch (error) {
      logger.error("Error in getBookById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving book",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get book by ISBN
   */
  public getBookByISBN = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isbn, schoolId } = req.params;
      const result = await this.service.getBookByISBN(isbn, schoolId);

      ResponseUtil.sendSuccess(res, result, "Book retrieved successfully");
    } catch (error) {
      logger.error("Error in getBookByISBN controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving book by ISBN",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new book
   */
  public createBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookData = req.body;
      const result = await this.service.createBook(bookData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Book created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createBook controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating book",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a book
   */
  public updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const bookData = req.body;
      const result = await this.service.updateBook(id, bookData);

      ResponseUtil.sendSuccess(res, result, "Book updated successfully");
    } catch (error) {
      logger.error("Error in updateBook controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating book",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a book
   */
  public deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteBook(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Book deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteBook controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting book",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Change book status
   */
  public changeBookStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(BookStatus).includes(status)) {
        ResponseUtil.sendBadRequest(
          res,
          `Invalid status. Must be one of: ${Object.values(BookStatus).join(
            ", "
          )}`
        );
        return;
      }

      const result = await this.service.changeBookStatus(id, status);

      ResponseUtil.sendSuccess(res, result, "Book status changed successfully");
    } catch (error) {
      logger.error("Error in changeBookStatus controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error changing book status",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get book list
   */
  public getBookList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getBookList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        genre: params.genre as string,
        author: params.author as string,
        publishYear: params.publishYear as string,
        available:
          params.available === "true"
            ? true
            : params.available === "false"
            ? false
            : undefined,
        schoolId: params.schoolId as string,
        status: params.status as BookStatus,
        language: params.language as string,
      });

      ResponseUtil.sendSuccess(res, result, "Books retrieved successfully");
    } catch (error) {
      logger.error("Error in getBookList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving books",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get books by school
   */
  public getBooksBySchool = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const params = req.query;

      const result = await this.service.getBooksBySchool(schoolId, {
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        genre: params.genre as string,
        author: params.author as string,
        publishYear: params.publishYear as string,
        available:
          params.available === "true"
            ? true
            : params.available === "false"
            ? false
            : undefined,
        status: params.status as BookStatus,
        language: params.language as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "School books retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBooksBySchool controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school books",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get books by genre
   */
  public getBooksByGenre = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { genre, schoolId } = req.params;
      const params = req.query;

      const result = await this.service.getBooksByGenre(genre, schoolId, {
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        author: params.author as string,
        publishYear: params.publishYear as string,
        available:
          params.available === "true"
            ? true
            : params.available === "false"
            ? false
            : undefined,
        status: params.status as BookStatus,
        language: params.language as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Genre books retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getBooksByGenre controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving genre books",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Search books
   */
  public searchBooks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, schoolId } = req.params;
      const params = req.query;

      const result = await this.service.searchBooks(query, schoolId, {
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        genre: params.genre as string,
        author: params.author as string,
        publishYear: params.publishYear as string,
        available:
          params.available === "true"
            ? true
            : params.available === "false"
            ? false
            : undefined,
        status: params.status as BookStatus,
        language: params.language as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "Books search results retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in searchBooks controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error searching books",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new BookController(bookService);
