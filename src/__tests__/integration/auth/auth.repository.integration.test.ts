import { AuthRepository } from "@/features/auth/repository";
import User from "@/features/users/model";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";
import db from "@/config/database";
import { v4 as uuidv4 } from "uuid";

describe("AuthRepository Integration Tests", () => {
  let repository: AuthRepository;
  let testUser: any;
  let testUserPassword: string;
  let testRoleId: string;

  // Setup before all tests
  beforeAll(async () => {
    // Connect to the database
    await db.authenticate();

    // Initialize repository
    repository = new AuthRepository();

    // Create a test role if it doesn't exist
    let role = await Role.findOne({ where: { name: "user" } });
    if (!role) {
      role = await Role.create({
        name: "user",
        description: "Regular user role",
      });
    }
    testRoleId = role.id;

    // Generate unique test data
    const timestamp = Date.now();
    testUserPassword = "TestPass123!";

    // Create test user
    testUser = await User.create({
      id: uuidv4(),
      email: `repo-test-${timestamp}@example.com`,
      username: `repouser-${timestamp}`,
      password: testUserPassword, // This will be hashed by the model hooks
      firstName: "Repo",
      lastName: "Test",
      phoneNumber: "+12345678901",
      isActive: true,
    });

    // Associate with role
    await UserRole.create({
      userId: testUser.id,
      roleId: testRoleId,
    });
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Delete test user and associations
    if (testUser) {
      await UserRole.destroy({ where: { userId: testUser.id } });
      await User.destroy({ where: { id: testUser.id } });
    }

    // Close database connection
    await db.close();
  });

  describe("findUserByEmail", () => {
    it("should find a user by email", async () => {
      // Act
      const result = await repository.findUserByEmail(testUser.email);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(testUser.id);
      expect(result?.email).toBe(testUser.email);
      expect(result?.username).toBe(testUser.username);
      expect(Array.isArray((result as any).roles)).toBe(true);
      expect((result as any).roles.length).toBeGreaterThan(0);
      expect((result as any).roles[0].name).toBe("user");
    });

    it("should return null for non-existent email", async () => {
      // Act
      const result = await repository.findUserByEmail(
        "nonexistent@example.com"
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findUserById", () => {
    it("should find a user by ID", async () => {
      // Act
      const result = await repository.findUserById(testUser.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(testUser.id);
      expect(result?.email).toBe(testUser.email);
      expect(Array.isArray((result as any).roles)).toBe(true);
    });

    it("should return null for non-existent ID", async () => {
      // Act
      const result = await repository.findUserById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("updateLastLogin", () => {
    it("should update the last login timestamp", async () => {
      // Arrange
      const beforeUpdate = await User.findByPk(testUser.id);
      expect(beforeUpdate?.lastLogin).toBeNull();

      // Act
      await repository.updateLastLogin(testUser.id);

      // Assert
      const afterUpdate = await User.findByPk(testUser.id);
      expect(afterUpdate?.lastLogin).not.toBeNull();
      expect(afterUpdate?.lastLogin instanceof Date).toBe(true);
    });
  });

  describe("Password reset operations", () => {
    it("should save and clear password reset token", async () => {
      // Arrange
      const token = "test-reset-token";
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      // Act - Save token
      await repository.savePasswordResetToken(testUser.id, token, expires);

      // Assert - Token saved
      const userWithToken = await User.findByPk(testUser.id);
      expect(userWithToken?.passwordResetToken).toBe(token);
      expect(userWithToken?.passwordResetExpires).toEqual(expires);

      // Act - Clear token
      await repository.clearPasswordResetToken(testUser.id);

      // Assert - Token cleared
      const userAfterClear = await User.findByPk(testUser.id);
      expect(userAfterClear?.passwordResetToken).toBeNull();
      expect(userAfterClear?.passwordResetExpires).toBeNull();
    });

    it("should find user by reset token", async () => {
      // Arrange
      const token = "find-by-token-test";
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
      await repository.savePasswordResetToken(testUser.id, token, expires);

      // Act
      const foundUser = await repository.findUserByResetToken(token);

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(testUser.id);

      // Cleanup
      await repository.clearPasswordResetToken(testUser.id);
    });

    it("should not find user with expired token", async () => {
      // Arrange
      const token = "expired-token-test";
      const expires = new Date(Date.now() - 3600000); // 1 hour ago (expired)
      await User.update(
        { passwordResetToken: token, passwordResetExpires: expires },
        { where: { id: testUser.id } }
      );

      // Act
      const foundUser = await repository.findUserByResetToken(token);

      // Assert
      expect(foundUser).toBeNull();

      // Cleanup
      await repository.clearPasswordResetToken(testUser.id);
    });
  });

  describe("Role operations", () => {
    it("should get the default role ID", async () => {
      // Act
      const roleId = await repository.getDefaultRoleId();

      // Assert
      expect(roleId).toBe(testRoleId);
    });

    it("should associate user with a role", async () => {
      // Arrange - Create a new test user without role
      const newUserId = uuidv4();

      // Sequelize models automatically add the verifyPassword method,
      // so we don't need to include it in the creation data
      const newUser = await User.create({
        id: newUserId,
        email: `new-user-${Date.now()}@example.com`,
        username: `new-user-${Date.now()}`,
        password: "Password123!",
        firstName: "New",
        lastName: "User",
        phoneNumber: "+12345678901",
        isActive: true,
      });

      // Act
      await repository.associateUserWithRole(newUserId, testRoleId);

      // Assert
      const userRole = await UserRole.findOne({
        where: { userId: newUserId, roleId: testRoleId },
      });
      expect(userRole).not.toBeNull();

      // Cleanup
      await UserRole.destroy({ where: { userId: newUserId } });
      await User.destroy({ where: { id: newUserId } });
    });
  });
});
