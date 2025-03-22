import { authSchemas } from "@/features/auth/schema";
import Joi from "joi";

describe("Auth Schemas", () => {
  describe("register schema", () => {
    it("should validate valid registration data", () => {
      // Arrange
      const validData = {
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
        phoneNumber: "+12345678901",
        gender: "male",
        dateOfBirth: "1990-01-01",
        countryCode: "US",
      };

      // Act
      const { error, value } = authSchemas.register.body.validate(validData);

      // Assert
      expect(error).toBeUndefined();
      // Check each property individually instead of deep equality
      expect(value.email).toBe(validData.email);
      expect(value.username).toBe(validData.username);
      expect(value.password).toBe(validData.password);
      expect(value.firstName).toBe(validData.firstName);
      expect(value.lastName).toBe(validData.lastName);
      expect(value.phoneNumber).toBe(validData.phoneNumber);
      expect(value.gender).toBe(validData.gender);
      expect(value.countryCode).toBe(validData.countryCode);
      // For date, just check if it's valid date (Joi converts string dates to Date objects)
      expect(value.dateOfBirth instanceof Date).toBe(true);
    });

    it("should validate minimal registration data", () => {
      // Arrange
      const minimalData = {
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      };

      // Act
      const { error, value } = authSchemas.register.body.validate(minimalData);

      // Assert
      expect(error).toBeUndefined();
      expect(value).toEqual(minimalData);
    });

    it("should reject invalid email format", () => {
      // Arrange
      const invalidData = {
        email: "invalid-email",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      };

      // Act
      const { error } = authSchemas.register.body.validate(invalidData);

      // Assert
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain("email");
    });

    it("should reject short username", () => {
      // Arrange
      const invalidData = {
        email: "test@example.com",
        username: "te", // Too short
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      };

      // Act
      const { error } = authSchemas.register.body.validate(invalidData);

      // Assert
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain("username");
    });

    it("should reject invalid gender value", () => {
      // Arrange
      const invalidData = {
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
        gender: "invalid-gender",
      };

      // Act
      const { error } = authSchemas.register.body.validate(invalidData);

      // Assert
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain("gender");
    });
  });

  describe("login schema", () => {
    it("should validate valid login data", () => {
      // Arrange
      const validData = {
        email: "test@example.com",
        password: "Password123!",
      };

      // Act
      const { error, value } = authSchemas.login.body.validate(validData);

      // Assert
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it("should reject missing email", () => {
      // Arrange
      const invalidData = {
        password: "Password123!",
      };

      // Act
      const { error } = authSchemas.login.body.validate(invalidData);

      // Assert
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain("email");
    });

    it("should reject missing password", () => {
      // Arrange
      const invalidData = {
        email: "test@example.com",
      };

      // Act
      const { error } = authSchemas.login.body.validate(invalidData);

      // Assert
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain("password");
    });
  });

  describe("resetPassword schema", () => {
    it("should validate valid reset password data", () => {
      // Arrange
      const validData = {
        token: "valid-reset-token",
        password: "NewPassword123!",
      };

      // Act
      const { error, value } =
        authSchemas.resetPassword.body.validate(validData);

      // Assert
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it("should reject missing token", () => {
      // Arrange
      const invalidData = {
        password: "NewPassword123!",
      };

      // Act
      const { error } = authSchemas.resetPassword.body.validate(invalidData);

      // Assert
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain("token");
    });
  });

  // Tests for other schemas...
});
