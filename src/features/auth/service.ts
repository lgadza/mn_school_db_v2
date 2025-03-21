import { UserInterface } from "@/features/users/interfaces";
import { IAuthService, IAuthRepository } from "./interfaces/services";
import { AuthResponseDTO, UserInfoDTO } from "./dto";
import JwtUtil, { TokenType } from "@/common/utils/auth/jwt";
import EncryptionUtil from "@/common/utils/security/encryptionUtil";
import EmailUtil from "@/common/utils/email/emailUtil";
import DateTimeUtil, { DateFormat } from "@/common/utils/date/dateTimeUtil";
import logger from "@/common/utils/logging/logger";
import { appConfig } from "@/config";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import authRepository from "./repository";

export class AuthService implements IAuthService {
  private repository: IAuthRepository;

  constructor(repository: IAuthRepository) {
    this.repository = repository;
  }

  /**
   * Register a new user
   */
  public async register(
    userData: Partial<UserInterface>
  ): Promise<AuthResponseDTO> {
    // Check if user with email already exists
    const existingUserByEmail = await this.repository.findUserByEmail(
      userData.email as string
    );
    if (existingUserByEmail) {
      throw new BadRequestError(
        "Email already registered",
        ErrorCode.RES_ALREADY_EXISTS
      );
    }

    // Check if username already exists
    const existingUserByUsername = await this.repository.findUserByEmail(
      userData.username as string
    );
    if (existingUserByUsername) {
      throw new BadRequestError(
        "Username already taken",
        ErrorCode.RES_ALREADY_EXISTS
      );
    }

    // Create the user
    const newUser = await this.repository.createUser({
      ...userData,
      isActive: true,
    });

    // Get the default role (user role) and associate it with the new user
    const defaultRoleId = await this.repository.getDefaultRoleId();
    await this.repository.associateUserWithRole(newUser.id, defaultRoleId);

    // Generate JWT tokens
    const { accessToken, refreshToken } = JwtUtil.generateTokenPair(
      newUser.id,
      newUser.email as string,
      "user", // Default role name
      [] // Default permissions (empty array)
    );

    // Send welcome email in the background
    try {
      const verificationToken = JwtUtil.generateSecureToken(
        newUser.id,
        newUser.email as string,
        TokenType.EMAIL_VERIFICATION,
        "24h"
      );

      const verificationLink = `${appConfig.appUrl}/verify-email?token=${verificationToken}`;

      // Send this asynchronously (don't await it)
      EmailUtil.sendWelcomeEmail(
        newUser.email as string,
        newUser.firstName,
        verificationLink
      );
    } catch (error) {
      // Just log email errors, but continue with registration process
      logger.error("Error sending welcome email:", error);
    }

    // Return the user info and tokens
    return {
      user: this.mapUserToUserInfoDTO(newUser),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseInt(appConfig.security.jwtExpiresIn) || 3600,
      },
    };
  }

  /**
   * Login user
   */
  public async login(
    email: string,
    password: string
  ): Promise<AuthResponseDTO> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError(
        "Invalid credentials",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError(
        "Account is disabled",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "Invalid credentials",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    // Get user roles and permissions
    const roles = (user as any).roles || [];
    const roleNames = roles.map((role: any) => role.name);
    const permissions: string[] = []; // In a real app, you'd fetch permissions too

    // Generate JWT tokens
    const { accessToken, refreshToken } = JwtUtil.generateTokenPair(
      user.id,
      user.email as string,
      roleNames[0] || "user", // Use first role or default to "user"
      permissions
    );

    // Update last login timestamp
    await this.repository.updateLastLogin(user.id);

    // Return user info and tokens
    return {
      user: this.mapUserToUserInfoDTO(user, roleNames, permissions),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseInt(appConfig.security.jwtExpiresIn) || 3600,
      },
    };
  }

  /**
   * Refresh user token
   */
  public async refreshToken(refreshToken: string): Promise<AuthResponseDTO> {
    // Verify the refresh token
    const verificationResult = await JwtUtil.verifyToken(refreshToken);
    if (!verificationResult.isValid || !verificationResult.payload) {
      throw new UnauthorizedError(
        "Invalid refresh token",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    const { payload } = verificationResult;

    // Make sure it's a refresh token
    if (payload.type !== TokenType.REFRESH) {
      throw new UnauthorizedError(
        "Invalid token type",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    // Find user
    const user = await this.repository.findUserById(payload.userId);
    if (!user) {
      throw new NotFoundError("User not found", {
        additionalInfo: { code: ErrorCode.RES_NOT_FOUND },
      });
    }

    // Get user roles and permissions
    const roles = (user as any).roles || [];
    const roleNames = roles.map((role: any) => role.name);
    const permissions: string[] = []; // In a real app, you'd fetch permissions too

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } =
      JwtUtil.generateTokenPair(
        user.id,
        user.email as string,
        roleNames[0] || "user",
        permissions
      );

    // Revoke the old refresh token
    await JwtUtil.revokeToken(refreshToken);

    // Return new tokens and user info
    return {
      user: this.mapUserToUserInfoDTO(user, roleNames, permissions),
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: parseInt(appConfig.security.jwtExpiresIn) || 3600,
      },
    };
  }

  /**
   * Logout user
   */
  public async logout(userId: string, refreshToken: string): Promise<boolean> {
    try {
      // Revoke the refresh token
      if (refreshToken) {
        await JwtUtil.revokeToken(refreshToken);
      }

      // Optionally, revoke all tokens for absolute security
      // await JwtUtil.revokeAllUserTokens(userId);

      return true;
    } catch (error) {
      logger.error("Error during logout:", error);
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(userId: string): Promise<UserInfoDTO> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found", {
        additionalInfo: { code: ErrorCode.RES_NOT_FOUND },
      });
    }

    // Get user roles and permissions
    const roles = (user as any).roles || [];
    const roleNames = roles.map((role: any) => role.name);
    const permissions: string[] = []; // In a real app, you'd fetch permissions too

    return this.mapUserToUserInfoDTO(user, roleNames, permissions);
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<boolean> {
    // Find user by email
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Just return success even though we didn't do anything
      return true;
    }

    // Generate a secure reset token
    const resetToken = EncryptionUtil.generateSecureToken(32);

    // Set token expiration (1 hour from now)
    const expiresAt = DateTimeUtil.addTime(new Date(), 1, "hours");

    // Save token to database
    await this.repository.savePasswordResetToken(
      user.id,
      resetToken,
      expiresAt
    );

    // Generate reset URL
    const resetUrl = `${appConfig.appUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await EmailUtil.sendPasswordResetEmail(
        user.email as string,
        user.firstName,
        resetUrl
      );
      return true;
    } catch (error) {
      logger.error("Error sending password reset email:", error);
      throw new AppError("Failed to send password reset email");
    }
  }

  /**
   * Reset password with token
   */
  public async resetPassword(
    token: string,
    newPassword: string
  ): Promise<boolean> {
    // Find user with valid token
    const user = await this.repository.findUserByResetToken(token);
    if (!user) {
      throw new BadRequestError(
        "Invalid or expired reset token",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    // Hash the new password
    const hashedPassword = await EncryptionUtil.hashPassword(newPassword);

    // Update user's password and clear reset token via repository
    await this.repository.updatePasswordAndClearResetToken(
      user.id,
      hashedPassword
    );

    // Revoke all existing tokens for the user
    await JwtUtil.revokeAllUserTokens(user.id);

    return true;
  }

  /**
   * Verify email with token
   */
  public async verifyEmail(token: string): Promise<boolean> {
    // Verify the email verification token
    const verificationResult = await JwtUtil.verifyToken(token);
    if (!verificationResult.isValid || !verificationResult.payload) {
      throw new BadRequestError(
        "Invalid verification token",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    const { payload } = verificationResult;

    // Make sure it's an email verification token
    if (payload.type !== TokenType.EMAIL_VERIFICATION) {
      throw new BadRequestError(
        "Invalid token type",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    // Find user
    const user = await this.repository.findUserById(payload.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update user's email verification status
    // This would require adding an 'emailVerified' field to the User model
    // For now, just return true to indicate success

    // Revoke the verification token
    await JwtUtil.revokeToken(token);

    return true;
  }

  /**
   * Map User entity to UserInfoDTO
   */
  private mapUserToUserInfoDTO(
    user: UserInterface,
    roles: string[] = [],
    permissions: string[] = []
  ): UserInfoDTO {
    // Format last login date
    const lastLogin = user.lastLogin
      ? DateTimeUtil.formatDate(user.lastLogin, DateFormat.ISO)
      : null;

    // Format date of birth
    const dateOfBirth = user.dateOfBirth
      ? DateTimeUtil.formatDate(user.dateOfBirth, DateFormat.DATE)
      : null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      phoneNumber: user.phoneNumber,
      gender: user.gender || null,
      dateOfBirth: dateOfBirth,
      roles: roles,
      permissions: permissions,
      lastLogin: lastLogin,
    };
  }
}

// Create and export service instance
export default new AuthService(authRepository);
