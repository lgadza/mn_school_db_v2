import request from "supertest";
import app from "@/server";
import db from "@/config/database";
import User from "@/features/users/model";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";

// This test focuses on end-to-end user flows without mocking

describe("Auth Module E2E Tests", () => {
  // Test data with unique values to avoid conflicts
  const timestamp = Date.now();
  const testUser = {
    email: `e2e-test-${timestamp}@example.com`,
    username: `e2e-testuser-${timestamp}`,
    password: "E2ETestPass123!",
    firstName: "E2E",
    lastName: "Test",
    phoneNumber: "+12345678901", // Make sure this field is present
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  // Setup: ensure database connection
  beforeAll(async () => {
    await db.authenticate();
  });

  // Cleanup: remove test user after tests
  afterAll(async () => {
    try {
      const user = await User.findOne({ where: { email: testUser.email } });
      if (user) {
        await UserRole.destroy({ where: { userId: user.id } });
        await User.destroy({ where: { id: user.id } });
      }
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }

    await db.close();
  });

  // Complete user journey tests
  describe("Complete User Journey", () => {
    it("Step 1: Register a new user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);

      userId = response.body.data.user.id;
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it("Step 2: Access user profile with token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it("Step 3: Logout from the system", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify token is no longer valid
      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(401);
    });

    it("Step 4: Login with credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);

      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it("Step 5: Refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();

      const oldAccessToken = accessToken;
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;

      // Verify old token no longer works
      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${oldAccessToken}`)
        .expect(401);

      // Verify new token works
      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
    });

    it("Step 6: Request password reset", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check that reset token was saved to database
      const user = await User.findOne({ where: { email: testUser.email } });
      expect(user).not.toBeNull();
      expect(user?.passwordResetToken).not.toBeNull();
      expect(user?.passwordResetExpires).not.toBeNull();

      // Save the reset token for next test
      const resetToken = user?.passwordResetToken;

      // Step 7: Reset password using token
      const newPassword = "NewE2EPassword123!";
      const resetResponse = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: resetToken,
          password: newPassword,
        })
        .expect(200);

      expect(resetResponse.body.success).toBe(true);

      // Verify token is cleared from database
      const updatedUser = await User.findOne({
        where: { email: testUser.email },
      });
      expect(updatedUser?.passwordResetToken).toBeNull();

      // Step 8: Login with new password
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe(testUser.email);
      expect(loginResponse.body.data.tokens.accessToken).toBeDefined();
    });
  });

  describe("Error Handling Scenarios", () => {
    it("should handle rate limiting", async () => {
      // Make multiple rapid requests to trigger rate limiter
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .post("/api/v1/auth/login")
            .send({
              email: `random${i}@example.com`,
              password: "password123",
            })
        );
      }

      const responses = await Promise.all(promises);

      // At least one of the responses should be rate limited (429)
      const rateLimited = responses.some((res) => res.status === 429);
      expect(rateLimited).toBe(true);
    });

    it("should validate input properly", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email",
          username: "a", // Too short
          password: "123", // Too weak
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
