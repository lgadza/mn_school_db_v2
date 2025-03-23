import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test or .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = process.env.NODE_ENV || "test";

// Set up global Jest hooks
beforeAll(() => {
  console.log("Starting tests in environment:", process.env.NODE_ENV);
  jest.setTimeout(30000); // 30 second timeout
});

afterAll(() => {
  console.log("Tests completed");
});

// Test setup file for Jest

// Mock pg module more comprehensively to prevent pgPass errors
jest.mock("pg", () => {
  const mockClient = {
    connect: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => Promise.resolve({ rows: [] })),
    end: jest.fn(() => Promise.resolve()),
    release: jest.fn(),
    on: jest.fn(),
    // Add additional mock methods to prevent pgPass errors
    _checkPgPass: jest.fn(() => Promise.resolve()),
    _handleAuthSASL: jest.fn(() => Promise.resolve()),
  };

  const mPool = {
    connect: jest.fn(() =>
      Promise.resolve({
        query: jest.fn(() => Promise.resolve({ rows: [] })),
        release: jest.fn(),
      })
    ),
    end: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => Promise.resolve({ rows: [] })),
    on: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mPool),
    Client: jest.fn(() => mockClient),
  };
});

// Mock database connection for tests
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

// Store any DB connections that need to be closed
const connections: any[] = [];

// Global function to register connections for cleanup
(global as any).__REGISTER_CONNECTION__ = (conn: any) => {
  if (conn) connections.push(conn);
};

// Global teardown - run after all tests
afterAll(async () => {
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

  // Add a longer delay to ensure all handles can properly close
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Force cleanup any potentially lingering connections before Jest tears down
// This helps prevent the "import after environment torn down" errors
beforeEach(() => {
  // Ensure mock connection methods are reset
  jest.clearAllMocks();
});

// Add more Jest-specific test setup as needed
