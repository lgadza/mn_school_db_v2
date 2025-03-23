import { IUserService, IUserRepository } from "./interfaces/services";
import {
  UserDetailDTO,
  UserListItemDTO,
  CreateUserDTO,
  UpdateUserDTO,
  PaginatedUserListDTO,
  UserListQueryParams,
  UserDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";
import EncryptionUtil from "@/common/utils/security/encryptionUtil";
import FileUploadUtil, { FileType } from "@/common/utils/file/fileUploadUtil";
import EmailUtil from "@/common/utils/email/emailUtil";
import PermissionMiddleware from "@/shared/middleware/permission";
import cache from "@/common/utils/cache/cacheUtil";

export class UserService implements IUserService {
  private repository: IUserRepository;
  private readonly CACHE_PREFIX = "user:";
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<UserDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedUser = await cache.get(cacheKey);

      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // Get from database if not in cache
      const user = await this.repository.findUserById(id);
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Get roles and permissions
      const roles = user.roles || [];
      const permissions = user.permissions || [];

      // Map to DTO
      const userDTO = UserDTOMapper.toDetailDTO(
        user,
        roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description || "",
        })),
        permissions.map((permission) => ({
          id: permission.id,
          resource: permission.resource,
          action: permission.action,
          description: permission.description || "",
        }))
      );

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(userDTO), this.CACHE_TTL);

      return userDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getUserById service:", error);
      throw new AppError("Failed to get user");
    }
  }

  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserDTO): Promise<UserDetailDTO> {
    try {
      // Check if email already exists
      if (userData.email) {
        const existingUserByEmail = await this.repository.findUserByEmail(
          userData.email
        );
        if (existingUserByEmail) {
          throw new ConflictError("Email already registered", {
            additionalInfo: { code: ErrorCode.RES_ALREADY_EXISTS },
          });
        }
      }

      // Check if username already exists
      if (userData.username) {
        const existingUserByUsername = await this.repository.findUserByUsername(
          userData.username
        );
        if (existingUserByUsername) {
          throw new ConflictError("Username already taken", {
            additionalInfo: { code: ErrorCode.RES_ALREADY_EXISTS },
          });
        }
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Hash the password
        const hashedPassword = await EncryptionUtil.hashPassword(
          userData.password
        );

        // Create the user
        const newUser = await this.repository.createUser(
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            phoneNumber: userData.phoneNumber,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth)
              : undefined,
            countryCode: userData.countryCode,
            isActive:
              userData.isActive !== undefined ? userData.isActive : true,
            avatar: userData.avatar,
          },
          transaction
        );

        // Add roles if provided, otherwise add default 'user' role
        const roleIds =
          userData.roles && userData.roles.length > 0
            ? userData.roles
            : [await this.getDefaultRoleId()];

        await this.repository.addRolesToUser(newUser.id, roleIds, transaction);

        // Commit the transaction
        await transaction.commit();

        // Clear permission cache for the new user
        await PermissionMiddleware.clearPermissionCache(newUser.id);

        // Send welcome email asynchronously
        this.sendWelcomeEmail(
          newUser.email as string,
          newUser.firstName,
          userData.password
        ).catch((error) =>
          logger.error("Failed to send welcome email:", error)
        );

        // Get the complete user with roles and permissions
        return this.getUserById(newUser.id);
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createUser service:", error);
      throw new AppError("Failed to create user");
    }
  }

  /**
   * Update a user
   */
  public async updateUser(
    id: string,
    userData: UpdateUserDTO
  ): Promise<UserDetailDTO> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Check for email uniqueness if email is being updated
      if (userData.email && userData.email !== existingUser.email) {
        const existingUserByEmail = await this.repository.findUserByEmail(
          userData.email
        );
        if (existingUserByEmail && existingUserByEmail.id !== id) {
          throw new ConflictError("Email already registered", {
            additionalInfo: { code: ErrorCode.RES_ALREADY_EXISTS },
          });
        }
      }

      // Check for username uniqueness if username is being updated
      if (userData.username && userData.username !== existingUser.username) {
        const existingUserByUsername = await this.repository.findUserByUsername(
          userData.username
        );
        if (existingUserByUsername && existingUserByUsername.id !== id) {
          throw new ConflictError("Username already taken", {
            additionalInfo: { code: ErrorCode.RES_ALREADY_EXISTS },
          });
        }
      }

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Update user data
        await this.repository.updateUser(
          id,
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            username: userData.username,
            phoneNumber: userData.phoneNumber,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth)
              : undefined,
            countryCode: userData.countryCode,
            isActive: userData.isActive,
            avatar: userData.avatar,
          },
          transaction
        );

        // Update roles if provided
        if (userData.roles) {
          await this.repository.setUserRoles(id, userData.roles, transaction);

          // Clear permission cache since roles changed
          await PermissionMiddleware.clearPermissionCache(id);
        }

        // Commit the transaction
        await transaction.commit();

        // Clear cache for this user
        await this.clearUserCache(id);

        // Get the updated user
        return this.getUserById(id);
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateUser service:", error);
      throw new AppError("Failed to update user");
    }
  }

  /**
   * Delete a user (soft delete)
   */
  public async deleteUser(id: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Soft delete the user
      const result = await this.repository.softDeleteUser(id);

      // Clear cache for this user
      await this.clearUserCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteUser service:", error);
      throw new AppError("Failed to delete user");
    }
  }

  /**
   * Get paginated user list
   */
  public async getUserList(
    params: UserListQueryParams
  ): Promise<PaginatedUserListDTO> {
    try {
      const { users, total } = await this.repository.getUserList(params);

      // Map to DTOs
      const userDTOs = users.map((user) => UserDTOMapper.toListItemDTO(user));

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        users: userDTOs,
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
      logger.error("Error in getUserList service:", error);
      throw new AppError("Failed to get user list");
    }
  }

  /**
   * Update user password
   */
  public async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Check if user exists
      const user = await this.repository.findUserById(id);
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Verify current password
      if (typeof user.verifyPassword !== "function") {
        throw new AppError("Invalid user configuration");
      }

      const isPasswordValid = await user.verifyPassword(currentPassword);
      if (!isPasswordValid) {
        throw new UnauthorizedError(
          "Current password is incorrect",
          ErrorCode.AUTH_INVALID_CREDENTIALS
        );
      }

      // Hash the new password
      const hashedPassword = await EncryptionUtil.hashPassword(newPassword);

      // Update password
      const result = await this.repository.updatePassword(id, hashedPassword);

      // Send password change notification email asynchronously
      if (user.email) {
        this.sendPasswordChangeNotification(user.email, user.firstName).catch(
          (error) =>
            logger.error("Failed to send password change notification:", error)
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updatePassword service:", error);
      throw new AppError("Failed to update password");
    }
  }

  /**
   * Admin update user password without requiring current password
   */
  public async adminUpdatePassword(
    id: string,
    password: string,
    sendEmail: boolean = true
  ): Promise<boolean> {
    try {
      // Check if user exists
      const user = await this.repository.findUserById(id);
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      // Hash the new password
      const hashedPassword = await EncryptionUtil.hashPassword(password);

      // Update password
      const result = await this.repository.updatePassword(id, hashedPassword);

      // Send notification email if requested
      if (sendEmail && user.email) {
        this.sendPasswordResetNotification(
          user.email,
          user.firstName,
          password
        ).catch((error) =>
          logger.error("Failed to send password reset notification:", error)
        );
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in adminUpdatePassword service:", error);
      throw new AppError("Failed to update user password");
    }
  }

  /**
   * Update user roles
   */
  public async updateUserRoles(
    userId: string,
    roleIds: string[],
    operation: "add" | "remove" | "set"
  ): Promise<UserDetailDTO> {
    try {
      // Check if user exists
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }

      // Perform the appropriate role operation
      if (operation === "add") {
        await this.repository.addRolesToUser(userId, roleIds);
      } else if (operation === "remove") {
        await this.repository.removeRolesFromUser(userId, roleIds);
      } else if (operation === "set") {
        await this.repository.setUserRoles(userId, roleIds);
      }

      // Clear permission cache since roles changed
      await PermissionMiddleware.clearPermissionCache(userId);

      // Clear user cache
      await this.clearUserCache(userId);

      // Get the updated user
      return this.getUserById(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateUserRoles service:", error);
      throw new AppError("Failed to update user roles");
    }
  }

  /**
   * Upload and update user avatar
   */
  public async updateAvatar(
    userId: string,
    avatarFile: Express.Multer.File
  ): Promise<string> {
    try {
      // Check if user exists
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }

      // Upload the file to S3
      const fileInfo = await FileUploadUtil.uploadToS3(
        avatarFile,
        FileType.IMAGE,
        {
          directory: `users/${userId}/avatar`,
          isPublic: true,
          metadata: {
            userId,
          },
        }
      );

      // Update user avatar URL
      await this.repository.updateAvatar(userId, fileInfo.url);

      // Clear user cache
      await this.clearUserCache(userId);

      return fileInfo.url;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateAvatar service:", error);
      throw new AppError("Failed to update user avatar");
    }
  }

  /**
   * Check if user exists by email
   */
  public async userExistsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.repository.findUserByEmail(email);
      return !!user;
    } catch (error) {
      logger.error("Error checking if user exists by email:", error);
      throw new AppError("Failed to check if user exists by email");
    }
  }

  /**
   * Check if user exists by username
   */
  public async userExistsByUsername(username: string): Promise<boolean> {
    try {
      const user = await this.repository.findUserByUsername(username);
      return !!user;
    } catch (error) {
      logger.error("Error checking if user exists by username:", error);
      throw new AppError("Failed to check if user exists by username");
    }
  }

  /**
   * Get default role ID (user role)
   */
  private async getDefaultRoleId(): Promise<string> {
    try {
      const roleRepository = require("../rbac/repository").default;
      const userRole = await roleRepository.findRoleByName("user");

      if (!userRole) {
        throw new AppError("Default user role not found");
      }

      return userRole.id;
    } catch (error) {
      logger.error("Error getting default role ID:", error);
      throw new AppError("Failed to get default role ID");
    }
  }

  /**
   * Clear user cache
   */
  private async clearUserCache(userId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;
    await cache.del(cacheKey);
  }

  /**
   * Send welcome email to new user
   */
  private async sendWelcomeEmail(
    email: string,
    firstName: string,
    password: string
  ): Promise<void> {
    try {
      await EmailUtil.sendWelcomeEmail(email, firstName, "");
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error("Error sending welcome email:", error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Send password change notification
   */
  private async sendPasswordChangeNotification(
    email: string,
    firstName: string
  ): Promise<void> {
    try {
      await EmailUtil.sendPasswordChangeNotification(email, firstName);
      logger.info(`Password change notification sent to ${email}`);
    } catch (error) {
      logger.error("Error sending password change notification:", error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Send password reset notification
   */
  private async sendPasswordResetNotification(
    email: string,
    firstName: string,
    password: string
  ): Promise<void> {
    try {
      await EmailUtil.sendPasswordResetNotification(email, firstName, password);
      logger.info(`Password reset notification sent to ${email}`);
    } catch (error) {
      logger.error("Error sending password reset notification:", error);
      // Don't throw - this is a non-critical operation
    }
  }
}

// Create and export service instance
export default new UserService(repository);
