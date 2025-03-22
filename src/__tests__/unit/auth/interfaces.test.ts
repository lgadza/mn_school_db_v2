import { AuthService } from "@/features/auth/service";
import {
  IAuthService,
  IAuthRepository,
} from "@/features/auth/interfaces/services";
import { AuthRepository } from "@/features/auth/repository";
import { AuthResponseDTO, UserInfoDTO } from "@/features/auth/dto";

describe("Auth Interfaces", () => {
  describe("IAuthService Implementation", () => {
    it("should implement all required interface methods", () => {
      // Create a mock repository to instantiate the service
      const mockRepo = {} as IAuthRepository;
      const service = new AuthService(mockRepo);

      // Expected methods from the interface
      const expectedMethods = [
        "register",
        "login",
        "refreshToken",
        "logout",
        "getCurrentUser",
        "requestPasswordReset",
        "resetPassword",
        "verifyEmail",
      ];

      // Check that each method exists on the service
      expectedMethods.forEach((method) => {
        expect(typeof service[method as keyof AuthService]).toBe("function");
      });
    });
  });

  describe("IAuthRepository Implementation", () => {
    it("should implement all required interface methods", () => {
      const repository = new AuthRepository();

      // Expected methods from the interface
      const expectedMethods = [
        "findUserByEmail",
        "findUserById",
        "createUser",
        "updateLastLogin",
        "savePasswordResetToken",
        "findUserByResetToken",
        "clearPasswordResetToken",
        "associateUserWithRole",
        "getDefaultRoleId",
        "updatePasswordAndClearResetToken",
      ];

      // Check that each method exists on the repository
      expectedMethods.forEach((method) => {
        expect(typeof repository[method as keyof AuthRepository]).toBe(
          "function"
        );
      });
    });
  });

  describe("DTOs", () => {
    it("should validate AuthResponseDTO structure", () => {
      // Create a mock AuthResponseDTO
      const authResponse: AuthResponseDTO = {
        user: {
          id: "user-123",
          email: "test@example.com",
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          fullName: "Test User",
          avatar: null,
          phoneNumber: "+12345678901",
          gender: "male",
          dateOfBirth: null,
          roles: ["user"],
          permissions: [],
          lastLogin: null,
        },
        tokens: {
          accessToken: "jwt-token-123",
          refreshToken: "refresh-token-123",
          expiresIn: 3600,
        },
      };

      // Verify structure
      expect(authResponse.user).toBeDefined();
      expect(authResponse.tokens).toBeDefined();
      expect(authResponse.tokens.accessToken).toBeDefined();
      expect(authResponse.tokens.refreshToken).toBeDefined();
      expect(authResponse.tokens.expiresIn).toBeDefined();
    });

    it("should validate UserInfoDTO structure", () => {
      // Create a mock UserInfoDTO
      const userInfo: UserInfoDTO = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        fullName: "Test User",
        avatar: null,
        phoneNumber: "+12345678901",
        gender: "male",
        dateOfBirth: null,
        roles: ["user"],
        permissions: [],
        lastLogin: null,
      };

      // Verify structure
      expect(userInfo.id).toBeDefined();
      expect(userInfo.email).toBeDefined();
      expect(userInfo.username).toBeDefined();
      expect(userInfo.firstName).toBeDefined();
      expect(userInfo.lastName).toBeDefined();
      expect(userInfo.fullName).toBeDefined();
      expect(Array.isArray(userInfo.roles)).toBe(true);
      expect(Array.isArray(userInfo.permissions)).toBe(true);
    });
  });
});
