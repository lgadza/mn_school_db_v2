import { AuthRepository } from "@/features/auth/repository";
import User from "@/features/users/model";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

// Mocks
jest.mock("@/features/users/model");
jest.mock("@/features/rbac/models/roles.model");
jest.mock("@/features/users/user-role.model");
jest.mock("@/common/utils/logging/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("AuthRepository", () => {
  let repository: AuthRepository;

  // Common test data
  const userId = "test-user-123";
  const userEmail = "test@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AuthRepository();
  });

  describe("findUserByEmail", () => {
    it("should find a user by email", async () => {
      // Arrange
      const mockUser = { id: userId, email: userEmail };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await repository.findUserByEmail(userEmail);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: userEmail },
        include: [
          expect.objectContaining({
            model: Role,
            as: "roles",
          }),
        ],
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.findUserByEmail(userEmail);

      // Assert
      expect(result).toBeNull();
    });

    it("should throw DatabaseError on query error", async () => {
      // Arrange
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database connection error")
      );

      // Act & Assert
      await expect(repository.findUserByEmail(userEmail)).rejects.toThrow(
        new DatabaseError("Database error while finding user", {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        })
      );
    });
  });

  describe("findUserById", () => {
    it("should find a user by ID", async () => {
      // Arrange
      const mockUser = { id: userId, email: userEmail };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await repository.findUserById(userId);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          include: [
            expect.objectContaining({
              model: Role,
              as: "roles",
            }),
          ],
        })
      );
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.findUserById(userId);

      // Assert
      expect(result).toBeNull();
    });

    it("should throw DatabaseError on query error", async () => {
      // Arrange
      (User.findByPk as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(repository.findUserById(userId)).rejects.toThrow(
        new DatabaseError("Database error while finding user", {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        })
      );
    });
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      // Arrange
      const userData = {
        email: userEmail,
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "+1234567890",
        isActive: true,
        // Add mock implementation of verifyPassword for testing
        verifyPassword: async (password: string): Promise<boolean> => true,
      };

      const mockUser = { id: userId, ...userData };
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await repository.createUser(userData);

      // Assert
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    it("should throw DatabaseError on creation error", async () => {
      // Arrange
      const userData = {
        email: userEmail,
        username: "testuser",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "+1234567890",
        isActive: true,
        // Add mock implementation of verifyPassword for testing
        verifyPassword: async (password: string): Promise<boolean> => true,
      };

      (User.create as jest.Mock).mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(repository.createUser(userData)).rejects.toThrow(
        new DatabaseError("Database error while creating user", {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        })
      );
    });
  });

  describe("updateLastLogin", () => {
    it("should update the last login timestamp", async () => {
      // Arrange
      (User.update as jest.Mock).mockResolvedValue([1]);

      // Act
      await repository.updateLastLogin(userId);

      // Assert
      expect(User.update).toHaveBeenCalledWith(
        { lastLogin: expect.any(Date) },
        { where: { id: userId } }
      );
    });

    it("should throw DatabaseError on update error", async () => {
      // Arrange
      (User.update as jest.Mock).mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(repository.updateLastLogin(userId)).rejects.toThrow(
        new DatabaseError("Database error while updating last login", {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        })
      );
    });
  });

  describe("getDefaultRoleId", () => {
    it("should return the default role ID", async () => {
      // Arrange
      const roleId = "role-123";
      (Role.findOne as jest.Mock).mockResolvedValue({
        id: roleId,
        name: "user",
      });

      // Act
      const result = await repository.getDefaultRoleId();

      // Assert
      expect(Role.findOne).toHaveBeenCalledWith({ where: { name: "user" } });
      expect(result).toEqual(roleId);
    });

    it("should throw Error if default role not found", async () => {
      // Arrange
      (Role.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.getDefaultRoleId()).rejects.toThrow(
        /Default user role not found|Database error while getting default role/
      );
    });

    it("should throw DatabaseError on query error", async () => {
      // Arrange
      (Role.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(repository.getDefaultRoleId()).rejects.toThrow(
        new DatabaseError("Database error while getting default role", {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        })
      );
    });
  });

  // Additional tests for other repository methods
});
