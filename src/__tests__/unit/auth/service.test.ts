import { AuthService } from "@/features/auth/service";
import { UserInterface } from "@/features/users/interfaces";
import JwtUtil, { TokenType } from "@/common/utils/auth/jwt";
import EncryptionUtil from "@/common/utils/security/encryptionUtil";
import EmailUtil from "@/common/utils/email/emailUtil";
import DateTimeUtil from "@/common/utils/date/dateTimeUtil";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

// Mocks
jest.mock("@/common/utils/auth/jwt");
jest.mock("@/common/utils/security/encryptionUtil");
jest.mock("@/common/utils/email/emailUtil");
jest.mock("@/common/utils/date/dateTimeUtil");
jest.mock("@/common/utils/logging/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("AuthService", () => {
  // Mock repository
  const mockRepository = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateLastLogin: jest.fn(),
    savePasswordResetToken: jest.fn(),
    findUserByResetToken: jest.fn(),
    clearPasswordResetToken: jest.fn(),
    associateUserWithRole: jest.fn(),
    getDefaultRoleId: jest.fn(),
    updatePasswordAndClearResetToken: jest.fn(),
  };

  // Create the service with mocked dependencies
  const service = new AuthService(mockRepository);

  // Common test data
  const userId = "test-uuid-123";
  const userEmail = "test@example.com";
  const defaultRoleId = "role-123";

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock implementations
    (EmailUtil.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);
    (EmailUtil.sendPasswordResetEmail as jest.Mock).mockResolvedValue(true);
    (JwtUtil.generateTokenPair as jest.Mock).mockReturnValue({
      accessToken: "fake-access-token",
      refreshToken: "fake-refresh-token",
    });
    (JwtUtil.generateSecureToken as jest.Mock).mockReturnValue(
      "verification-token"
    );
  });

  describe("register", () => {
    const registerData = {
      email: userEmail,
      username: "testuser",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "+1234567890",
    };

    const newUser = {
      id: userId,
      ...registerData,
      verifyPassword: jest.fn(),
      isActive: true,
    };

    it("should register a new user successfully", async () => {
      // Arrange
      mockRepository.findUserByEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockRepository.createUser.mockResolvedValue(newUser);
      mockRepository.getDefaultRoleId.mockResolvedValue(defaultRoleId);
      mockRepository.associateUserWithRole.mockResolvedValue(undefined);

      // Act
      const result = await service.register(registerData);

      // Assert
      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith(userEmail);
      expect(mockRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          ...registerData,
          isActive: true,
        })
      );
      expect(mockRepository.getDefaultRoleId).toHaveBeenCalled();
      expect(mockRepository.associateUserWithRole).toHaveBeenCalledWith(
        userId,
        defaultRoleId
      );
      expect(JwtUtil.generateTokenPair).toHaveBeenCalledWith(
        userId,
        userEmail,
        "user",
        []
      );
      expect(JwtUtil.generateSecureToken).toHaveBeenCalledWith(
        userId,
        userEmail,
        TokenType.EMAIL_VERIFICATION,
        "24h"
      );
      expect(EmailUtil.sendWelcomeEmail).toHaveBeenCalledWith(
        userEmail,
        registerData.firstName,
        expect.any(String)
      );

      // Check the result structure
      expect(result).toEqual({
        user: expect.objectContaining({
          id: userId,
          email: userEmail,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        }),
        tokens: {
          accessToken: "fake-access-token",
          refreshToken: "fake-refresh-token",
          expiresIn: expect.any(Number),
        },
      });
    });

    it("should throw BadRequestError if email already exists", async () => {
      // Arrange
      mockRepository.findUserByEmail.mockResolvedValueOnce({
        id: "existing-id",
        email: userEmail,
      } as UserInterface);

      // Act & Assert
      await expect(service.register(registerData)).rejects.toThrow(
        new BadRequestError(
          "Email already registered",
          ErrorCode.RES_ALREADY_EXISTS
        )
      );

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if username already exists", async () => {
      // Arrange
      mockRepository.findUserByEmail.mockResolvedValueOnce(null);
      mockRepository.findUserByEmail.mockResolvedValueOnce({
        id: "existing-id",
        username: registerData.username,
      } as UserInterface);

      // Act & Assert
      await expect(service.register(registerData)).rejects.toThrow(
        new BadRequestError(
          "Username already taken",
          ErrorCode.RES_ALREADY_EXISTS
        )
      );

      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it("should still complete registration if email sending fails", async () => {
      // Arrange
      mockRepository.findUserByEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockRepository.createUser.mockResolvedValue(newUser);
      mockRepository.getDefaultRoleId.mockResolvedValue(defaultRoleId);
      mockRepository.associateUserWithRole.mockResolvedValue(undefined);

      // Setup mock to safely reject without throwing in test
      (EmailUtil.sendWelcomeEmail as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error("Email sending failed"))
      );

      // Act
      const result = await service.register(registerData);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.id).toBe(userId);
      expect(result.tokens.accessToken).toBe("fake-access-token");
    });
  });

  describe("login", () => {
    const loginCredentials = {
      email: userEmail,
      password: "Password123!",
    };

    const mockUser = {
      id: userId,
      email: userEmail,
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      isActive: true,
      verifyPassword: jest.fn(),
      roles: [{ name: "user" }],
    };

    it("should login a user successfully", async () => {
      // Arrange
      mockRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockUser.verifyPassword.mockResolvedValue(true);
      mockRepository.updateLastLogin.mockResolvedValue(undefined);

      (JwtUtil.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      // Act
      const result = await service.login(
        loginCredentials.email,
        loginCredentials.password
      );

      // Assert
      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith(
        loginCredentials.email
      );
      expect(mockUser.verifyPassword).toHaveBeenCalledWith(
        loginCredentials.password
      );
      expect(mockRepository.updateLastLogin).toHaveBeenCalledWith(userId);
      expect(JwtUtil.generateTokenPair).toHaveBeenCalledWith(
        userId,
        userEmail,
        "user",
        []
      );

      // Check the result
      expect(result).toEqual({
        user: expect.objectContaining({
          id: userId,
          email: userEmail,
        }),
        tokens: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
          expiresIn: expect.any(Number),
        },
      });
    });

    it("should throw UnauthorizedError if user not found", async () => {
      // Arrange
      mockRepository.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login(loginCredentials.email, loginCredentials.password)
      ).rejects.toThrow(
        new UnauthorizedError(
          "Invalid credentials",
          ErrorCode.AUTH_INVALID_CREDENTIALS
        )
      );

      expect(mockRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError if user is not active", async () => {
      // Arrange
      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };
      mockRepository.findUserByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(
        service.login(loginCredentials.email, loginCredentials.password)
      ).rejects.toThrow(
        new UnauthorizedError(
          "Account is disabled",
          ErrorCode.AUTH_INVALID_CREDENTIALS
        )
      );

      expect(inactiveUser.verifyPassword).not.toHaveBeenCalled();
      expect(mockRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError if password verification fails", async () => {
      // Arrange
      mockRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockUser.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.login(loginCredentials.email, loginCredentials.password)
      ).rejects.toThrow(
        new UnauthorizedError(
          "Invalid credentials",
          ErrorCode.AUTH_INVALID_CREDENTIALS
        )
      );

      expect(mockRepository.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    const refreshToken = "valid-refresh-token";

    it("should refresh tokens successfully", async () => {
      // Arrange
      const mockUser = {
        id: userId,
        email: userEmail,
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        roles: [{ name: "user" }],
      };

      (JwtUtil.verifyToken as jest.Mock).mockResolvedValue({
        isValid: true,
        payload: {
          userId,
          email: userEmail,
          type: TokenType.REFRESH,
        },
      });

      mockRepository.findUserById.mockResolvedValue(mockUser);

      (JwtUtil.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      (JwtUtil.revokeToken as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.refreshToken(refreshToken);

      // Assert
      expect(JwtUtil.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(mockRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(JwtUtil.generateTokenPair).toHaveBeenCalledWith(
        userId,
        userEmail,
        "user",
        []
      );
      expect(JwtUtil.revokeToken).toHaveBeenCalledWith(refreshToken);

      // Check the result
      expect(result).toEqual({
        user: expect.objectContaining({
          id: userId,
          email: userEmail,
        }),
        tokens: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
          expiresIn: expect.any(Number),
        },
      });
    });

    it("should throw UnauthorizedError if token is invalid", async () => {
      // Arrange
      (JwtUtil.verifyToken as jest.Mock).mockResolvedValue({
        isValid: false,
        payload: null,
      });

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedError(
          "Invalid refresh token",
          ErrorCode.AUTH_INVALID_TOKEN
        )
      );

      expect(mockRepository.findUserById).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError if token is not a refresh token", async () => {
      // Arrange
      (JwtUtil.verifyToken as jest.Mock).mockResolvedValue({
        isValid: true,
        payload: {
          userId,
          email: userEmail,
          type: TokenType.ACCESS, // Not a refresh token
        },
      });

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new UnauthorizedError(
          "Invalid token type",
          ErrorCode.AUTH_INVALID_TOKEN
        )
      );

      expect(mockRepository.findUserById).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if user not found", async () => {
      // Arrange
      (JwtUtil.verifyToken as jest.Mock).mockResolvedValue({
        isValid: true,
        payload: {
          userId,
          email: userEmail,
          type: TokenType.REFRESH,
        },
      });

      mockRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        new NotFoundError("User not found", {
          additionalInfo: { code: ErrorCode.RES_NOT_FOUND },
        })
      );

      expect(JwtUtil.generateTokenPair).not.toHaveBeenCalled();
    });
  });

  // Additional test suites for other methods
  describe("logout", () => {
    it("should logout successfully", async () => {
      // Arrange
      (JwtUtil.revokeToken as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.logout(userId, "refresh-token");

      // Assert
      expect(JwtUtil.revokeToken).toHaveBeenCalledWith("refresh-token");
      expect(result).toBe(true);
    });

    it("should handle errors gracefully during logout", async () => {
      // Arrange
      (JwtUtil.revokeToken as jest.Mock).mockRejectedValue(
        new Error("Token revocation failed")
      );

      // Act
      const result = await service.logout(userId, "refresh-token");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user information", async () => {
      // Arrange
      const mockUser = {
        id: userId,
        email: userEmail,
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        roles: [{ name: "user" }],
      };

      mockRepository.findUserById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getCurrentUser(userId);

      // Assert
      expect(mockRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          email: userEmail,
          firstName: "Test",
          lastName: "User",
        })
      );
    });

    it("should throw NotFoundError if user not found", async () => {
      // Arrange
      mockRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentUser(userId)).rejects.toThrow(
        new NotFoundError("User not found", {
          additionalInfo: { code: ErrorCode.RES_NOT_FOUND },
        })
      );
    });
  });

  // More tests for password reset, verify email, etc.
});
