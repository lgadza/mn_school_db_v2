/**
 * Helper functions for testing
 */

/**
 * Mock all external dependencies for a service test
 */
export function mockAuthDependencies() {
  // Mock external utilities
  jest.mock("@/common/utils/auth/jwt", () => ({
    __esModule: true,
    TokenType: {
      ACCESS: "access",
      REFRESH: "refresh",
      EMAIL_VERIFICATION: "email_verification",
      PASSWORD_RESET: "password_reset",
    },
    default: {
      generateTokenPair: jest.fn(),
      generateSecureToken: jest.fn(),
      verifyToken: jest.fn(),
      revokeToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
    },
  }));

  jest.mock("@/common/utils/security/encryptionUtil", () => ({
    __esModule: true,
    default: {
      generateSecureToken: jest.fn(),
      hashPassword: jest.fn(),
      comparePasswords: jest.fn(),
    },
  }));

  jest.mock("@/common/utils/email/emailUtil", () => ({
    __esModule: true,
    default: {
      sendWelcomeEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    },
  }));

  jest.mock("@/common/utils/logging/logger", () => ({
    __esModule: true,
    default: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  }));
}
