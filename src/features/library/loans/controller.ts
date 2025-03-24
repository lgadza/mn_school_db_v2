import { Request, Response } from "express";
import bookLoanService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class BookLoanController {
  /**
   * Get loan by ID
   */
  public getLoanById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await bookLoanService.getLoanById(id);

      ResponseUtil.sendSuccess(res, result, "Loan retrieved successfully");
    } catch (error) {
      logger.error("Error in getLoanById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving loan",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Checkout a book (create a loan)
   */
  public checkoutBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const loanData = req.body;
      const result = await bookLoanService.checkoutBook(loanData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Book checked out successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in checkoutBook controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error checking out book",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Checkin a book (return a loan)
   */
  public checkinBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const returnData = req.body || {};
      const result = await bookLoanService.checkinBook(id, returnData);

      ResponseUtil.sendSuccess(res, result, "Book checked in successfully");
    } catch (error) {
      logger.error("Error in checkinBook controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error checking in book",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Renew a book loan
   */
  public renewBookLoan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const renewData = req.body || {};
      const result = await bookLoanService.renewBookLoan(id, renewData);

      ResponseUtil.sendSuccess(res, result, "Book loan renewed successfully");
    } catch (error) {
      logger.error("Error in renewBookLoan controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error renewing book loan",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get user's active loans
   */
  public getUserActiveLoans = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const params = req.query;
      const result = await bookLoanService.getUserActiveLoans(userId, {
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "User's active loans retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getUserActiveLoans controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving user's active loans",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get user's loan history
   */
  public getUserLoanHistory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const params = req.query;
      const result = await bookLoanService.getUserLoanHistory(userId, {
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        status: params.status as "active" | "returned" | "overdue" | undefined,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        fromDate: params.fromDate as string,
        toDate: params.toDate as string,
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "User's loan history retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getUserLoanHistory controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving user's loan history",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get all loans
   */
  public getAllLoans = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await bookLoanService.getAllLoans({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        status: params.status as "active" | "returned" | "overdue" | undefined,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        userId: params.userId as string,
        bookId: params.bookId as string,
        schoolId: params.schoolId as string,
        fromDate: params.fromDate as string,
        toDate: params.toDate as string,
        overdue: params.overdue === "true",
      });

      ResponseUtil.sendSuccess(res, result, "Loans retrieved successfully");
    } catch (error) {
      logger.error("Error in getAllLoans controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving loans",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get school loans
   */
  public getSchoolLoans = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const params = req.query;
      const result = await bookLoanService.getAllLoans({
        schoolId,
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        status: params.status as "active" | "returned" | "overdue" | undefined,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        fromDate: params.fromDate as string,
        toDate: params.toDate as string,
        overdue: params.overdue === "true",
      });

      ResponseUtil.sendSuccess(
        res,
        result,
        "School loans retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSchoolLoans controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving school loans",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get loan statistics
   */
  public getLoanStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { schoolId, fromDate, toDate, limit } = req.query;

      const result = await bookLoanService.getLoanStatistics(
        schoolId as string,
        fromDate as string,
        toDate as string,
        limit ? parseInt(limit as string) : 5
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Loan statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getLoanStatistics controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving loan statistics",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new BookLoanController();
