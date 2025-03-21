import { UserInterface } from "@/features/users/interfaces";
import { IAuthRepository } from "./interfaces/services";
import User from "@/features/users/model";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";
import { Transaction } from "sequelize";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class AuthRepository implements IAuthRepository {
  /**
   * Find a user by email
   */
  public async findUserByEmail(email: string): Promise<UserInterface | null> {
    try {
      return await User.findOne({
        where: { email },
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] }, // Exclude join table attributes
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding user by email:", error);
      throw new DatabaseError("Database error while finding user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Find a user by ID
   */
  public async findUserById(id: string): Promise<UserInterface | null> {
    try {
      return await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] }, // Exclude join table attributes
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding user by ID:", error);
      throw new DatabaseError("Database error while finding user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Create a new user
   */
  public async createUser(
    userData: Omit<UserInterface, "id"> & { id?: string }
  ): Promise<UserInterface> {
    try {
      return await User.create(userData as any);
    } catch (error) {
      logger.error("Error creating user:", error);
      throw new DatabaseError("Database error while creating user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update user's last login timestamp
   */
  public async updateLastLogin(userId: string): Promise<void> {
    try {
      await User.update({ lastLogin: new Date() }, { where: { id: userId } });
    } catch (error) {
      logger.error("Error updating last login:", error);
      throw new DatabaseError("Database error while updating last login", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Save password reset token for a user
   */
  public async savePasswordResetToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void> {
    try {
      await User.update(
        {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error("Error saving password reset token:", error);
      throw new DatabaseError("Database error while saving reset token", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Find a user by reset token
   */
  public async findUserByResetToken(
    token: string
  ): Promise<UserInterface | null> {
    try {
      return await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            [Symbol.for("gt")]: new Date(),
          },
        },
      });
    } catch (error) {
      logger.error("Error finding user by reset token:", error);
      throw new DatabaseError("Database error while finding user by token", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Clear password reset token
   */
  public async clearPasswordResetToken(userId: string): Promise<void> {
    try {
      await User.update(
        {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error("Error clearing password reset token:", error);
      throw new DatabaseError("Database error while clearing reset token", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Associate user with a role
   */
  public async associateUserWithRole(
    userId: string,
    roleId: string
  ): Promise<void> {
    try {
      await UserRole.create({ userId, roleId });
    } catch (error) {
      logger.error("Error associating user with role:", error);
      throw new DatabaseError("Database error while associating role", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Get the default role ID (typically 'user' role)
   */
  public async getDefaultRoleId(): Promise<string> {
    try {
      const userRole = await Role.findOne({ where: { name: "user" } });
      if (!userRole) {
        throw new Error("Default user role not found");
      }
      return userRole.id;
    } catch (error) {
      logger.error("Error getting default role ID:", error);
      throw new DatabaseError("Database error while getting default role", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update user's password and clear reset token
   */
  public async updatePasswordAndClearResetToken(
    userId: string,
    newPassword: string
  ): Promise<void> {
    try {
      await User.update(
        {
          password: newPassword, // This will be hashed by the User model hook
          passwordResetToken: null,
          passwordResetExpires: null,
        },
        { where: { id: userId } }
      );
    } catch (error) {
      logger.error("Error updating password:", error);
      throw new DatabaseError("Database error while updating password", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }
}

export default new AuthRepository();
