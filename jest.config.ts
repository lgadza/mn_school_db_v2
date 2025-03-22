/**
 * Simplified Jest configuration
 */
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Direct module mapping without using pathsToModuleNameMapper
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  testMatch: ["**/__tests__/**/*.test.(ts|js)"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],

  // Project definition is simplified
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/src/__tests__/unit/**/*.test.ts"],
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/src/__tests__/integration/**/*.test.ts"],
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/src/__tests__/e2e/**/*.test.ts"],
    },
  ],
};

export default config;
