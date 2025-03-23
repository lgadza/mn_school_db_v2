import { Request, Response } from "express";
import { IUserService } from "./interfaces/services";
import userService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class UserController {
  private service: IUserService;

  constructor(service: IUserService) {
    this.service = service;
  }

  /**
   * Get user by ID
   */
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getUserById(id);

      ResponseUtil.sendSuccess(res, result, "User retrieved successfully");
    } catch (error) {
      logger.error("Error in getUserById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving user",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new user
   */
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const result = await this.service.createUser(userData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "User created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createUser controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating user",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update a user
   */
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const result = await this.service.updateUser(id, userData);

      ResponseUtil.sendSuccess(res, result, "User updated successfully");
    } catch (error) {
      logger.error("Error in updateUser controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating user",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a user (soft delete)
   */
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUser(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "User deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteUser controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting user",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get user list
   */
  public getUserList = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getUserList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        isActive:
          params.isActive !== undefined
            ? params.isActive === "true"
            : undefined,
        role: params.role as string,
        createdAfter: params.createdAfter as string,
        createdBefore: params.createdBefore as string,
      });

      ResponseUtil.sendSuccess(res, result, "Users retrieved successfully");
    } catch (error) {
      logger.error("Error in getUserList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving users",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update user password
   */
  public updatePassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Check if the authenticated user is updating their own password
      // or is an admin (admins can be allowed to bypass this check)
      if (req.user?.userId !== id && req.user?.role !== "admin") {
        ResponseUtil.sendForbidden(
          res,
          "You can only change your own password"
        );
        return;
      }

      const result = await this.service.updatePassword(
        id,
        currentPassword,
        newPassword
      );

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Password updated successfully"
      );
    } catch (error) {
      logger.error("Error in updatePassword controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating password",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Admin update user password
   */
  public adminUpdatePassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { password, sendEmail } = req.body;

      const result = await this.service.adminUpdatePassword(
        id,
        password,
        sendEmail
      );

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Password updated successfully"
      );
    } catch (error) {
      logger.error("Error in adminUpdatePassword controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating password",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update user roles
   */
  public updateUserRoles = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { roles, operation } = req.body;

      const result = await this.service.updateUserRoles(id, roles, operation);

      ResponseUtil.sendSuccess(res, result, "User roles updated successfully");
    } catch (error) {
      logger.error("Error in updateUserRoles controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating user roles",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Upload and update user avatar
   */
  public uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if file was uploaded
      if (!req.file) {
        ResponseUtil.sendBadRequest(res, "No avatar file uploaded");
        return;
      }

      const avatarUrl = await this.service.updateAvatar(id, req.file);

      ResponseUtil.sendSuccess(
        res,
        { avatarUrl },
        "Avatar updated successfully"
      );
    } catch (error) {
      logger.error("Error in uploadAvatar controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating avatar",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Check if email exists
   */
  public checkEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        ResponseUtil.sendBadRequest(res, "Email parameter is required");
        return;
      }

      const exists = await this.service.userExistsByEmail(email);

      ResponseUtil.sendSuccess(
        res,
        { exists },
        exists ? "Email already exists" : "Email is available"
      );
    } catch (error) {
      logger.error("Error in checkEmail controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error checking email",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Check if username exists
   */
  public checkUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.query;

      if (!username || typeof username !== "string") {
        ResponseUtil.sendBadRequest(res, "Username parameter is required");
        return;
      }

      const exists = await this.service.userExistsByUsername(username);

      ResponseUtil.sendSuccess(
        res,
        { exists },
        exists ? "Username already exists" : "Username is available"
      );
    } catch (error) {
      logger.error("Error in checkUsername controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error checking username",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new UserController(userService);
