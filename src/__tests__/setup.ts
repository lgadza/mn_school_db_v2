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
