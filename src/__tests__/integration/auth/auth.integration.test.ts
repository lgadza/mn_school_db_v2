import request from "supertest";
import app from "@/server";
import db from "@/config/database";
import JwtUtil from "@/common/utils/auth/jwt";
import EncryptionUtil from "@/common/utils/security/encryptionUtil";
import User from "@/features/users/model";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";

// Mocks for external services
jest.mock("@/common/utils/email/emailUtil", () => ({
  __esModule: true,
  default: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  },
}));

describe("Auth API Integration Tests", () => {
  // Test data
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    username: `testuser-${Date.now()}`,
    password: "TestPassword123!",
    firstName: "Integration",
    lastName: "Test",
    phoneNumber: "+12345678901", // Ensure this field is present
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  // Setup: ensure database connection, create test role if needed
  beforeAll(async () => {
    // Connect to database and create tables if needed
    await db.authenticate();

    // Ensure 'user' role exists
    const userRole = await Role.findOne({ where: { name: "user" } });
    if (!userRole) {
      await Role.create({ name: "user", description: "Regular user role" });
    }
  });

  // Cleanup: remove test user after tests
  afterAll(async () => {
    // Delete the test user
    try {
      const user = await User.findOne({ where: { email: testUser.email } });
      if (user) {
        await UserRole.destroy({ where: { userId: user.id } });
        await User.destroy({ where: { id: user.id } });
      }
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }

    // Close database connection
    await db.close();
  });

  describe("User Registration Flow", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      // Save tokens and user ID for subsequent tests
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
      userId = response.body.data.user.id;
    });

    it("should not allow registration with existing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Email already registered");
    });
  });

  describe("Authentication Flow", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      // Update tokens for subsequent tests
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it("should not login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should get current user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.firstName).toBe(testUser.firstName);
      expect(response.body.data.lastName).toBe(testUser.lastName);
      expect(response.body.data.roles).toContain("user");
    });

    it("should not allow access to protected routes without token", async () => {
      const response = await request(app).get("/api/v1/auth/me").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("authentication");
    });

    it("should refresh tokens with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.tokens.accessToken).not.toBe(accessToken);
      expect(response.body.data.tokens.refreshToken).not.toBe(refreshToken);

      // Update tokens for subsequent tests
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);

      // Verify token is no longer valid
      const meResponse = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(401);

      expect(meResponse.body.success).toBe(false);
    });
  });

  describe("Password Reset Flow", () => {
    it("should request password reset successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should still return success for non-existent email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should reset password with valid token", async () => {
      // We need to create a valid reset token directly in the database
      // since we don't have access to the email sent token
      const resetToken = EncryptionUtil.generateSecureToken(32);
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      // Find the user and save the token
      const user = await User.findOne({ where: { email: testUser.email } });
      expect(user).not.toBeNull();

      await user?.update({
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      });

      // Now use the token to reset the password
      const newPassword = "NewPassword123!";
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: resetToken,
          password: newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe(testUser.email);
    });
  });
});
