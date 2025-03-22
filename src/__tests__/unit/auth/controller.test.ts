import { AuthController } from "@/features/auth/controller";
import { Request, Response } from "express";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

// Mocks
jest.mock("@/common/utils/responses/responseUtil");
jest.mock("@/common/utils/logging/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("AuthController", () => {
  // Mock request and response
  let req: Partial<Request>;
  let res: Partial<Response>;

  // Mock auth service
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
  };

  // Create controller with mocked service
  const controller = new AuthController(mockAuthService);

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      user: { userId: "test-user-123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      // Arrange
      const registerData = {
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      };

      const mockResult = {
        user: {
          id: "user-123",
          email: registerData.email,
        },
        tokens: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          expiresIn: 3600,
        },
      };

      req.body = registerData;
      mockAuthService.register.mockResolvedValue(mockResult);

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(ResponseUtil.sendSuccess).toHaveBeenCalledWith(
        res,
        mockResult,
        "User registered successfully",
        HttpStatus.CREATED
      );
    });

    it("should handle AppError during registration", async () => {
      // Arrange
      req.body = { email: "existing@example.com" };
      const error = new BadRequestError(
        "Email already registered",
        ErrorCode.RES_ALREADY_EXISTS
      );
      mockAuthService.register.mockRejectedValue(error);

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(ResponseUtil.sendError).toHaveBeenCalledWith(
        res,
        error.message,
        error.httpCode,
        { code: error.metadata.code }
      );
    });

    it("should handle generic errors during registration", async () => {
      // Arrange
      req.body = { email: "test@example.com" };
      mockAuthService.register.mockRejectedValue(new Error("Unexpected error"));

      // Act
      await controller.register(req as Request, res as Response);

      // Assert
      expect(ResponseUtil.sendError).toHaveBeenCalledWith(
        res,
        "Error during registration",
        HttpStatus.INTERNAL_SERVER_ERROR,
        { code: ErrorCode.GEN_INTERNAL_ERROR }
      );
    });
  });

  describe("login", () => {
    it("should login a user successfully", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "Password123!",
      };

      const mockResult = {
        user: {
          id: "user-123",
          email: loginData.email,
        },
        tokens: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          expiresIn: 3600,
        },
      };

      req.body = loginData;
      mockAuthService.login.mockResolvedValue(mockResult);

      // Act
      await controller.login(req as Request, res as Response);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(ResponseUtil.sendSuccess).toHaveBeenCalledWith(
        res,
        mockResult,
        "Login successful"
      );
    });

    it("should handle AppError during login", async () => {
      // Arrange
      req.body = { email: "test@example.com", password: "wrong" };
      const error = new UnauthorizedError(
        "Invalid credentials",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
      mockAuthService.login.mockRejectedValue(error);

      // Act
      await controller.login(req as Request, res as Response);

      // Assert
      expect(ResponseUtil.sendError).toHaveBeenCalledWith(
        res,
        error.message,
        error.httpCode,
        { code: error.metadata.code }
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user successfully", async () => {
      // Arrange
      const mockUserInfo = {
        id: "user-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUserInfo);

      // Act
      await controller.getCurrentUser(req as Request, res as Response);

      // Assert
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(
        "test-user-123"
      );
      expect(ResponseUtil.sendSuccess).toHaveBeenCalledWith(
        res,
        mockUserInfo,
        "User information retrieved successfully"
      );
    });

    it("should handle NotFoundError", async () => {
      // Arrange
      const error = new NotFoundError("User not found", {
        additionalInfo: { code: ErrorCode.RES_NOT_FOUND },
      });
      mockAuthService.getCurrentUser.mockRejectedValue(error);

      // Act
      await controller.getCurrentUser(req as Request, res as Response);

      // Assert
      expect(ResponseUtil.sendError).toHaveBeenCalledWith(
        res,
        error.message,
        error.httpCode,
        { code: error.metadata.code }
      );
    });
  });

  // Additional tests for refreshToken, logout, requestPasswordReset, resetPassword, verifyEmail
});
