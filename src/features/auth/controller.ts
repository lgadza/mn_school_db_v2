import { Request, Response } from "express";
import { IAuthService } from "./interfaces/services";
import authService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class AuthController {
  private service: IAuthService;

  constructor(service: IAuthService) {
    this.service = service;
  }

  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const result = await this.service.register(userData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "User registered successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in register controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error during registration",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Login user
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);

      ResponseUtil.sendSuccess(res, result, "Login successful");
    } catch (error) {
      logger.error("Error in login controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error during login",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Refresh user token
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.service.refreshToken(refreshToken);

      ResponseUtil.sendSuccess(res, result, "Token refreshed successfully");
    } catch (error) {
      logger.error("Error in refreshToken controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error refreshing token",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Logout user
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId as string;
      const refreshToken = req.body.refreshToken || "";

      await this.service.logout(userId, refreshToken);

      ResponseUtil.sendSuccess(res, { success: true }, "Logout successful");
    } catch (error) {
      logger.error("Error in logout controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error during logout",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get current authenticated user
   */
  public getCurrentUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId as string;
      const result = await this.service.getCurrentUser(userId);

      ResponseUtil.sendSuccess(
        res,
        result,
        "User information retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCurrentUser controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving user information",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Request password reset
   */
  public requestPasswordReset = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;
      await this.service.requestPasswordReset(email);

      // Always return success even if email doesn't exist (security best practice)
      ResponseUtil.sendSuccess(
        res,
        { success: true },
        "If the email exists, a password reset link has been sent"
      );
    } catch (error) {
      logger.error("Error in requestPasswordReset controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error processing password reset request",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Reset password
   */
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.service.resetPassword(token, password);

      ResponseUtil.sendSuccess(
        res,
        { success: true },
        "Password has been reset successfully"
      );
    } catch (error) {
      logger.error("Error in resetPassword controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error resetting password",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Verify email
   */
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      await this.service.verifyEmail(token);

      ResponseUtil.sendSuccess(
        res,
        { success: true },
        "Email has been verified successfully"
      );
    } catch (error) {
      logger.error("Error in verifyEmail controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error verifying email",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new AuthController(authService);
