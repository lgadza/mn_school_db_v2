import { v4 as uuidv4 } from "uuid";
import JwtUtil from "@/common/utils/auth/jwt";
import { UserInterface } from "@/features/users/interfaces";
import User from "@/features/users/model";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";

/**
 * Test helper functions for auth-related tests
 */
export default class AuthTestHelpers {
  /**
   * Create a mock user for testing
   */
  static createMockUser(overrides = {}): Partial<UserInterface> {
    const timestamp = Date.now();
    return {
      id: uuidv4(),
      email: `test-${timestamp}@example.com`,
      username: `testuser-${timestamp}`,
      firstName: "Test",
      lastName: "User",
      phoneNumber: "+12345678901",
      password: "TestPassword123!",
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Generate a valid JWT token for testing
   */
  static generateTestToken(
    userId: string,
    email: string,
    role = "user"
  ): string {
    const { accessToken } = JwtUtil.generateTokenPair(userId, email, role, []);
    return accessToken;
  }
  static async createTestUserInDb(
    userData: Partial<UserInterface> = {}
  ): Promise<{ user: any; cleanup: () => Promise<void> }> {
    const mockUser = this.createMockUser(userData);

    // Create the user
    const user = await User.create(mockUser as any);

    // Assign default role if not already done
    const userRole = await Role.findOne({ where: { name: "user" } });
    if (userRole) {
      await UserRole.create({ userId: user.id, roleId: userRole.id });
    }

    // Return user and cleanup function
    return {
      user,
      cleanup: async () => {
        await UserRole.destroy({ where: { userId: user.id } });
        await User.destroy({ where: { id: user.id } });
      },
    };
  }

  /**
   * Setup a mock authentication context
   * Creates a user, generates tokens, and returns utilities for test
   */
  static async setupAuthContext(): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
    cleanup: () => Promise<void>;
  }> {
    const { user, cleanup } = await this.createTestUserInDb();

    const { accessToken, refreshToken } = JwtUtil.generateTokenPair(
      user.id,
      user.email,
      "user",
      []
    );

    return {
      user,
      accessToken,
      refreshToken,
      cleanup,
    };
  }
}
