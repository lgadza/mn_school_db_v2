import dotenv from "dotenv";
import path from "path";

// Prevent process.exit from actually exiting during tests
const realProcessExit = process.exit;
process.exit = ((code?: number) => {
  console.warn(`[MOCK] process.exit(${code}) called - prevented during tests`);
  return undefined as never;
}) as typeof process.exit;

// Load environment variables from .env.test or .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = process.env.NODE_ENV || "test";

// Set REDIS_URL for testing to prevent process.exit
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Mock database connection for tests
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

// Setup for tests
console.log("Starting tests in environment:", process.env.NODE_ENV);
jest.setTimeout(30000); // 30 second timeout

// Set up mocks before any imports can run - ORDER MATTERS HERE
// First, mock the model definition packages
jest.mock("sequelize", () => {
  const { MockModel, DataTypes } = require("../__tests__/mocks/sequelize.mock");

  return {
    Model: MockModel,
    DataTypes,
    Op: {
      in: Symbol("in"),
      iLike: Symbol("iLike"),
      or: Symbol("or"),
      gte: Symbol("gte"),
      lte: Symbol("lte"),
      and: Symbol("and"),
      not: Symbol("not"),
      eq: Symbol("eq"),
      ne: Symbol("ne"),
    },
    ValidationError: Error,
    UniqueConstraintError: Error,
  };
});

// Then mock the database configuration and modules
jest.mock(
  "@/config/redis",
  () => require("../__tests__/mocks/config-redis.mock"),
  { virtual: true }
);

jest.mock(
  "@/config/database",
  () => require("../__tests__/mocks/sequelize.mock"),
  { virtual: true }
);

// Also directly mock the models
jest.mock("@/features/users/model", () => {
  const { MockModel } = require("../__tests__/mocks/sequelize.mock");
  return MockModel;
});

jest.mock("@/features/rbac/models/roles.model", () => {
  const { MockModel } = require("../__tests__/mocks/sequelize.mock");
  return MockModel;
});

jest.mock("@/features/users/user-role.model", () => {
  const { MockModel } = require("../__tests__/mocks/sequelize.mock");
  return MockModel;
});

jest.mock("@/features/rbac/models/permissions.model", () => {
  const { MockModel } = require("../__tests__/mocks/sequelize.mock");
  return MockModel;
});

// Mock pg module to prevent connection attempts
jest.mock("pg", () => {
  // Create mock pg client
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ rows: [] }),
    end: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
    on: jest.fn(),
    once: jest.fn(), // Make sure this is defined
  };

  // Create mock pool
  const mockPool = {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
      once: jest.fn(), // Make sure this is defined
    }),
    end: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ rows: [] }),
    on: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mockPool),
    Client: jest.fn(() => mockClient),
  };
});

// Mock ioredis
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    once: jest.fn(), // Make sure this is defined
  }));
});

// Store any DB connections that need to be closed
const connections: any[] = [];

// Global function to register connections for cleanup
(global as any).__REGISTER_CONNECTION__ = (conn: any) => {
  if (conn) connections.push(conn);
};

// Global teardown function that tests can call if needed
(global as any).__CLEANUP_CONNECTIONS__ = async () => {
  // Close any open connections with better error handling
  await Promise.all(
    connections.map(async (conn) => {
      if (!conn) return null;

      try {
        // First try standard methods
        if (typeof conn.end === "function") {
          return await conn.end();
        } else if (typeof conn.close === "function") {
          return await conn.close();
        } else if (typeof conn.disconnect === "function") {
          return await conn.disconnect();
        } else if (typeof conn.destroy === "function") {
          return await conn.destroy();
        }
      } catch (err) {
        console.error("Error closing connection:", err);
      }
      return null;
    })
  );

  // Clear the connections array
  connections.length = 0;
};

// Global teardown function
afterAll(async () => {
  // Restore original process.exit
  process.exit = realProcessExit;
});
